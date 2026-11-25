import { describe, expect, jest, test } from "@jest/globals";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import packageJson from "../package.json";

const {
  DEFAULT_SOURCE_URL,
  downloadRepositoryMetrics,
  getExpectedRepositorySlugs,
  prepareRepositoryMetrics,
  readMetricsUrl,
  validateRepositoryMetricsAggregate,
  validateRepositoryMetricsSource,
} = require("../scripts/prepare-repository-metrics");
const {
  EMPTY_REPOSITORY_METRICS,
  ensureRepositoryMetricsFile,
  synchronizeRepositoryMetricsFiles,
} = require("../scripts/ensure-repository-metrics");

const now = new Date("2026-11-11T12:00:00.000Z");
const generatedAt = "2026-11-11T00:00:00.000Z";
const updatedOn = "2026-11-10T00:00:00.000Z";
const expectedRepositories = ["example/one", "example/two"];

function serialize(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function validAggregate() {
  return {
    schemaVersion: 2,
    generatedAt,
    repositories: {
      "example/one": { stars: 1 },
      "example/two": { stars: 2 },
    },
  };
}

function legacyAggregate() {
  return {
    schemaVersion: 1,
    generatedAt,
    repositories: {
      "example/one": {
        stars: 1,
        forks: 2,
        updatedOn,
      },
      "example/two": {
        stars: 2,
        forks: 3,
        updatedOn,
      },
    },
  };
}

describe("repository metrics release preparation", () => {
  test("normalizes website repositories and skips extension entries", () => {
    expect(
      getExpectedRepositorySlugs([
        { source: "https://github.com/Example/One" },
        {
          source:
            "https://github.com/example/one/blob/main/samples/azure.yaml",
        },
        { source: "https://www.github.com/example/two.git/" },
        {
          source:
            "https://github.com/example/agent/blob/main/azure.yaml",
          templateType: "extension.ai.agent",
        },
      ])
    ).toEqual(["example/one", "example/two"]);
  });

  test("accepts a stars-only aggregate and returns only approved fields", () => {
    expect(
      validateRepositoryMetricsAggregate(
        validAggregate(),
        expectedRepositories,
        { now, maxAgeHours: 48 }
      )
    ).toEqual(validAggregate());
  });

  test("normalizes a legacy aggregate to the stars-only schema", () => {
    expect(
      validateRepositoryMetricsAggregate(
        legacyAggregate(),
        expectedRepositories,
        { now }
      )
    ).toEqual(validAggregate());
  });

  test("rejects legacy data when schema v2 is required", () => {
    expect(() =>
      validateRepositoryMetricsAggregate(
        legacyAggregate(),
        expectedRepositories,
        {
          now,
          allowLegacySchema: false,
        }
      )
    ).toThrow("schemaVersion");
  });

  test("rejects incomplete data when full coverage is required", () => {
    const aggregate = validAggregate();
    delete aggregate.repositories["example/two"];

    expect(() =>
      validateRepositoryMetricsAggregate(
        aggregate,
        expectedRepositories,
        {
          now,
          rejectMissingRepositories: true,
        }
      )
    ).toThrow("missing current templates");
  });

  test("warns instead of rejecting stale repository metrics", () => {
    const aggregate = validAggregate();
    aggregate.generatedAt = "2026-11-09T11:59:59.999Z";
    const warnings: string[] = [];

    expect(
      validateRepositoryMetricsAggregate(
        aggregate,
        expectedRepositories,
        {
          now,
          maxAgeHours: 48,
          onWarning: (warning: string) => warnings.push(warning),
        }
      )
    ).toEqual(aggregate);
    expect(warnings).toEqual([
      expect.stringContaining("stale"),
    ]);
  });

  test("rejects stale repository metrics when freshness is required", () => {
    const aggregate = validAggregate();
    aggregate.generatedAt = "2026-11-09T11:59:59.999Z";

    expect(() =>
      validateRepositoryMetricsAggregate(
        aggregate,
        expectedRepositories,
        {
          now,
          maxAgeHours: 48,
          rejectStale: true,
        }
      )
    ).toThrow("stale");
  });

  test.each([
    [
      "generatedAt",
      (aggregate: any) => {
        aggregate.generatedAt = "2026-11-11T12:00:00.001Z";
      },
    ],
    [
      "legacy updatedOn",
      (aggregate: any) => {
        aggregate.repositories["example/one"].updatedOn =
          "2026-11-11T12:00:00.001Z";
      },
    ],
  ])("rejects a future %s timestamp", (_field, mutate) => {
    const aggregate =
      _field === "legacy updatedOn"
        ? legacyAggregate()
        : validAggregate();
    mutate(aggregate);

    expect(() =>
      validateRepositoryMetricsAggregate(
        aggregate,
        expectedRepositories,
        { now }
      )
    ).toThrow("future");
  });

  test("warns for catalog drift and filters retired repositories", () => {
    const aggregate = validAggregate();
    delete aggregate.repositories["example/two"];
    aggregate.repositories["example/retired"] = { stars: 3 };
    const warnings: string[] = [];

    expect(
      validateRepositoryMetricsAggregate(
        aggregate,
        expectedRepositories,
        {
          now,
          onWarning: (warning: string) => warnings.push(warning),
        }
      )
    ).toEqual({
      schemaVersion: 2,
      generatedAt,
      repositories: {
        "example/one": { stars: 1 },
      },
    });
    expect(warnings).toEqual([
      expect.stringContaining("missing"),
      expect.stringContaining("retired"),
    ]);
  });

  test.each([
    [
      "wrong schema",
      (aggregate: any) => {
        aggregate.schemaVersion = 3;
      },
    ],
    [
      "fractional stars",
      (aggregate: any) => {
        aggregate.repositories["example/one"].stars = 1.5;
      },
    ],
    [
      "author email",
      (aggregate: any) => {
        aggregate.repositories["example/one"].email =
          "author@example.com";
      },
    ],
    [
      "top-level backend data",
      (aggregate: any) => {
        aggregate.storageAccount = "private";
      },
    ],
    [
      "retired repository data",
      (aggregate: any) => {
        aggregate.repositories["example/retired"] = {
          stars: 3,
          email: "author@example.com",
        };
      },
    ],
  ])("rejects malformed data: %s", (_description, mutate) => {
    const aggregate = validAggregate();
    mutate(aggregate);

    expect(() =>
      validateRepositoryMetricsAggregate(
        aggregate,
        expectedRepositories,
        { now }
      )
    ).toThrow();
  });

  test("requires a public, credential-free HTTPS JSON URL", () => {
    expect(
      readMetricsUrl(
        "https://cache.example.net/awesome-azd-repository-metrics.json"
      )
    ).toBe(
      "https://cache.example.net/awesome-azd-repository-metrics.json"
    );
    expect(DEFAULT_SOURCE_URL).toBe(
      "https://cachelp6qsotirqelc.z20.web.core.windows.net/awesome-azd-repository-stars.json"
    );

    expect(() =>
      readMetricsUrl("http://cache.example.net/metrics.json")
    ).toThrow("HTTPS");
    expect(() =>
      readMetricsUrl("https://cache.example.net/metrics.json?sig=secret")
    ).toThrow("credential-free");
  });

  test("downloads JSON without credentials or redirects", async () => {
    const aggregate = validAggregate();
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) =>
          name === "content-type"
            ? "application/json; charset=utf-8"
            : null,
      },
      body: null,
      text: async () => JSON.stringify(aggregate),
    }));

    await expect(
      downloadRepositoryMetrics(
        "https://cache.example.net/repository-metrics.json",
        fetchImpl
      )
    ).resolves.toEqual(aggregate);

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://cache.example.net/repository-metrics.json",
      expect.objectContaining({
        headers: {
          Accept: "application/json",
          "User-Agent": "Azure-awesome-azd-release",
        },
        redirect: "error",
      })
    );
  });

  test("validates a fresh live source without writing a snapshot", async () => {
    const directory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "awesome-azd-metrics-")
    );
    const catalogPath = path.join(directory, "templates.json");
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) =>
          name === "content-type" ? "application/json" : null,
      },
      body: null,
      text: async () => JSON.stringify(validAggregate()),
    }));

    try {
      await fs.promises.writeFile(
        catalogPath,
        JSON.stringify([
          { source: "https://github.com/example/one" },
          { source: "https://github.com/example/two" },
        ])
      );

      await expect(
        validateRepositoryMetricsSource({
          catalogPath,
          sourceUrl:
            "https://cache.example.net/repository-metrics.json",
          fetchImpl,
          now,
          maxAgeHours: 48,
          onWarning: () => {},
        })
      ).resolves.toEqual({
        generatedAt,
        repositoryCount: 2,
      });
      expect(await fs.promises.readdir(directory)).toEqual([
        "templates.json",
      ]);
    } finally {
      await fs.promises.rm(directory, {
        recursive: true,
        force: true,
      });
    }
  });

  test.each([
    [
      "legacy schema",
      () => legacyAggregate(),
      "schemaVersion",
    ],
    [
      "incomplete coverage",
      () => {
        const aggregate = validAggregate();
        delete aggregate.repositories["example/two"];
        return aggregate;
      },
      "missing current templates",
    ],
  ])(
    "rejects live source data with %s",
    async (_description, aggregateFactory, expectedError) => {
      const directory = await fs.promises.mkdtemp(
        path.join(os.tmpdir(), "awesome-azd-metrics-")
      );
      const catalogPath = path.join(directory, "templates.json");
      const fetchImpl = jest.fn(async () => ({
        ok: true,
        status: 200,
        headers: {
          get: (name: string) =>
            name === "content-type" ? "application/json" : null,
        },
        body: null,
        text: async () => JSON.stringify(aggregateFactory()),
      }));

      try {
        await fs.promises.writeFile(
          catalogPath,
          JSON.stringify([
            { source: "https://github.com/example/one" },
            { source: "https://github.com/example/two" },
          ])
        );

        await expect(
          validateRepositoryMetricsSource({
            catalogPath,
            sourceUrl:
              "https://cache.example.net/repository-metrics.json",
            fetchImpl,
            now,
            maxAgeHours: 48,
            onWarning: () => {},
          })
        ).rejects.toThrow(expectedError);
      } finally {
        await fs.promises.rm(directory, {
          recursive: true,
          force: true,
        });
      }
    }
  );

  test("creates an empty schema v2 fallback without overwriting existing metrics", async () => {
    const directory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "awesome-azd-metrics-")
    );
    const outputPath = path.join(directory, "repository-metrics.json");

    try {
      await expect(
        ensureRepositoryMetricsFile(outputPath)
      ).resolves.toBe(true);
      await expect(
        fs.promises.readFile(outputPath, "utf8")
      ).resolves.toBe(serialize(EMPTY_REPOSITORY_METRICS));

      const existing = JSON.stringify(validAggregate());
      await fs.promises.writeFile(outputPath, existing);
      await expect(
        ensureRepositoryMetricsFile(outputPath)
      ).resolves.toBe(false);
      await expect(
        fs.promises.readFile(outputPath, "utf8")
      ).resolves.toBe(existing);
    } finally {
      await fs.promises.rm(directory, {
        recursive: true,
        force: true,
      });
    }
  });

  test("copies the bundled fallback to the public snapshot", async () => {
    const directory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "awesome-azd-metrics-")
    );
    const modulePath = path.join(
      directory,
      "src",
      "repository-metrics.generated.json"
    );
    const publicPath = path.join(
      directory,
      "static",
      "repository-metrics.json"
    );

    try {
      await fs.promises.mkdir(path.dirname(modulePath), {
        recursive: true,
      });
      await fs.promises.writeFile(
        modulePath,
        serialize(validAggregate())
      );

      await expect(
        synchronizeRepositoryMetricsFiles(modulePath, publicPath)
      ).resolves.toBe(false);
      await expect(
        fs.promises.readFile(publicPath, "utf8")
      ).resolves.toBe(serialize(validAggregate()));
    } finally {
      await fs.promises.rm(directory, {
        recursive: true,
        force: true,
      });
    }
  });

  test("generates the fallback before source-loading npm entry points", () => {
    for (const command of [
      "docusaurus",
      "start",
      "build",
      "deploy",
      "test",
      "typecheck",
    ]) {
      const preCommand =
        `pre${command}` as keyof typeof packageJson.scripts;
      expect(packageJson.scripts[preCommand]).toBe(
        "node scripts/ensure-repository-metrics.js"
      );
    }
  });

  test("writes validated metrics to the public asset and build module", async () => {
    const directory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "awesome-azd-metrics-")
    );
    const catalogPath = path.join(directory, "templates.json");
    const outputPath = path.join(
      directory,
      "static",
      "repository-metrics.json"
    );
    const moduleOutputPath = path.join(
      directory,
      "src",
      "repository-metrics.generated.json"
    );
    const aggregate = validAggregate();
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) =>
          name === "content-type" ? "application/json" : null,
      },
      body: null,
      text: async () => JSON.stringify(aggregate),
    }));

    try {
      await fs.promises.writeFile(
        catalogPath,
        JSON.stringify([
          { source: "https://github.com/example/one" },
          { source: "https://github.com/example/two" },
        ])
      );

      await expect(
        prepareRepositoryMetrics({
          catalogPath,
          outputPath,
          moduleOutputPath,
          sourceUrl:
            "https://cache.example.net/repository-metrics.json",
          fallbackUrl: null,
          fetchImpl,
          now,
          onWarning: () => {},
        })
      ).resolves.toEqual({
        outputPath,
        moduleOutputPath,
        repositoryCount: 2,
      });

      for (const generatedPath of [outputPath, moduleOutputPath]) {
        await expect(
          fs.promises.readFile(generatedPath, "utf8")
        ).resolves.toBe(serialize(aggregate));
      }
    } finally {
      await fs.promises.rm(directory, {
        recursive: true,
        force: true,
      });
    }
  });

  test.each([
    [
      "stale",
      () => {
        const aggregate = validAggregate();
        aggregate.generatedAt = "2026-11-09T11:59:59.999Z";
        return aggregate;
      },
    ],
    [
      "incomplete",
      () => {
        const aggregate = validAggregate();
        delete aggregate.repositories["example/two"];
        return aggregate;
      },
    ],
    ["legacy", () => legacyAggregate()],
  ])("does not replace the bundled snapshot with %s live data", async (
    _description: string,
    aggregateFactory: () => any
  ) => {
    const directory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "awesome-azd-metrics-")
    );
    const catalogPath = path.join(directory, "templates.json");
    const outputPath = path.join(directory, "repository-metrics.json");
    const moduleOutputPath = path.join(
      directory,
      "repository-metrics.generated.json"
    );
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) =>
          name === "content-type" ? "application/json" : null,
      },
      body: null,
      text: async () => JSON.stringify(aggregateFactory()),
    }));

    try {
      await fs.promises.writeFile(
        catalogPath,
        JSON.stringify([
          { source: "https://github.com/example/one" },
          { source: "https://github.com/example/two" },
        ])
      );
      await fs.promises.writeFile(
        moduleOutputPath,
        serialize(validAggregate())
      );

      await expect(
        prepareRepositoryMetrics({
          catalogPath,
          outputPath,
          moduleOutputPath,
          sourceUrl:
            "https://cache.example.net/repository-metrics.json",
          fetchImpl,
          now,
          onWarning: () => {},
          requireRemoteMetrics: true,
        })
      ).rejects.toThrow(
        "configured remote source"
      );
      expect(fetchImpl).toHaveBeenCalledTimes(1);
      await expect(
        fs.promises.access(outputPath)
      ).rejects.toMatchObject({ code: "ENOENT" });
      await expect(
        fs.promises.readFile(moduleOutputPath, "utf8")
      ).resolves.toBe(serialize(validAggregate()));
    } finally {
      await fs.promises.rm(directory, {
        recursive: true,
        force: true,
      });
    }
  });

  test("fails a snapshot update when the live backend is unavailable", async () => {
    const directory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "awesome-azd-metrics-")
    );
    const catalogPath = path.join(directory, "templates.json");
    const outputPath = path.join(directory, "repository-metrics.json");
    const moduleOutputPath = path.join(
      directory,
      "repository-metrics.generated.json"
    );
    const fetchImpl = jest.fn(async () => ({
      ok: false,
      status: 503,
      headers: { get: () => null },
    }));

    try {
      await fs.promises.writeFile(
        catalogPath,
        JSON.stringify([
          { source: "https://github.com/example/one" },
          { source: "https://github.com/example/two" },
        ])
      );
      await fs.promises.writeFile(
        moduleOutputPath,
        JSON.stringify(validAggregate())
      );

      await expect(
        prepareRepositoryMetrics({
          catalogPath,
          outputPath,
          moduleOutputPath,
          sourceUrl:
            "https://cache.example.net/repository-metrics.json",
          fetchImpl,
          now,
          onWarning: () => {},
          requireRemoteMetrics: true,
        })
      ).rejects.toThrow(
        "configured remote source"
      );
      expect(fetchImpl).toHaveBeenCalledTimes(1);
      await expect(
        fs.promises.access(outputPath)
      ).rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      await fs.promises.rm(directory, {
        recursive: true,
        force: true,
      });
    }
  });
});

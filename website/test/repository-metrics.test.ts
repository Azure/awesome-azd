import { describe, expect, jest, test } from "@jest/globals";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const {
  downloadRepositoryMetrics,
  getExpectedRepositorySlugs,
  prepareRepositoryMetrics,
  readMetricsUrl,
  validateRepositoryMetricsAggregate,
} = require("../scripts/prepare-repository-metrics");
const {
  EMPTY_REPOSITORY_METRICS,
  ensureRepositoryMetricsFile,
} = require("../scripts/ensure-repository-metrics");

const now = new Date("2026-11-11T12:00:00.000Z");
const generatedAt = "2026-11-11T00:00:00.000Z";
const updatedOn = "2026-11-10T00:00:00.000Z";
const expectedRepositories = ["example/one", "example/two"];

function repositoryMetrics(stars: number) {
  return {
    stars,
    forks: stars + 1,
    updatedOn,
  };
}

function validAggregate() {
  return {
    schemaVersion: 1,
    generatedAt,
    repositories: {
      "example/one": repositoryMetrics(1),
      "example/two": repositoryMetrics(2),
    },
  };
}

describe("repository metrics release preparation", () => {
  test("normalizes and deduplicates every repository in templates.json", () => {
    expect(
      getExpectedRepositorySlugs([
        { source: "https://github.com/Example/One" },
        {
          source:
            "https://github.com/example/one/blob/main/samples/azure.yaml",
          templateType: "extension.ai.agent",
        },
        { source: "https://www.github.com/example/two.git/" },
      ])
    ).toEqual(["example/one", "example/two"]);
  });

  test("accepts a complete, fresh aggregate and returns only approved fields", () => {
    expect(
      validateRepositoryMetricsAggregate(
        validAggregate(),
        expectedRepositories,
        { now, maxAgeHours: 48 }
      )
    ).toEqual(validAggregate());
  });

  test("rejects stale repository metrics", () => {
    const aggregate = validAggregate();
    aggregate.generatedAt = "2026-11-09T11:59:59.999Z";

    expect(() =>
      validateRepositoryMetricsAggregate(aggregate, expectedRepositories, {
        now,
        maxAgeHours: 48,
      })
    ).toThrow("stale");
  });

  test.each([
    ["generatedAt", (aggregate: any) => {
      aggregate.generatedAt = "2026-11-11T12:00:00.001Z";
    }],
    ["updatedOn", (aggregate: any) => {
      aggregate.repositories["example/one"].updatedOn =
        "2026-11-11T12:00:00.001Z";
    }],
  ])("rejects a future %s timestamp", (_field, mutate) => {
    const aggregate = validAggregate();
    mutate(aggregate);

    expect(() =>
      validateRepositoryMetricsAggregate(aggregate, expectedRepositories, {
        now,
      })
    ).toThrow("future");
  });

  test("rejects missing and unexpected repositories", () => {
    const missing = validAggregate();
    delete missing.repositories["example/two"];
    expect(() =>
      validateRepositoryMetricsAggregate(missing, expectedRepositories, {
        now,
      })
    ).toThrow("missing: example/two");

    const unexpected = validAggregate();
    unexpected.repositories["example/three"] = repositoryMetrics(3);
    expect(() =>
      validateRepositoryMetricsAggregate(unexpected, expectedRepositories, {
        now,
      })
    ).toThrow("unexpected: example/three");
  });

  test.each([
    ["wrong schema", (aggregate: any) => {
      aggregate.schemaVersion = 2;
    }],
    ["fractional stars", (aggregate: any) => {
      aggregate.repositories["example/one"].stars = 1.5;
    }],
    ["negative forks", (aggregate: any) => {
      aggregate.repositories["example/one"].forks = -1;
    }],
    ["non-canonical date", (aggregate: any) => {
      aggregate.repositories["example/one"].updatedOn =
        "2026-11-10T00:00:00Z";
    }],
  ])("rejects malformed data: %s", (_description, mutate) => {
    const aggregate = validAggregate();
    mutate(aggregate);

    expect(() =>
      validateRepositoryMetricsAggregate(aggregate, expectedRepositories, {
        now,
      })
    ).toThrow();
  });

  test.each([
    ["top-level backend data", (aggregate: any) => {
      aggregate.storageAccount = "private";
    }],
    ["author email", (aggregate: any) => {
      aggregate.repositories["example/one"].email = "author@example.com";
    }],
    ["legacy score", (aggregate: any) => {
      aggregate.repositories["example/one"].score = 10;
    }],
  ])("rejects unapproved fields at the privacy boundary: %s", (_field, mutate) => {
    const aggregate = validAggregate();
    mutate(aggregate);

    expect(() =>
      validateRepositoryMetricsAggregate(aggregate, expectedRepositories, {
        now,
      })
    ).toThrow("unexpected");
  });

  test("requires a public, credential-free HTTPS JSON URL", () => {
    expect(
      readMetricsUrl(
        "https://cache.example.net/awesome-azd-repository-metrics.json"
      )
    ).toBe(
      "https://cache.example.net/awesome-azd-repository-metrics.json"
    );

    expect(() =>
      readMetricsUrl("http://cache.example.net/metrics.json")
    ).toThrow("HTTPS");
    expect(() =>
      readMetricsUrl("https://cache.example.net/metrics.json?sig=secret")
    ).toThrow("public URL");
  });

  test("downloads JSON without credentials or redirects", async () => {
    const aggregate = validAggregate();
    const fetchImpl = jest.fn(async (_url, options) => ({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) =>
          name === "content-type" ? "application/json; charset=utf-8" : null,
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

  test("creates an empty generated fallback without overwriting existing metrics", async () => {
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
      ).resolves.toBe(`${JSON.stringify(EMPTY_REPOSITORY_METRICS)}\n`);

      const existing = JSON.stringify(validAggregate());
      await fs.promises.writeFile(outputPath, existing);
      await expect(
        ensureRepositoryMetricsFile(outputPath)
      ).resolves.toBe(false);
      await expect(
        fs.promises.readFile(outputPath, "utf8")
      ).resolves.toBe(existing);
    } finally {
      await fs.promises.rm(directory, { recursive: true, force: true });
    }
  });

  test("writes validated metrics to both the public asset and build module", async () => {
    const directory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "awesome-azd-metrics-")
    );
    const catalogPath = path.join(directory, "templates.json");
    const outputPath = path.join(directory, "static", "repository-metrics.json");
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
          sourceUrl: "https://cache.example.net/repository-metrics.json",
          fetchImpl,
          now,
        })
      ).resolves.toEqual({
        outputPath,
        moduleOutputPath,
        repositoryCount: 2,
      });

      for (const generatedPath of [outputPath, moduleOutputPath]) {
        await expect(
          fs.promises.readFile(generatedPath, "utf8")
        ).resolves.toBe(`${JSON.stringify(aggregate)}\n`);
      }
    } finally {
      await fs.promises.rm(directory, { recursive: true, force: true });
    }
  });
});

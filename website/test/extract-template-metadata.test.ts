import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import { EventEmitter } from "events";

// ---------------------------------------------------------------------------
// Mock the https module — all HTTP calls are intercepted
// ---------------------------------------------------------------------------
jest.mock("https", () => ({
  request: jest.fn(),
}));

const https = require("https") as any;

const {
  parseRepoUrl,
  fetchGitHubApi,
  fetchAzureYaml,
  fetchReadmeTitle,
  extractMetadata,
  LANGUAGE_MAP,
  AZURE_SERVICE_MAP,
  MICROSOFT_ORGS,
} = require("../scripts/extract-template-metadata");

// ---------------------------------------------------------------------------
// Helper — wire up a mock https.request that returns predetermined responses
// keyed by "hostname + path".
// ---------------------------------------------------------------------------
type MockEntry = { status: number; body?: string };

function setupMock(responses: Record<string, MockEntry>) {
  https.request.mockImplementation((opts: any, callback: Function) => {
    const key = `${opts.hostname}${opts.path}`;

    let matched: MockEntry | undefined;

    // Try exact match first
    if (responses[key]) {
      matched = responses[key];
    } else {
      // Fall back to substring match — longest pattern first so
      // "/repos/o/r/languages" beats "/repos/o/r" when both are present.
      const sorted = Object.keys(responses).sort(
        (a, b) => b.length - a.length
      );
      for (const pattern of sorted) {
        if (key.includes(pattern)) {
          matched = responses[pattern];
          break;
        }
      }
    }
    if (!matched) matched = { status: 404 };

    const res = new EventEmitter() as any;
    res.statusCode = matched.status;
    res.resume = jest.fn();

    const data = matched.body;
    const status = matched.status;

    process.nextTick(() => {
      callback(res);
      if (status === 200 && data !== undefined) {
        res.emit("data", Buffer.from(data));
      }
      res.emit("end");
    });

    const req = new EventEmitter() as any;
    req.end = jest.fn();
    req.destroy = jest.fn();
    return req;
  });
}

/**
 * Helper — mock https.request so that the *request* object emits an error
 * (simulates a network failure / timeout before a response is received).
 */
function setupMockError(errorMessage: string) {
  https.request.mockImplementation((_opts: any, _callback: Function) => {
    const req = new EventEmitter() as any;
    req.end = jest.fn();
    req.destroy = jest.fn();
    process.nextTick(() => req.emit("error", new Error(errorMessage)));
    return req;
  });
}

/**
 * Helper — mock https.request to trigger the timeout event.
 */
function setupMockTimeout() {
  https.request.mockImplementation((_opts: any, _callback: Function) => {
    const req = new EventEmitter() as any;
    req.end = jest.fn();
    req.destroy = jest.fn();
    process.nextTick(() => req.emit("timeout"));
    return req;
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.GITHUB_TOKEN;
});

// ===========================================================================
// parseRepoUrl
// ===========================================================================
describe("parseRepoUrl", () => {
  test("parses a standard GitHub URL", () => {
    const result = parseRepoUrl(
      "https://github.com/Azure-Samples/todo-python-mongo"
    );
    expect(result).toEqual({
      owner: "Azure-Samples",
      repo: "todo-python-mongo",
    });
  });

  test("strips trailing .git suffix", () => {
    const result = parseRepoUrl(
      "https://github.com/Azure-Samples/todo-python-mongo.git"
    );
    expect(result.repo).toBe("todo-python-mongo");
  });

  test("strips trailing slash", () => {
    const result = parseRepoUrl(
      "https://github.com/Azure-Samples/todo-python-mongo/"
    );
    expect(result.repo).toBe("todo-python-mongo");
  });

  test("throws on non-HTTPS URL", () => {
    expect(() =>
      parseRepoUrl("http://github.com/Azure-Samples/todo-python-mongo")
    ).toThrow(/HTTPS/);
  });

  test("throws on non-GitHub URL", () => {
    expect(() =>
      parseRepoUrl("https://gitlab.com/user/repo")
    ).toThrow(/Only GitHub/);
  });

  test("throws on URL without owner/repo path", () => {
    expect(() => parseRepoUrl("https://github.com/")).toThrow();
  });

  test("throws on URL with only owner", () => {
    expect(() =>
      parseRepoUrl("https://github.com/Azure-Samples")
    ).toThrow();
  });

  test("throws on completely invalid URL", () => {
    expect(() => parseRepoUrl("not-a-url")).toThrow();
  });

  test("throws on private/local URL", () => {
    expect(() =>
      parseRepoUrl("https://localhost/owner/repo")
    ).toThrow(/private/);
  });

  test("handles URL with sub-paths (only first two segments used)", () => {
    const result = parseRepoUrl(
      "https://github.com/Azure-Samples/todo-python-mongo/tree/main"
    );
    expect(result).toEqual({
      owner: "Azure-Samples",
      repo: "todo-python-mongo",
    });
  });
});

// ===========================================================================
// LANGUAGE_MAP
// ===========================================================================
describe("LANGUAGE_MAP", () => {
  test("maps known GitHub languages to gallery tags", () => {
    expect(LANGUAGE_MAP["Python"]).toBe("python");
    expect(LANGUAGE_MAP["TypeScript"]).toBe("typescript");
    expect(LANGUAGE_MAP["C#"]).toBe("csharp");
    expect(LANGUAGE_MAP["Go"]).toBe("go");
  });

  test("does not contain unmapped languages", () => {
    expect(LANGUAGE_MAP["HTML"]).toBeUndefined();
    expect(LANGUAGE_MAP["CSS"]).toBeUndefined();
    expect(LANGUAGE_MAP["Shell"]).toBeUndefined();
  });
});

// ===========================================================================
// AZURE_SERVICE_MAP
// ===========================================================================
describe("AZURE_SERVICE_MAP", () => {
  test("maps known topics to service tags", () => {
    expect(AZURE_SERVICE_MAP["azure-openai"]).toBe("openai");
    expect(AZURE_SERVICE_MAP["azure-container-apps"]).toBe("aca");
    expect(AZURE_SERVICE_MAP["azure-cosmos-db"]).toBe("cosmosdb");
  });

  test("deduplicates azure-search and azure-ai-search to aisearch", () => {
    expect(AZURE_SERVICE_MAP["azure-search"]).toBe("aisearch");
    expect(AZURE_SERVICE_MAP["azure-ai-search"]).toBe("aisearch");
  });

  test("unknown topics are not in the map", () => {
    expect(AZURE_SERVICE_MAP["react"]).toBeUndefined();
    expect(AZURE_SERVICE_MAP["python"]).toBeUndefined();
  });
});

// ===========================================================================
// MICROSOFT_ORGS
// ===========================================================================
describe("MICROSOFT_ORGS", () => {
  test("includes expected organisations (lowercase)", () => {
    expect(MICROSOFT_ORGS).toContain("azure");
    expect(MICROSOFT_ORGS).toContain("azure-samples");
    expect(MICROSOFT_ORGS).toContain("microsoft");
  });
});

// ===========================================================================
// fetchGitHubApi
// ===========================================================================
describe("fetchGitHubApi", () => {
  const repoBody = JSON.stringify({
    description: "A todo app with Python and MongoDB",
    owner: { login: "Azure-Samples", html_url: "https://github.com/Azure-Samples" },
    topics: ["azure-container-apps", "azure-cosmos-db"],
    default_branch: "main",
  });

  const langBody = JSON.stringify({ Python: 5000, JavaScript: 2000, HTML: 500 });

  test("returns repo data and languages", async () => {
    setupMock({
      "api.github.com/repos/Azure-Samples/todo-python-mongo": {
        status: 200,
        body: repoBody,
      },
      "api.github.com/repos/Azure-Samples/todo-python-mongo/languages": {
        status: 200,
        body: langBody,
      },
    });

    const { repoData, languages } = await fetchGitHubApi(
      "Azure-Samples",
      "todo-python-mongo"
    );
    expect(repoData.description).toBe("A todo app with Python and MongoDB");
    expect(languages.Python).toBe(5000);
  });

  test("returns empty languages when languages endpoint fails", async () => {
    setupMock({
      "api.github.com/repos/Azure-Samples/todo-python-mongo": {
        status: 200,
        body: repoBody,
      },
      // No languages endpoint — will 404
    });

    // Override the mock so that the second call (languages) gets a 404
    const calls: number[] = [];
    https.request.mockImplementation((opts: any, callback: Function) => {
      calls.push(1);
      const isLanguages = opts.path.endsWith("/languages");
      const status = isLanguages ? 404 : 200;
      const body = isLanguages ? "" : repoBody;

      const res = new EventEmitter() as any;
      res.statusCode = status;
      res.resume = jest.fn();

      process.nextTick(() => {
        callback(res);
        if (status === 200) res.emit("data", Buffer.from(body));
        res.emit("end");
      });

      const req = new EventEmitter() as any;
      req.end = jest.fn();
      req.destroy = jest.fn();
      return req;
    });

    const { repoData, languages } = await fetchGitHubApi(
      "Azure-Samples",
      "todo-python-mongo"
    );
    expect(repoData.description).toBe("A todo app with Python and MongoDB");
    expect(languages).toEqual({});
  });

  test("includes Authorization header when GITHUB_TOKEN is set", async () => {
    process.env.GITHUB_TOKEN = "ghp_test123";
    setupMock({
      "api.github.com/repos/owner/repo": {
        status: 200,
        body: JSON.stringify({ description: "test", owner: { login: "owner" } }),
      },
      "api.github.com/repos/owner/repo/languages": {
        status: 200,
        body: "{}",
      },
    });

    await fetchGitHubApi("owner", "repo");

    const firstCallOpts = https.request.mock.calls[0][0];
    expect(firstCallOpts.headers.Authorization).toBe("Bearer ghp_test123");
  });
});

// ===========================================================================
// fetchAzureYaml
// ===========================================================================
describe("fetchAzureYaml", () => {
  const azureYamlContent = [
    "name: todo-python-mongo",
    "services:",
    "  web:",
    "    host: containerapp",
    "    language: python",
    "  api:",
    "    host: appservice",
    "    language: python",
  ].join("\n");

  test("parses azure.yaml from specified branch", async () => {
    setupMock({
      "raw.githubusercontent.com/Azure-Samples/todo-python-mongo/main/azure.yaml": {
        status: 200,
        body: azureYamlContent,
      },
    });

    const result = await fetchAzureYaml(
      "Azure-Samples",
      "todo-python-mongo",
      "main"
    );
    expect(result.name).toBe("todo-python-mongo");
    expect(result.services.web.host).toBe("containerapp");
    expect(result.services.api.host).toBe("appservice");
  });

  test("falls back to master when main fails (no branch specified)", async () => {
    // main → 404, master → 200
    https.request.mockImplementation((opts: any, callback: Function) => {
      const isMain = opts.path.includes("/main/");
      const status = isMain ? 404 : 200;
      const body = isMain ? "" : azureYamlContent;

      const res = new EventEmitter() as any;
      res.statusCode = status;
      res.resume = jest.fn();

      process.nextTick(() => {
        callback(res);
        if (status === 200) res.emit("data", Buffer.from(body));
        res.emit("end");
      });

      const req = new EventEmitter() as any;
      req.end = jest.fn();
      req.destroy = jest.fn();
      return req;
    });

    const result = await fetchAzureYaml(
      "Azure-Samples",
      "todo-python-mongo"
    );
    expect(result.name).toBe("todo-python-mongo");
  });

  test("uses FAILSAFE_SCHEMA — no type coercion", async () => {
    const yamlWithTypes = [
      "name: my-template",
      "version: 1.0",
      "enabled: true",
      "count: 42",
    ].join("\n");

    setupMock({
      "raw.githubusercontent.com/owner/repo/main/azure.yaml": {
        status: 200,
        body: yamlWithTypes,
      },
    });

    const result = await fetchAzureYaml("owner", "repo", "main");
    // FAILSAFE_SCHEMA: everything stays as strings
    expect(result.version).toBe("1.0");
    expect(result.enabled).toBe("true");
    expect(result.count).toBe("42");
    expect(typeof result.version).toBe("string");
    expect(typeof result.enabled).toBe("string");
    expect(typeof result.count).toBe("string");
  });

  test("rejects when both main and master fail", async () => {
    setupMock({}); // all requests 404
    await expect(
      fetchAzureYaml("owner", "repo")
    ).rejects.toThrow(/HTTP 404/);
  });
});

// ===========================================================================
// fetchReadmeTitle
// ===========================================================================
describe("fetchReadmeTitle", () => {
  test("extracts first # heading", async () => {
    setupMock({
      "raw.githubusercontent.com/owner/repo/main/README.md": {
        status: 200,
        body: "# My Awesome Template\n\nSome description here.",
      },
    });

    const title = await fetchReadmeTitle("owner", "repo", "main");
    expect(title).toBe("My Awesome Template");
  });

  test("strips markdown link formatting", async () => {
    setupMock({
      "raw.githubusercontent.com/owner/repo/main/README.md": {
        status: 200,
        body: "# [My Template](https://example.com)\n",
      },
    });

    const title = await fetchReadmeTitle("owner", "repo", "main");
    expect(title).toBe("My Template");
  });

  test("strips emphasis and code markers", async () => {
    setupMock({
      "raw.githubusercontent.com/owner/repo/main/README.md": {
        status: 200,
        body: "# **Bold** and `code` _italic_ title\n",
      },
    });

    const title = await fetchReadmeTitle("owner", "repo", "main");
    expect(title).toBe("Bold and code italic title");
  });

  test("returns empty string when no heading found", async () => {
    setupMock({
      "raw.githubusercontent.com/owner/repo/main/README.md": {
        status: 200,
        body: "No heading here, just plain text.",
      },
    });

    const title = await fetchReadmeTitle("owner", "repo", "main");
    expect(title).toBe("");
  });

  test("falls back to master branch (no branch specified)", async () => {
    https.request.mockImplementation((opts: any, callback: Function) => {
      const isMain = opts.path.includes("/main/");
      const status = isMain ? 404 : 200;
      const body = isMain ? "" : "# Master Title\n";

      const res = new EventEmitter() as any;
      res.statusCode = status;
      res.resume = jest.fn();

      process.nextTick(() => {
        callback(res);
        if (status === 200) res.emit("data", Buffer.from(body));
        res.emit("end");
      });

      const req = new EventEmitter() as any;
      req.end = jest.fn();
      req.destroy = jest.fn();
      return req;
    });

    const title = await fetchReadmeTitle("owner", "repo");
    expect(title).toBe("Master Title");
  });
});

// ===========================================================================
// extractMetadata — integration of all sub-fetches
// ===========================================================================
describe("extractMetadata", () => {
  // Standard mock responses for a "happy path" repo
  const REPO_API = JSON.stringify({
    description: "A todo app with Python and MongoDB",
    owner: {
      login: "Azure-Samples",
      html_url: "https://github.com/Azure-Samples",
    },
    topics: ["azure-container-apps", "azure-openai"],
    default_branch: "main",
  });

  const LANGUAGES_API = JSON.stringify({
    Python: 5000,
    JavaScript: 2000,
    HTML: 500,
  });

  const AZURE_YAML = [
    "name: todo-python-mongo",
    "services:",
    "  web:",
    "    host: containerapp",
    "    language: python",
  ].join("\n");

  const README = "# Todo Python Mongo\n\nA sample template.";

  function setupFullMock(overrides: Record<string, MockEntry> = {}) {
    const defaults: Record<string, MockEntry> = {
      "api.github.com/repos/Azure-Samples/todo-python-mongo": {
        status: 200,
        body: REPO_API,
      },
      "api.github.com/repos/Azure-Samples/todo-python-mongo/languages": {
        status: 200,
        body: LANGUAGES_API,
      },
      "raw.githubusercontent.com/Azure-Samples/todo-python-mongo/main/azure.yaml": {
        status: 200,
        body: AZURE_YAML,
      },
      "raw.githubusercontent.com/Azure-Samples/todo-python-mongo/main/README.md": {
        status: 200,
        body: README,
      },
      "raw.githubusercontent.com/Azure-Samples/todo-python-mongo/main/infra/main.bicep": {
        status: 200,
        body: "",
      },
      "raw.githubusercontent.com/Azure-Samples/todo-python-mongo/main/infra/main.tf": {
        status: 404,
      },
    };

    // Merge overrides
    const merged = { ...defaults, ...overrides };

    https.request.mockImplementation((opts: any, callback: Function) => {
      const key = `${opts.hostname}${opts.path}`;

      let matched: MockEntry | undefined;
      if (merged[key]) {
        matched = merged[key];
      } else {
        const sorted = Object.keys(merged).sort(
          (a, b) => b.length - a.length
        );
        for (const pattern of sorted) {
          if (key.includes(pattern)) {
            matched = merged[pattern];
            break;
          }
        }
      }
      if (!matched) matched = { status: 404 };

      const res = new EventEmitter() as any;
      res.statusCode = matched.status;
      res.resume = jest.fn();
      const data = matched.body;
      const st = matched.status;

      process.nextTick(() => {
        callback(res);
        if (st === 200 && data !== undefined) {
          res.emit("data", Buffer.from(data));
        }
        res.emit("end");
      });

      const req = new EventEmitter() as any;
      req.end = jest.fn();
      req.destroy = jest.fn();
      return req;
    });
  }

  test("full extraction — happy path", async () => {
    setupFullMock();

    const meta = await extractMetadata(
      "https://github.com/Azure-Samples/todo-python-mongo"
    );
    expect(meta.title).toBe("todo-python-mongo");
    expect(meta.description).toBe("A todo app with Python and MongoDB");
    expect(meta.author).toBe("Azure-Samples");
    expect(meta.authorUrl).toBe("https://github.com/Azure-Samples");
    expect(meta.authorType).toBe("Microsoft");
    expect(meta.languages).toEqual(
      expect.arrayContaining(["python", "javascript"])
    );
    expect(meta.languages).not.toContain("html"); // HTML not in LANGUAGE_MAP
    expect(meta.azureServices).toContain("aca");
    expect(meta.azureServices).toContain("openai");
    expect(meta.iacProvider).toBe("Bicep");
    expect(meta.frameworks).toEqual([]);
  });

  test("uses README title when azure.yaml has no name", async () => {
    const azureYamlNoName = "services:\n  web:\n    host: containerapp\n";
    setupFullMock({
      "raw.githubusercontent.com/Azure-Samples/todo-python-mongo/main/azure.yaml": {
        status: 200,
        body: azureYamlNoName,
      },
    });

    const meta = await extractMetadata(
      "https://github.com/Azure-Samples/todo-python-mongo"
    );
    expect(meta.title).toBe("Todo Python Mongo");
  });

  test("detects Terraform when only main.tf exists", async () => {
    setupFullMock({
      "raw.githubusercontent.com/Azure-Samples/todo-python-mongo/main/infra/main.bicep": {
        status: 404,
      },
      "raw.githubusercontent.com/Azure-Samples/todo-python-mongo/main/infra/main.tf": {
        status: 200,
        body: "",
      },
    });

    const meta = await extractMetadata(
      "https://github.com/Azure-Samples/todo-python-mongo"
    );
    expect(meta.iacProvider).toBe("Terraform");
  });

  test("detects Both when bicep and terraform exist", async () => {
    setupFullMock({
      "raw.githubusercontent.com/Azure-Samples/todo-python-mongo/main/infra/main.bicep": {
        status: 200,
        body: "",
      },
      "raw.githubusercontent.com/Azure-Samples/todo-python-mongo/main/infra/main.tf": {
        status: 200,
        body: "",
      },
    });

    const meta = await extractMetadata(
      "https://github.com/Azure-Samples/todo-python-mongo"
    );
    expect(meta.iacProvider).toBe("Both");
  });

  test("empty iacProvider when neither bicep nor terraform exist", async () => {
    setupFullMock({
      "raw.githubusercontent.com/Azure-Samples/todo-python-mongo/main/infra/main.bicep": {
        status: 404,
      },
      "raw.githubusercontent.com/Azure-Samples/todo-python-mongo/main/infra/main.tf": {
        status: 404,
      },
    });

    const meta = await extractMetadata(
      "https://github.com/Azure-Samples/todo-python-mongo"
    );
    expect(meta.iacProvider).toBe("");
  });

  test("detects Community author type for non-Microsoft orgs", async () => {
    setupFullMock({
      "api.github.com/repos/Azure-Samples/todo-python-mongo": {
        status: 200,
        body: JSON.stringify({
          description: "Community template",
          owner: {
            login: "random-user",
            html_url: "https://github.com/random-user",
          },
          topics: [],
          default_branch: "main",
        }),
      },
    });

    const meta = await extractMetadata(
      "https://github.com/Azure-Samples/todo-python-mongo"
    );
    expect(meta.authorType).toBe("Community");
    expect(meta.author).toBe("random-user");
  });

  test("detects Microsoft author type for 'microsoft' org", async () => {
    setupFullMock({
      "api.github.com/repos/Azure-Samples/todo-python-mongo": {
        status: 200,
        body: JSON.stringify({
          description: "MS template",
          owner: {
            login: "microsoft",
            html_url: "https://github.com/microsoft",
          },
          topics: [],
          default_branch: "main",
        }),
      },
    });

    const meta = await extractMetadata(
      "https://github.com/Azure-Samples/todo-python-mongo"
    );
    expect(meta.authorType).toBe("Microsoft");
  });

  test("deduplicates azure services from topics and azure.yaml hosts", async () => {
    // Topic provides 'aca', azure.yaml host also provides 'aca'
    setupFullMock();

    const meta = await extractMetadata(
      "https://github.com/Azure-Samples/todo-python-mongo"
    );
    const acaCount = meta.azureServices.filter(
      (s: string) => s === "aca"
    ).length;
    expect(acaCount).toBe(1);
  });

  test("survives API failure — still returns partial results", async () => {
    // API fails (404), but azure.yaml and README work
    setupFullMock({
      "api.github.com/repos/Azure-Samples/todo-python-mongo": { status: 500 },
      "api.github.com/repos/Azure-Samples/todo-python-mongo/languages": {
        status: 500,
      },
    });

    const meta = await extractMetadata(
      "https://github.com/Azure-Samples/todo-python-mongo"
    );
    // Title from azure.yaml (API failed so no description)
    expect(meta.title).toBe("todo-python-mongo");
    expect(meta.description).toBe("");
    expect(meta.author).toBe("");
    expect(meta.iacProvider).toBe("Bicep"); // IaC still detected
  });

  test("survives azure.yaml failure — still returns other data", async () => {
    setupFullMock({
      "raw.githubusercontent.com/Azure-Samples/todo-python-mongo/main/azure.yaml": {
        status: 404,
      },
    });

    const meta = await extractMetadata(
      "https://github.com/Azure-Samples/todo-python-mongo"
    );
    expect(meta.description).toBe("A todo app with Python and MongoDB");
    // Title falls back to README
    expect(meta.title).toBe("Todo Python Mongo");
  });

  test("survives README failure — still returns other data", async () => {
    setupFullMock({
      "raw.githubusercontent.com/Azure-Samples/todo-python-mongo/main/README.md": {
        status: 404,
      },
    });

    const meta = await extractMetadata(
      "https://github.com/Azure-Samples/todo-python-mongo"
    );
    // Title from azure.yaml
    expect(meta.title).toBe("todo-python-mongo");
  });

  test("throws on invalid URL (does not swallow parseRepoUrl errors)", async () => {
    await expect(extractMetadata("not-a-url")).rejects.toThrow();
  });

  test("throws on non-GitHub URL", async () => {
    await expect(
      extractMetadata("https://gitlab.com/user/repo")
    ).rejects.toThrow(/Only GitHub/);
  });

  test("extracts 'function' host as 'functions' service tag", async () => {
    const yamlWithFunction =
      "name: fn-app\nservices:\n  func:\n    host: function\n";
    setupFullMock({
      "raw.githubusercontent.com/Azure-Samples/todo-python-mongo/main/azure.yaml": {
        status: 200,
        body: yamlWithFunction,
      },
    });

    const meta = await extractMetadata(
      "https://github.com/Azure-Samples/todo-python-mongo"
    );
    expect(meta.azureServices).toContain("functions");
  });
});

// ===========================================================================
// Error handling — network errors and timeouts
// ===========================================================================
describe("error handling", () => {
  test("fetchGitHubApi rejects on network error", async () => {
    setupMockError("ECONNREFUSED");
    await expect(fetchGitHubApi("owner", "repo")).rejects.toThrow(
      /ECONNREFUSED/
    );
  });

  test("fetchAzureYaml rejects on timeout", async () => {
    setupMockTimeout();
    await expect(
      fetchAzureYaml("owner", "repo", "main")
    ).rejects.toThrow(/timed out/);
  });

  test("fetchReadmeTitle rejects on timeout", async () => {
    setupMockTimeout();
    await expect(
      fetchReadmeTitle("owner", "repo", "main")
    ).rejects.toThrow(/timed out/);
  });

  test("extractMetadata survives all sub-fetch errors gracefully", async () => {
    setupMockError("ENOTFOUND");

    const meta = await extractMetadata(
      "https://github.com/Azure-Samples/todo-python-mongo"
    );
    // Everything empty but no throw
    expect(meta.title).toBe("");
    expect(meta.description).toBe("");
    expect(meta.iacProvider).toBe("");
  });
});

// ===========================================================================
// Size-limit enforcement
// ===========================================================================
describe("size limits", () => {
  test("rejects when response exceeds maxSize", async () => {
    // Create a response body larger than 4KB (the README limit)
    const largeBody = "# Title\n" + "x".repeat(5 * 1024);

    setupMock({
      "raw.githubusercontent.com/owner/repo/main/README.md": {
        status: 200,
        body: largeBody,
      },
    });

    // fetchReadmeTitle uses MAX_README_BYTES = 4KB
    await expect(
      fetchReadmeTitle("owner", "repo", "main")
    ).rejects.toThrow(/byte limit/);
  });
});

// ===========================================================================
// YAML safety — FAILSAFE_SCHEMA prevents code execution
// ===========================================================================
describe("YAML safety", () => {
  test("does not execute JavaScript embedded in YAML", async () => {
    // If the YAML parser evaluated code, this would throw or execute
    const maliciousYaml = [
      "name: !!js/function 'function(){ throw new Error(\"pwned\") }'",
      "services: {}",
    ].join("\n");

    setupMock({
      "raw.githubusercontent.com/owner/repo/main/azure.yaml": {
        status: 200,
        body: maliciousYaml,
      },
    });

    // With FAILSAFE_SCHEMA the unknown !!js/function tag causes a
    // YAMLException — which is the *correct* security behaviour: the
    // code is never executed, just rejected.
    await expect(
      fetchAzureYaml("owner", "repo", "main")
    ).rejects.toThrow();
  });

  test("handles malformed YAML without crashing extractMetadata", async () => {
    const badYaml = "{{{{invalid yaml\n:::no good";

    // Mock all endpoints - API works, but azure.yaml is malformed
    const repoApi = JSON.stringify({
      description: "test",
      owner: { login: "owner", html_url: "https://github.com/owner" },
      topics: [],
      default_branch: "main",
    });

    https.request.mockImplementation((opts: any, callback: Function) => {
      const key = `${opts.hostname}${opts.path}`;
      let status = 404;
      let body = "";

      if (key.includes("api.github.com") && !key.includes("/languages")) {
        status = 200;
        body = repoApi;
      } else if (key.includes("/languages")) {
        status = 200;
        body = "{}";
      } else if (key.includes("azure.yaml")) {
        status = 200;
        body = badYaml;
      } else if (key.includes("README.md")) {
        status = 200;
        body = "# Title\n";
      }

      const res = new EventEmitter() as any;
      res.statusCode = status;
      res.resume = jest.fn();

      process.nextTick(() => {
        callback(res);
        if (status === 200) res.emit("data", Buffer.from(body));
        res.emit("end");
      });

      const req = new EventEmitter() as any;
      req.end = jest.fn();
      req.destroy = jest.fn();
      return req;
    });

    // Should not throw — malformed YAML is caught internally
    const meta = await extractMetadata(
      "https://github.com/Azure-Samples/todo-python-mongo"
    );
    expect(meta.description).toBe("test");
  });
});

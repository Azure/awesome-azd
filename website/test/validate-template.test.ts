/* eslint-disable @typescript-eslint/no-var-requires */
const {
  validateTemplate,
  canonicalizeUrl,
} = require("../scripts/validate-template");

// Mock global fetch for all tests
beforeEach(() => {
  (global as any).fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

/** Simulate a successful GitHub API response (repo exists). */
function mockRepoExists(): void {
  (global as any).fetch.mockResolvedValue({ ok: true, status: 200 });
}

/** Simulate a 404 GitHub API response (repo not found). */
function mockRepoNotFound(): void {
  (global as any).fetch.mockResolvedValue({ ok: false, status: 404 });
}

// ---------------------------------------------------------------------------
// canonicalizeUrl unit tests
// ---------------------------------------------------------------------------
describe("canonicalizeUrl", () => {
  test("returns canonical form for a standard GitHub URL", () => {
    expect(canonicalizeUrl("https://github.com/Azure/awesome-azd")).toBe(
      "https://github.com/Azure/awesome-azd"
    );
  });

  test("strips www. prefix", () => {
    expect(canonicalizeUrl("https://www.github.com/Azure/awesome-azd")).toBe(
      "https://github.com/Azure/awesome-azd"
    );
  });

  test("removes .git suffix", () => {
    expect(canonicalizeUrl("https://github.com/Azure/awesome-azd.git")).toBe(
      "https://github.com/Azure/awesome-azd"
    );
  });

  test("removes trailing slash", () => {
    expect(canonicalizeUrl("https://github.com/Azure/awesome-azd/")).toBe(
      "https://github.com/Azure/awesome-azd"
    );
  });

  test("removes trailing slashes and .git combined", () => {
    expect(
      canonicalizeUrl("https://www.github.com/Azure/awesome-azd.git/")
    ).toBe("https://github.com/Azure/awesome-azd");
  });

  test("rejects extra path segments like /tree/main", () => {
    expect(() =>
      canonicalizeUrl("https://github.com/Azure/awesome-azd/tree/main")
    ).toThrow("extra path segments");
  });

  test("rejects single-segment path", () => {
    expect(() => canonicalizeUrl("https://github.com/Azure")).toThrow(
      "Expected format"
    );
  });

  test("throws on invalid URL", () => {
    expect(() => canonicalizeUrl("not-a-url")).toThrow();
  });
});

// ---------------------------------------------------------------------------
// validateTemplate integration tests
// ---------------------------------------------------------------------------
describe("validateTemplate", () => {
  describe("valid GitHub URLs", () => {
    test("accepts a valid GitHub URL and returns canonical form", async () => {
      mockRepoExists();
      const result = await validateTemplate(
        "https://github.com/Azure/awesome-azd"
      );
      expect(result.valid).toBe(true);
      expect(result.repoExists).toBe(true);
      expect(result.sourceUrl).toBe("https://github.com/Azure/awesome-azd");
      expect(result.generatedId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
      expect(result.errors).toHaveLength(0);
    });

    test("canonicalizes www.github.com URL", async () => {
      mockRepoExists();
      const result = await validateTemplate(
        "https://www.github.com/Azure/awesome-azd"
      );
      expect(result.valid).toBe(true);
      expect(result.sourceUrl).toBe("https://github.com/Azure/awesome-azd");
    });

    test("canonicalizes URL with .git suffix", async () => {
      mockRepoExists();
      const result = await validateTemplate(
        "https://github.com/Azure/awesome-azd.git"
      );
      expect(result.valid).toBe(true);
      expect(result.sourceUrl).toBe("https://github.com/Azure/awesome-azd");
    });

    test("canonicalizes URL with trailing slash", async () => {
      mockRepoExists();
      const result = await validateTemplate(
        "https://github.com/Azure/awesome-azd/"
      );
      expect(result.valid).toBe(true);
      expect(result.sourceUrl).toBe("https://github.com/Azure/awesome-azd");
    });
  });

  describe("URL canonicalization rejects extra segments", () => {
    test("rejects URL with /tree/main path", async () => {
      const result = await validateTemplate(
        "https://github.com/Azure/awesome-azd/tree/main"
      );
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/extra path segments/);
    });
  });

  describe("SSRF protection", () => {
    test("rejects non-github.com hosts", async () => {
      const result = await validateTemplate(
        "https://evil.com/Azure/awesome-azd"
      );
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/github\.com/);
      expect((global as any).fetch).not.toHaveBeenCalled();
    });

    test("rejects localhost", async () => {
      const result = await validateTemplate(
        "https://localhost/Azure/awesome-azd"
      );
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/github\.com/);
    });

    test("rejects IP addresses", async () => {
      const result = await validateTemplate(
        "https://127.0.0.1/Azure/awesome-azd"
      );
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/github\.com/);
    });
  });

  describe("HTTPS-only enforcement", () => {
    test("rejects http: protocol", async () => {
      const result = await validateTemplate(
        "http://github.com/Azure/awesome-azd"
      );
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/Unsafe protocol/);
      expect((global as any).fetch).not.toHaveBeenCalled();
    });

    test("rejects ftp: protocol", async () => {
      const result = await validateTemplate(
        "ftp://github.com/Azure/awesome-azd"
      );
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/Unsafe protocol/);
    });
  });

  describe("invalid URLs", () => {
    test("rejects completely invalid URL", async () => {
      const result = await validateTemplate("not-a-url");
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/Invalid URL/);
    });

    test("rejects empty string", async () => {
      const result = await validateTemplate("");
      expect(result.valid).toBe(false);
    });

    test("rejects URL with only owner (no repo)", async () => {
      const result = await validateTemplate("https://github.com/Azure");
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/Expected format/);
    });
  });

  describe("repository existence check", () => {
    test("reports repo not found on 404", async () => {
      mockRepoNotFound();
      const result = await validateTemplate(
        "https://github.com/Azure/nonexistent-repo"
      );
      expect(result.valid).toBe(false);
      expect(result.repoExists).toBe(false);
      expect(result.errors[0]).toMatch(/not found/);
    });

    test("reports API error on non-404 failure", async () => {
      (global as any).fetch.mockResolvedValue({ ok: false, status: 500 });
      const result = await validateTemplate(
        "https://github.com/Azure/awesome-azd"
      );
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/status 500/);
    });

    test("handles network timeout gracefully", async () => {
      (global as any).fetch.mockRejectedValue(
        Object.assign(new Error("aborted"), { name: "AbortError" })
      );
      const result = await validateTemplate(
        "https://github.com/Azure/awesome-azd"
      );
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/timed out/);
    });

    test("handles generic fetch error gracefully", async () => {
      (global as any).fetch.mockRejectedValue(new Error("network failure"));
      const result = await validateTemplate(
        "https://github.com/Azure/awesome-azd"
      );
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/network failure/);
    });
  });
});

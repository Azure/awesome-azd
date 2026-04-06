import { describe, expect, test, beforeEach, afterEach } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const {
  sanitize,
  parseTags,
  updateTemplatesJson,
} = require("../scripts/update-templates-json");
const { writeOutputs } = require("../scripts/github-output");

// ---------------------------------------------------------------------------
// sanitize
// ---------------------------------------------------------------------------
describe("sanitize", () => {
  test("strips HTML tags", () => {
    expect(sanitize("<b>bold</b> text", 200)).toBe("bold text");
  });

  test("strips unclosed tags", () => {
    expect(sanitize("before <script", 200)).toBe("before");
  });

  test("removes angle brackets", () => {
    // The tag regex matches `< c` as an unclosed tag, leaving `a > b `
    // Then the angle-bracket pass strips the `>`, producing `a  b`
    expect(sanitize("a > b < c", 200)).toBe("a  b");
  });

  test("truncates to maxLength", () => {
    expect(sanitize("abcdefghij", 5)).toBe("abcde");
  });

  test("trims whitespace", () => {
    expect(sanitize("  hello world  ", 200)).toBe("hello world");
  });

  test("handles empty string", () => {
    expect(sanitize("", 200)).toBe("");
  });

  test("handles nested tags", () => {
    expect(sanitize("<div><p>text</p></div>", 200)).toBe("text");
  });

  test("strips self-closing tags", () => {
    expect(sanitize("before<br/>after", 200)).toBe("beforeafter");
  });

  // --- Bidi/invisible char stripping (hack fix) ---
  test("strips standard bidi overrides (U+200B-U+200F, U+202A-U+202E)", () => {
    expect(sanitize("a\u200Eb\u202Ac", 200)).toBe("abc");
  });

  test("strips Arabic Letter Mark U+061C", () => {
    expect(sanitize("hello\u061Cworld", 200)).toBe("helloworld");
  });

  test("strips Mongolian vowel separator U+180E", () => {
    expect(sanitize("hello\u180Eworld", 200)).toBe("helloworld");
  });

  test("strips soft hyphen U+00AD", () => {
    expect(sanitize("he\u00ADllo", 200)).toBe("hello");
  });

  test("strips combining grapheme joiner U+034F", () => {
    expect(sanitize("he\u034Fllo", 200)).toBe("hello");
  });
});

// ---------------------------------------------------------------------------
// parseTags
// ---------------------------------------------------------------------------
describe("parseTags", () => {
  test("parses comma-separated values and normalizes to lowercase", () => {
    expect(parseTags("Python, JavaScript, Go")).toEqual([
      "python",
      "javascript",
      "go",
    ]);
  });

  test("returns empty array for _No response_", () => {
    expect(parseTags("_No response_")).toEqual([]);
  });

  test("returns empty array for empty string", () => {
    expect(parseTags("")).toEqual([]);
  });

  test("returns empty array for null/undefined", () => {
    expect(parseTags(null)).toEqual([]);
    expect(parseTags(undefined)).toEqual([]);
  });

  test("strips disallowed characters", () => {
    expect(parseTags("Node.js, C++, C#")).toEqual(["node.js", "c++", "c"]);
  });

  test("filters out empty tags after cleaning", () => {
    expect(parseTags("Python, , , Go")).toEqual(["python", "go"]);
  });

  test("truncates individual tags to 50 chars", () => {
    const longTag = "a".repeat(60);
    const result = parseTags(longTag);
    expect(result[0].length).toBe(50);
  });

  test("limits to 20 tags", () => {
    const csv = Array.from({ length: 25 }, (_, i) => `tag${i}`).join(", ");
    expect(parseTags(csv).length).toBe(20);
  });

  test("trims whitespace on each tag and strips spaces", () => {
    expect(parseTags("  Python ,  Go  ")).toEqual(["python", "go"]);
  });

  test("allows dots, dashes, plus signs; strips spaces and lowercases", () => {
    expect(parseTags("ASP.NET, Vue.js, C++, Azure App Service")).toEqual([
      "asp.net",
      "vue.js",
      "c++",
      "azureappservice",
    ]);
  });
});

// ---------------------------------------------------------------------------
// updateTemplatesJson
// ---------------------------------------------------------------------------
describe("updateTemplatesJson", () => {
  let tmpDir: string;
  let templatesPath: string;

  const baseTemplates = [
    {
      title: "Existing Template",
      description: "Already there",
      preview: "img.png",
      authorUrl: "https://github.com/existing",
      author: "Existing Author",
      source: "https://github.com/org/existing-repo",
      tags: ["community"],
      IaC: ["bicep"],
      id: "existing-id",
    },
  ];

  function writeTemplates(data: any[]) {
    fs.writeFileSync(templatesPath, JSON.stringify(data, null, 2) + "\n");
  }

  function readTemplates() {
    return JSON.parse(fs.readFileSync(templatesPath, "utf8"));
  }

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tpl-test-"));
    templatesPath = path.join(tmpDir, "templates.json");
    writeTemplates(baseTemplates);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const defaultOpts = () => ({
    sourceRepo: "https://github.com/org/new-repo",
    title: "New Template",
    description: "A brand new template",
    author: "Jane Doe",
    authorUrl: "https://github.com/janedoe",
    authorType: "Community",
    previewImage: "",
    iacProvider: "Bicep",
    languages: [] as string[],
    frameworks: [] as string[],
    azureServices: [] as string[],
    templatesPath,
    uuidGenerator: () => "test-uuid-1234",
  });

  test("adds a new template to the JSON file", () => {
    const result = updateTemplatesJson(defaultOpts());
    expect(result.skipped).toBe(false);
    expect(result.added).toBe("New Template");

    const templates = readTemplates();
    expect(templates.length).toBe(2);
    expect(templates[1].title).toBe("New Template");
    expect(templates[1].id).toBe("test-uuid-1234");
  });

  test("detects duplicate by canonical URL match", () => {
    const opts = defaultOpts();
    opts.sourceRepo = "https://github.com/org/existing-repo.git";
    const result = updateTemplatesJson(opts);
    expect(result.skipped).toBe(true);
    expect(result.skipReason).toMatch(/already exists/);
    expect(result.skipReason).toMatch(/Existing Template/);
  });

  test("detects duplicate with trailing slash", () => {
    const opts = defaultOpts();
    opts.sourceRepo = "https://github.com/org/existing-repo/";
    const result = updateTemplatesJson(opts);
    expect(result.skipped).toBe(true);
  });

  test("detects duplicate case-insensitively", () => {
    const opts = defaultOpts();
    opts.sourceRepo = "https://GitHub.com/Org/Existing-Repo";
    const result = updateTemplatesJson(opts);
    expect(result.skipped).toBe(true);
  });

  test("maps iacProvider 'Bicep' to ['bicep']", () => {
    const opts = defaultOpts();
    opts.iacProvider = "Bicep";
    updateTemplatesJson(opts);
    const templates = readTemplates();
    expect(templates[1].IaC).toEqual(["bicep"]);
  });

  test("maps iacProvider 'Terraform' to ['terraform']", () => {
    const opts = defaultOpts();
    opts.iacProvider = "Terraform";
    updateTemplatesJson(opts);
    const templates = readTemplates();
    expect(templates[1].IaC).toEqual(["terraform"]);
  });

  test("maps iacProvider 'Both' to ['bicep', 'terraform']", () => {
    const opts = defaultOpts();
    opts.iacProvider = "Both";
    updateTemplatesJson(opts);
    const templates = readTemplates();
    expect(templates[1].IaC).toEqual(["bicep", "terraform"]);
  });

  test("sets Microsoft author tags", () => {
    const opts = defaultOpts();
    opts.authorType = "Microsoft";
    updateTemplatesJson(opts);
    const templates = readTemplates();
    expect(templates[1].tags).toEqual(["msft", "new"]);
  });

  test("sets Community author tags", () => {
    updateTemplatesJson(defaultOpts());
    const templates = readTemplates();
    expect(templates[1].tags).toEqual(["community", "new"]);
  });

  test("uses empty preview when none provided", () => {
    updateTemplatesJson(defaultOpts());
    const templates = readTemplates();
    expect(templates[1].preview).toBe("");
  });

  test("uses provided preview image", () => {
    const opts = defaultOpts();
    opts.previewImage = "https://example.com/img.png";
    updateTemplatesJson(opts);
    const templates = readTemplates();
    expect(templates[1].preview).toBe("https://example.com/img.png");
  });

  test("includes optional tag arrays only when non-empty", () => {
    const opts = defaultOpts();
    opts.languages = ["python"];
    opts.frameworks = [];
    opts.azureServices = ["appservice", "cosmosdb"];
    updateTemplatesJson(opts);
    const templates = readTemplates();
    const entry = templates[1];
    expect(entry.languages).toEqual(["python"]);
    expect(entry.frameworks).toBeUndefined();
    expect(entry.azureServices).toEqual(["appservice", "cosmosdb"]);
  });

  test("throws on invalid source repo URL", () => {
    const opts = defaultOpts();
    opts.sourceRepo = "not-a-url";
    expect(() => updateTemplatesJson(opts)).toThrow(/Invalid/);
  });

  test("throws on HTTP source repo URL", () => {
    const opts = defaultOpts();
    opts.sourceRepo = "http://github.com/org/repo";
    expect(() => updateTemplatesJson(opts)).toThrow(/HTTPS/);
  });

  test("throws on private IP in source repo URL", () => {
    const opts = defaultOpts();
    opts.sourceRepo = "https://10.0.0.1/org/repo";
    expect(() => updateTemplatesJson(opts)).toThrow(/private/);
  });

  test("throws on invalid author URL", () => {
    const opts = defaultOpts();
    opts.authorUrl = "ftp://example.com";
    expect(() => updateTemplatesJson(opts)).toThrow();
  });

  test("throws on private IP in preview image URL", () => {
    const opts = defaultOpts();
    opts.previewImage = "https://192.168.1.1/img.png";
    expect(() => updateTemplatesJson(opts)).toThrow(/private/);
  });

  test("does not modify existing entries", () => {
    updateTemplatesJson(defaultOpts());
    const templates = readTemplates();
    expect(templates[0]).toEqual(baseTemplates[0]);
  });

  test("throws descriptive error when templates.json is missing (#16)", () => {
    const opts = defaultOpts();
    opts.templatesPath = path.join(tmpDir, "nonexistent.json");
    expect(() => updateTemplatesJson(opts)).toThrow(/Failed to parse.*nonexistent\.json/);
  });

  test("throws descriptive error when templates.json contains invalid JSON (#16)", () => {
    const badPath = path.join(tmpDir, "bad.json");
    fs.writeFileSync(badPath, "{ not valid json !!!", "utf8");
    const opts = defaultOpts();
    opts.templatesPath = badPath;
    expect(() => updateTemplatesJson(opts)).toThrow(/Failed to parse.*bad\.json/);
  });

  test("throws when authorUrl is empty (#4)", () => {
    const opts = defaultOpts();
    opts.authorUrl = "";
    expect(() => updateTemplatesJson(opts)).toThrow(/Author URL is required/);
  });

  test("sanitizes title and description in output entry (#19)", () => {
    const opts = defaultOpts();
    opts.sourceRepo = "https://github.com/org/sanitize-test";
    opts.title = "<script>alert('xss')</script>My Template";
    opts.description = "A <b>bold</b> description";
    const result = updateTemplatesJson(opts);
    expect(result.skipped).toBe(false);
    const templates = readTemplates();
    const entry = templates[templates.length - 1];
    expect(entry.title).not.toContain("<script>");
    expect(entry.title).toContain("My Template");
    expect(entry.description).not.toContain("<b>");
    expect(entry.description).toContain("bold");
  });

  // --- Preview image sanitization (hack fix) ---
  test("sanitizes preview image URL — strips bidi overrides and null bytes", () => {
    const opts = defaultOpts();
    opts.sourceRepo = "https://github.com/org/preview-test";
    opts.previewImage = "https://github.com/img\u200E.png";
    const result = updateTemplatesJson(opts);
    expect(result.skipped).toBe(false);
    const templates = readTemplates();
    const entry = templates[templates.length - 1];
    expect(entry.preview).not.toContain("\u200E");
    expect(entry.preview).toContain("img.png");
  });

  test("preview field is empty string when previewImage is empty", () => {
    const result = updateTemplatesJson(defaultOpts());
    expect(result.skipped).toBe(false);
    const templates = readTemplates();
    const entry = templates[templates.length - 1];
    expect(entry.preview).toBe("");
  });

  // --- Duplicate bypass via sub-path URL (hack fix) ---
  test("detects duplicate when source URL has /tree/main suffix", () => {
    const opts = defaultOpts();
    opts.sourceRepo = "https://github.com/org/existing-repo/tree/main";
    const result = updateTemplatesJson(opts);
    expect(result.skipped).toBe(true);
    expect(result.skipReason).toContain("already exists");
  });

  test("detects duplicate when source URL has /blob/main/README.md suffix", () => {
    const opts = defaultOpts();
    opts.sourceRepo = "https://github.com/org/existing-repo/blob/main/README.md";
    const result = updateTemplatesJson(opts);
    expect(result.skipped).toBe(true);
    expect(result.skipReason).toContain("already exists");
  });

  // Array.isArray guard (hack cycle 2)
  test("throws when templates.json contains an object instead of array", () => {
    fs.writeFileSync(templatesPath, JSON.stringify({ notAnArray: true }));
    expect(() => updateTemplatesJson(defaultOpts())).toThrow(
      /must contain a JSON array/
    );
  });

  test("throws when templates.json contains a string instead of array", () => {
    fs.writeFileSync(templatesPath, JSON.stringify("just a string"));
    expect(() => updateTemplatesJson(defaultOpts())).toThrow(
      /must contain a JSON array/
    );
  });
});

// ---------------------------------------------------------------------------
// sanitize — null bytes and edge cases
// ---------------------------------------------------------------------------
describe("sanitize — security edge cases", () => {
  test("strips null bytes", () => {
    const result = sanitize("hello\x00world", 200);
    expect(result).not.toContain("\x00");
  });

  test("handles unicode combining characters", () => {
    // Zero-width joiner and combining marks should not crash
    const input = "test\u200D\u0301value";
    expect(() => sanitize(input, 200)).not.toThrow();
  });

  test("handles RTL override characters", () => {
    const input = "normal \u202Eesrever text";
    const result = sanitize(input, 200);
    expect(typeof result).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// parseTags — unicode and null byte edge cases
// ---------------------------------------------------------------------------
describe("parseTags — security edge cases", () => {
  test("strips null bytes from tags", () => {
    const result = parseTags("python\x00, go");
    expect(result[0]).not.toContain("\x00");
  });

  test("handles unicode homoglyph characters by stripping them", () => {
    // Cyrillic 'а' (U+0430) looks like Latin 'a' but is not alphanumeric ASCII
    const result = parseTags("\u0430pp");
    // The allowlist filter strips non-ASCII, leaving "pp"
    expect(result[0]).toBe("pp");
  });
});

// ---------------------------------------------------------------------------
// writeOutputs — output injection prevention (update-templates-json variant)
// ---------------------------------------------------------------------------
describe("writeOutputs (update-templates-json)", () => {
  let tmpDir: string;
  let outputPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "utj-output-"));
    outputPath = path.join(tmpDir, "GITHUB_OUTPUT");
    fs.writeFileSync(outputPath, "");
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("prevents newline injection in output values", () => {
    writeOutputs(outputPath, { added: "template\nevil=injected" });
    const content = fs.readFileSync(outputPath, "utf8");
    const lines = content.trim().split("\n");
    expect(lines.length).toBe(1);
    expect(lines[0]).toBe("added=template evil=injected");
  });

  test("handles heredoc-style delimiter in value", () => {
    writeOutputs(outputPath, { result: "<<EOF\nevil\nEOF" });
    const content = fs.readFileSync(outputPath, "utf8");
    expect(content).not.toContain("\nevil\n");
  });
});

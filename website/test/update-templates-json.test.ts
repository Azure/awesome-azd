import { describe, expect, test, beforeEach, afterEach } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const {
  sanitize,
  parseTags,
  updateTemplatesJson,
} = require("../scripts/update-templates-json");

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
});

// ---------------------------------------------------------------------------
// parseTags
// ---------------------------------------------------------------------------
describe("parseTags", () => {
  test("parses comma-separated values", () => {
    expect(parseTags("Python, JavaScript, Go")).toEqual([
      "Python",
      "JavaScript",
      "Go",
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
    expect(parseTags("Node.js, C++, C#")).toEqual(["Node.js", "C++", "C"]);
  });

  test("filters out empty tags after cleaning", () => {
    expect(parseTags("Python, , , Go")).toEqual(["Python", "Go"]);
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

  test("trims whitespace on each tag", () => {
    expect(parseTags("  Python ,  Go  ")).toEqual(["Python", "Go"]);
  });

  test("allows dots, dashes, plus signs, and spaces", () => {
    expect(parseTags("ASP.NET, Vue.js, C++, Azure App Service")).toEqual([
      "ASP.NET",
      "Vue.js",
      "C++",
      "Azure App Service",
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

  test("uses default preview image when none provided", () => {
    updateTemplatesJson(defaultOpts());
    const templates = readTemplates();
    expect(templates[1].preview).toBe(
      "templates/images/default-template.png"
    );
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
    opts.languages = ["Python"];
    opts.frameworks = [];
    opts.azureServices = ["App Service", "Cosmos DB"];
    updateTemplatesJson(opts);
    const templates = readTemplates();
    const entry = templates[1];
    expect(entry.languages).toEqual(["Python"]);
    expect(entry.frameworks).toBeUndefined();
    expect(entry.azureServices).toEqual(["App Service", "Cosmos DB"]);
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
});

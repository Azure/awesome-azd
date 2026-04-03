import { describe, expect, test } from "@jest/globals";

import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const {
  extractField,
  parseIssueBody,
} = require("../scripts/parse-template-issue");
const {
  sanitizeOutputValue,
  writeOutputs,
} = require("../scripts/github-output");

// ---------------------------------------------------------------------------
// extractField
// ---------------------------------------------------------------------------
describe("extractField", () => {
  const body = [
    "### Source Repository",
    "https://github.com/org/repo",
    "",
    "### Template Title",
    "My Template",
    "",
    "### Description",
    "A great template for demos",
    "",
    "### Author",
    "Jane Doe",
    "",
    "### Author URL",
    "https://github.com/janedoe",
    "",
    "### Author Type",
    "Community",
    "",
    "### Preview Image URL",
    "_No response_",
    "",
    "### IaC Provider",
    "Bicep",
    "",
    "### Languages",
    "Python, JavaScript",
    "",
    "### Frameworks",
    "_No response_",
    "",
    "### Azure Services",
    "App Service, Cosmos DB",
  ].join("\n");

  test("extracts a simple field", () => {
    expect(extractField(body, "Template Title")).toBe("My Template");
  });

  test("extracts URL field", () => {
    expect(extractField(body, "Source Repository")).toBe(
      "https://github.com/org/repo"
    );
  });

  test("extracts multi-word field name", () => {
    expect(extractField(body, "Preview Image URL")).toBe("");
  });

  test("returns empty string for _No response_", () => {
    expect(extractField(body, "Frameworks")).toBe("");
  });

  test("returns empty string for missing field", () => {
    expect(extractField(body, "Nonexistent Field")).toBe("");
  });

  test("trims whitespace around value", () => {
    const padded = "### Field\n   value with spaces   \n";
    expect(extractField(padded, "Field")).toBe("value with spaces");
  });

  test("is case-insensitive on heading", () => {
    const lower = "### source repository\nhttps://example.com\n";
    expect(extractField(lower, "Source Repository")).toBe(
      "https://example.com"
    );
  });

  test("handles empty body gracefully", () => {
    expect(extractField("", "Field")).toBe("");
  });

  test("handles body with only heading, no value line", () => {
    expect(extractField("### Field\n", "Field")).toBe("");
  });

  test("rejects body exceeding 100 KB", () => {
    const bigBody = "### Title\nA".repeat(100001);
    expect(() => extractField(bigBody, "Title")).toThrow("too large");
  });
});

// ---------------------------------------------------------------------------
// parseIssueBody — issues event
// ---------------------------------------------------------------------------
describe("parseIssueBody (issues event)", () => {
  const fullBody = [
    "### Source Repository",
    "https://github.com/org/repo",
    "",
    "### Template Title",
    "My Template",
    "",
    "### Description",
    "A great template",
    "",
    "### Author",
    "Jane Doe",
    "",
    "### Author URL",
    "https://github.com/janedoe",
    "",
    "### Author Type",
    "Community",
    "",
    "### Preview Image URL",
    "_No response_",
    "",
    "### IaC Provider",
    "Bicep",
    "",
    "### Languages",
    "Python, JavaScript",
    "",
    "### Frameworks",
    "_No response_",
    "",
    "### Azure Services",
    "App Service, Cosmos DB",
  ].join("\n");

  test("parses all fields from a complete issue body", () => {
    const { fields, error } = parseIssueBody({
      eventName: "issues",
      issueBody: fullBody,
    });
    expect(error).toBeUndefined();
    expect(fields.source_repo).toBe("https://github.com/org/repo");
    expect(fields.template_title).toBe("My Template");
    expect(fields.description).toBe("A great template");
    expect(fields.author).toBe("Jane Doe");
    expect(fields.author_url).toBe("https://github.com/janedoe");
    expect(fields.author_type).toBe("Community");
    expect(fields.preview_image).toBe("");
    expect(fields.iac_provider).toBe("Bicep");
    expect(fields.languages).toBe("Python, JavaScript");
    expect(fields.frameworks).toBe("");
    expect(fields.azure_services).toBe("App Service, Cosmos DB");
  });

  test("succeeds when only source_repo is provided (other fields optional)", () => {
    const partialBody = [
      "### Source Repository",
      "https://github.com/org/repo",
      "",
      "### Template Title",
      "My Template",
    ].join("\n");

    const { fields, error } = parseIssueBody({
      eventName: "issues",
      issueBody: partialBody,
    });
    expect(error).toBeUndefined();
    expect(fields.source_repo).toBe("https://github.com/org/repo");
    expect(fields.template_title).toBe("My Template");
    // Optional fields that were not in the body are empty strings
    expect(fields.description).toBe("");
    expect(fields.author).toBe("");
    expect(fields.author_url).toBe("");
  });

  test("returns error when body is empty (source_repo missing)", () => {
    const { error } = parseIssueBody({
      eventName: "issues",
      issueBody: "",
    });
    expect(error).toMatch(/Missing required fields/);
    expect(error).toMatch(/source_repo/);
  });

  test("treats _No response_ in required fields as missing", () => {
    const body = [
      "### Source Repository",
      "_No response_",
      "",
      "### Template Title",
      "My Template",
      "",
      "### Description",
      "A description",
      "",
      "### Author",
      "Jane",
      "",
      "### Author URL",
      "https://github.com/jane",
    ].join("\n");

    const { error } = parseIssueBody({
      eventName: "issues",
      issueBody: body,
    });
    expect(error).toMatch(/source_repo/);
  });

  test("handles undefined issueBody", () => {
    const { error } = parseIssueBody({
      eventName: "issues",
      issueBody: undefined,
    });
    expect(error).toMatch(/Missing required fields/);
  });
});

// ---------------------------------------------------------------------------
// parseIssueBody — workflow_dispatch event
// ---------------------------------------------------------------------------
describe("parseIssueBody (workflow_dispatch)", () => {
  test("reads fields from inputs object", () => {
    const { fields, error } = parseIssueBody({
      eventName: "workflow_dispatch",
      inputs: {
        source_repo: "https://github.com/org/repo",
        template_title: "My Template",
        description: "A great template",
        author: "Jane Doe",
        author_url: "https://github.com/janedoe",
        author_type: "Microsoft",
        preview_image: "",
        iac_provider: "Terraform",
        languages: "Go",
        frameworks: "",
        azure_services: "",
      },
    });
    expect(error).toBeUndefined();
    expect(fields.source_repo).toBe("https://github.com/org/repo");
    expect(fields.template_title).toBe("My Template");
    expect(fields.author_type).toBe("Microsoft");
    expect(fields.iac_provider).toBe("Terraform");
    expect(fields.languages).toBe("Go");
    expect(fields.preview_image).toBe("");
  });

  test("returns error when source_repo is empty", () => {
    const { error } = parseIssueBody({
      eventName: "workflow_dispatch",
      inputs: {
        source_repo: "",
        template_title: "Title",
        description: "Desc",
        author: "Auth",
        author_url: "",
      },
    });
    expect(error).toMatch(/source_repo/);
    // author_url is no longer required — should not appear in error
    expect(error).not.toMatch(/author_url/);
  });

  test("handles undefined inputs gracefully", () => {
    const { error } = parseIssueBody({
      eventName: "workflow_dispatch",
      inputs: {},
    });
    expect(error).toMatch(/Missing required fields/);
    expect(error).toMatch(/source_repo/);
  });

  test("trims whitespace from input values", () => {
    const { fields } = parseIssueBody({
      eventName: "workflow_dispatch",
      inputs: {
        source_repo: "  https://github.com/org/repo  ",
        template_title: "  My Template  ",
        description: "  Desc  ",
        author: "  Auth  ",
        author_url: "  https://github.com/auth  ",
        author_type: "Community",
        preview_image: "",
        iac_provider: "Bicep",
        languages: "",
        frameworks: "",
        azure_services: "",
      },
    });
    expect(fields.source_repo).toBe("https://github.com/org/repo");
    expect(fields.template_title).toBe("My Template");
  });
});

// ---------------------------------------------------------------------------
// parseIssueBody — new heading format with "(optional ...)" suffixes
// ---------------------------------------------------------------------------
describe("parseIssueBody (auto-detect heading format)", () => {
  const autoDetectBody = [
    "### Source Repository",
    "https://github.com/org/repo",
    "",
    "### Template Title (optional \u2014 auto-detected from repo)",
    "My Custom Title",
    "",
    "### Description (optional \u2014 auto-detected from repo)",
    "A great template",
    "",
    "### Author (optional \u2014 auto-detected from repo owner)",
    "Jane Doe",
    "",
    "### Author URL (optional \u2014 auto-detected from repo owner)",
    "https://github.com/janedoe",
    "",
    "### Author Type (optional \u2014 auto-detected)",
    "Community",
    "",
    "### Preview Image URL (optional)",
    "_No response_",
    "",
    "### IaC Provider (optional \u2014 auto-detected from infra/ directory)",
    "Bicep",
    "",
    "### Languages (optional \u2014 auto-detected from repo)",
    "Python, JavaScript",
    "",
    "### Frameworks (optional)",
    "_No response_",
    "",
    "### Azure Services (optional \u2014 auto-detected from repo topics)",
    "aca, openai",
  ].join("\n");

  test("parses all fields from auto-detect heading format", () => {
    const { fields, error } = parseIssueBody({
      eventName: "issues",
      issueBody: autoDetectBody,
    });
    expect(error).toBeUndefined();
    expect(fields.source_repo).toBe("https://github.com/org/repo");
    expect(fields.template_title).toBe("My Custom Title");
    expect(fields.description).toBe("A great template");
    expect(fields.author).toBe("Jane Doe");
    expect(fields.author_url).toBe("https://github.com/janedoe");
    expect(fields.author_type).toBe("Community");
    expect(fields.preview_image).toBe("");
    expect(fields.iac_provider).toBe("Bicep");
    expect(fields.languages).toBe("Python, JavaScript");
    expect(fields.frameworks).toBe("");
    expect(fields.azure_services).toBe("aca, openai");
  });

  test("empty optional fields are returned as empty strings", () => {
    const minimalBody = [
      "### Source Repository",
      "https://github.com/org/repo",
    ].join("\n");

    const { fields, error } = parseIssueBody({
      eventName: "issues",
      issueBody: minimalBody,
    });
    expect(error).toBeUndefined();
    expect(fields.source_repo).toBe("https://github.com/org/repo");
    expect(fields.template_title).toBe("");
    expect(fields.description).toBe("");
    expect(fields.author).toBe("");
    expect(fields.author_url).toBe("");
    expect(fields.author_type).toBe("");
    expect(fields.preview_image).toBe("");
    expect(fields.iac_provider).toBe("");
    expect(fields.languages).toBe("");
    expect(fields.frameworks).toBe("");
    expect(fields.azure_services).toBe("");
  });
});

// ---------------------------------------------------------------------------
// sanitizeOutputValue — output injection prevention
// ---------------------------------------------------------------------------
describe("sanitizeOutputValue", () => {
  test("strips newline characters to prevent output injection", () => {
    expect(sanitizeOutputValue("line1\nline2")).toBe("line1 line2");
  });

  test("strips carriage return + newline", () => {
    expect(sanitizeOutputValue("line1\r\nline2")).toBe("line1 line2");
  });

  test("collapses consecutive newlines", () => {
    expect(sanitizeOutputValue("a\n\n\nb")).toBe("a b");
  });

  test("strips heredoc delimiter to prevent multiline output hijack", () => {
    const payload = "value\nmalicious_key=injected";
    expect(sanitizeOutputValue(payload)).not.toContain("\n");
    expect(sanitizeOutputValue(payload)).toBe("value malicious_key=injected");
  });

  test("returns empty string for null", () => {
    expect(sanitizeOutputValue(null)).toBe("");
  });

  test("returns empty string for undefined", () => {
    expect(sanitizeOutputValue(undefined)).toBe("");
  });

  test("converts non-string to string", () => {
    expect(sanitizeOutputValue(42)).toBe("42");
    expect(sanitizeOutputValue(true)).toBe("true");
  });

  test("trims whitespace", () => {
    expect(sanitizeOutputValue("  hello  ")).toBe("hello");
  });

  test("neutralizes GITHUB_OUTPUT key injection via newline", () => {
    // Attacker tries: "innocent\nskipped=true" to set a second output key
    const payload = "innocent\nskipped=true";
    const result = sanitizeOutputValue(payload);
    expect(result).not.toMatch(/\n/);
    expect(result).toBe("innocent skipped=true");
  });
});

// ---------------------------------------------------------------------------
// writeOutputs — file-level output injection prevention
// ---------------------------------------------------------------------------
describe("writeOutputs", () => {
  let tmpDir: string;
  let outputPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "output-test-"));
    outputPath = path.join(tmpDir, "GITHUB_OUTPUT");
    fs.writeFileSync(outputPath, "");
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("writes key=value pairs to file", () => {
    writeOutputs(outputPath, { key1: "value1", key2: "value2" });
    const content = fs.readFileSync(outputPath, "utf8");
    expect(content).toContain("key1=value1");
    expect(content).toContain("key2=value2");
  });

  test("prevents newline injection in values", () => {
    writeOutputs(outputPath, { result: "safe\nevil_key=evil_value" });
    const content = fs.readFileSync(outputPath, "utf8");
    // The injected newline should be replaced, so there's no "evil_key=" on its own line
    const lines = content.trim().split("\n");
    expect(lines.length).toBe(1);
    expect(lines[0]).toBe("result=safe evil_key=evil_value");
  });

  test("prevents CR+LF injection in values", () => {
    writeOutputs(outputPath, { result: "safe\r\nevil_key=evil_value" });
    const content = fs.readFileSync(outputPath, "utf8");
    const lines = content.trim().split("\n");
    expect(lines.length).toBe(1);
  });

  test("handles shell metacharacters in values (passes through safely)", () => {
    writeOutputs(outputPath, { cmd: "$(whoami) `id` | cat /etc/passwd" });
    const content = fs.readFileSync(outputPath, "utf8");
    // Shell metacharacters are safe in GITHUB_OUTPUT key=value format
    // because they are not evaluated; but newlines must be stripped
    expect(content.trim()).toBe("cmd=$(whoami) `id` | cat /etc/passwd");
  });
});

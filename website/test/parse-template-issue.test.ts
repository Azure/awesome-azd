import { describe, expect, test } from "@jest/globals";

const {
  extractField,
  parseIssueBody,
} = require("../scripts/parse-template-issue");

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

  test("returns error when required fields are missing", () => {
    const partialBody = [
      "### Source Repository",
      "https://github.com/org/repo",
      "",
      "### Template Title",
      "My Template",
    ].join("\n");

    const { error } = parseIssueBody({
      eventName: "issues",
      issueBody: partialBody,
    });
    expect(error).toMatch(/Missing required fields/);
    expect(error).toMatch(/description/);
    expect(error).toMatch(/author/);
    expect(error).toMatch(/author_url/);
  });

  test("returns error when body is empty", () => {
    const { error } = parseIssueBody({
      eventName: "issues",
      issueBody: "",
    });
    expect(error).toMatch(/Missing required fields/);
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

  test("returns error when required dispatch inputs are empty", () => {
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
    expect(error).toMatch(/author_url/);
  });

  test("handles undefined inputs gracefully", () => {
    const { error } = parseIssueBody({
      eventName: "workflow_dispatch",
      inputs: {},
    });
    expect(error).toMatch(/Missing required fields/);
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

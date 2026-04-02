import { describe, expect, it } from "@jest/globals";

const { mergeMetadata } = require("../scripts/merge-extracted-metadata");

describe("mergeMetadata", () => {
  const fakeExtract = async (_repo: string) => ({
    title: "Extracted Title",
    description: "Extracted desc",
    author: "Extracted Author",
    authorUrl: "https://github.com/extracted",
    authorType: "Community",
    previewImage: "",
    iacProvider: "Bicep",
    languages: ["python", "javascript"],
    frameworks: ["flask"],
    azureServices: ["appservice"],
  });

  it("returns extracted values when form values are empty", async () => {
    const result = await mergeMetadata({
      sourceRepo: "https://github.com/test/repo",
      formValues: {},
      extractFn: fakeExtract,
    });
    expect(result.template_title).toBe("Extracted Title");
    expect(result.description).toBe("Extracted desc");
    expect(result.author).toBe("Extracted Author");
    expect(result.languages).toBe("python, javascript");
  });

  it("form values take precedence over extracted values", async () => {
    const result = await mergeMetadata({
      sourceRepo: "https://github.com/test/repo",
      formValues: {
        title: "Form Title",
        description: "Form desc",
      },
      extractFn: fakeExtract,
    });
    expect(result.template_title).toBe("Form Title");
    expect(result.description).toBe("Form desc");
    // Non-overridden fields fall back to extracted
    expect(result.author).toBe("Extracted Author");
  });

  it("handles extraction failure gracefully", async () => {
    const failExtract = async () => {
      throw new Error("network error");
    };
    const result = await mergeMetadata({
      sourceRepo: "https://github.com/test/repo",
      formValues: { title: "My Template" },
      extractFn: failExtract,
    });
    expect(result.template_title).toBe("My Template");
    expect(result.description).toBe("");
    expect(result.source_repo).toBe("https://github.com/test/repo");
  });

  it("always includes source_repo", async () => {
    const result = await mergeMetadata({
      sourceRepo: "https://github.com/test/repo",
      formValues: {},
      extractFn: async () => ({}),
    });
    expect(result.source_repo).toBe("https://github.com/test/repo");
  });
});

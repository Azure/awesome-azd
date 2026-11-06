import { describe, expect, test } from "@jest/globals";
import {
  isGalleryTemplate,
  filterGalleryTemplates,
  unsortedTemplates,
  sortedTemplates,
} from "../src/data/templates";
import { Template } from "../src/data/tags";

// Contract: specialized templates (anything with `templateType` set) live in
// templates.json so dedicated experiences can share one manifest, but they must
// never leak into the "All templates" gallery.
describe("Gallery filter: exclude specialized template types", () => {
  test("isGalleryTemplate returns false for any non-empty templateType", () => {
    const extension = { templateType: "extension.ai.agent" } as Template;
    const aiCollection = { templateType: "ai-app-templates" } as Template;
    const future = { templateType: "extension.mcp.server" } as Template;
    const other = { templateType: "something-else" } as Template;
    expect(isGalleryTemplate(extension)).toBe(false);
    expect(isGalleryTemplate(aiCollection)).toBe(false);
    expect(isGalleryTemplate(future)).toBe(false);
    expect(isGalleryTemplate(other)).toBe(false);
  });

  test("isGalleryTemplate returns true for standard templates (no templateType)", () => {
    const standard = { templateType: undefined } as unknown as Template;
    const nullish = { templateType: null } as unknown as Template;
    const missing = {} as Template;
    const empty = { templateType: "" } as Template;
    expect(isGalleryTemplate(standard)).toBe(true);
    expect(isGalleryTemplate(nullish)).toBe(true);
    expect(isGalleryTemplate(missing)).toBe(true);
    expect(isGalleryTemplate(empty)).toBe(true);
  });

  test("filterGalleryTemplates drops all entries with templateType set", () => {
    const input = [
      { title: "a", templateType: "extension.ai.agent" },
      { title: "b" },
      { title: "c", templateType: "ai-app-templates" },
      { title: "d", templateType: null },
      { title: "e", templateType: "something-else" },
    ] as unknown as Template[];
    const result = filterGalleryTemplates(input);
    expect(result.map((u) => u.title)).toEqual(["b", "d"]);
  });

  test("unsortedUsers contains no entries with templateType set", () => {
    const leaked = unsortedTemplates.filter(
      (u) => typeof u.templateType === "string" && u.templateType !== "",
    );
    expect(leaked).toEqual([]);
  });

  test("sortedUsers contains no entries with templateType set", () => {
    const leaked = sortedTemplates.filter(
      (u) => typeof u.templateType === "string" && u.templateType !== "",
    );
    expect(leaked).toEqual([]);
  });
});

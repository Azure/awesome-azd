import { describe, expect, test } from "@jest/globals";
import { Tags } from "../src/data/tags";
import { CAPABILITY_BADGES } from "../src/data/extensionCapabilities";
import { validateExtensions } from "../src/data/extensions";
import Templates from "../static/templates.json";
import Extensions from "../static/extensions.json";

const templateTagFields = [
  "tags",
  "languages",
  "frameworks",
  "azureServices",
  "IaC",
  "models",
  "appType",
] as const;

type TemplateRecord = Record<string, unknown> & {
  source?: string;
  title?: string;
  templateType?: string;
};

function getTagValues(
  template: TemplateRecord,
  field: (typeof templateTagFields)[number],
): string[] {
  const values = template[field];
  return Array.isArray(values)
    ? values.filter((value): value is string => typeof value === "string")
    : [];
}

const galleryTemplates = (Templates as TemplateRecord[]).filter(
  (template) => !template.templateType,
);

describe("Template metadata", () => {
  test("defines every catalog tag", () => {
    const usedTags = new Set<string>();
    for (const template of galleryTemplates) {
      for (const field of templateTagFields) {
        getTagValues(template, field).forEach((tag) => usedTags.add(tag));
      }
    }

    for (const tag of usedTags) {
      const tagDefinition = Tags[tag];
      if (tagDefinition === undefined) {
        console.error(
          `Error: The tag "${tag}" is not defined in ./src/data/tags.ts.`,
        );
      }
      expect(tagDefinition).toBeDefined();
    }
  });

  test("does not duplicate tags within or across categories", () => {
    for (const template of galleryTemplates) {
      const source = template.source ?? template.title ?? "unknown template";
      const categoriesByTag = new Map<string, string>();

      for (const field of templateTagFields) {
        const values = getTagValues(template, field);
        const duplicateValues = values.filter(
          (tag, index) => values.indexOf(tag) !== index,
        );
        if (duplicateValues.length > 0) {
          throw new Error(
            `${source} repeats ${[...new Set(duplicateValues)].join(", ")} in ${field}`,
          );
        }

        for (const tag of values) {
          const previousField = categoriesByTag.get(tag);
          if (previousField !== undefined) {
            throw new Error(
              `${source} places ${tag} in both ${previousField} and ${field}`,
            );
          }
          categoriesByTag.set(tag, field);
        }
      }
    }
  });
});

describe("Extension metadata", () => {
  test("passes runtime validation without dropping records", () => {
    expect(validateExtensions(Extensions)).toHaveLength(Extensions.length);
  });

  test("defines every extension tag", () => {
    const usedTags = new Set(
      Extensions.flatMap((extension) => extension.tags ?? []),
    );
    for (const tag of usedTags) {
      const tagDefinition = Tags[tag];
      if (tagDefinition === undefined) {
        console.error(
          `Error: The extension tag "${tag}" is not defined in ./src/data/tags.ts.`,
        );
      }
      expect(tagDefinition).toBeDefined();
    }
  });

  test("Extension IDs are unique", () => {
    const ids = Extensions.map((extension) => extension.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  test("Extensions have required fields", () => {
    Extensions.forEach((extension) => {
      expect(extension.id).toBeDefined();
      expect(extension.displayName).toBeDefined();
      expect(extension.description).toBeDefined();
      expect(extension.author).toBeTruthy();
      expect(extension.source).toBeTruthy();
      expect(extension.registryUrl).toBeTruthy();
      expect(extension.capabilities).toBeDefined();
      expect(Array.isArray(extension.capabilities)).toBe(true);
    });
  });

  // Keep the synchronized tag definition, filter category, and card badge in
  // lockstep so new capabilities cannot silently ship with partial UI support.
  test("Extension capabilities are fully wired for display and filtering", () => {
    Extensions.forEach((extension) => {
      extension.capabilities.forEach((capability) => {
        const tag = `ext-${capability}`;
        const tagDefinition = Tags[tag];
        if (tagDefinition === undefined) {
          console.error(
            `Error: capability "${capability}" on extension "${extension.id}" has no "${tag}" entry in ./src/data/tags.ts.`,
          );
        } else if (tagDefinition.type !== "Extension Capability") {
          console.error(
            `Error: tag "${tag}" has type "${tagDefinition.type}" but must be "Extension Capability" to appear in the filter sidebar.`,
          );
        }
        if (CAPABILITY_BADGES[capability] === undefined) {
          console.error(
            `Error: capability "${capability}" on extension "${extension.id}" has no entry in ./src/data/extensionCapabilities.ts, so its card badge would render as raw text.`,
          );
        }
        expect(tagDefinition).toBeDefined();
        expect(tagDefinition.type).toBe("Extension Capability");
        expect(CAPABILITY_BADGES[capability]).toBeDefined();
      });
    });
  });
});

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { describe, expect, test } from "@jest/globals";
import type { Template } from "../src/data/tags";
import type { Extension } from "../src/data/extensionTypes";
import { filterTemplates, filterExtensions } from "../src/utils/galleryFiltering";
import {
  GALLERY_SORT_OPTIONS,
  getSortedTemplates,
  getSortedExtensions,
} from "../src/utils/gallerySorting";
import { getTemplateTags, getExtensionTags } from "../src/utils/galleryTags";
import {
  readSearchName,
  readSearchTags,
  readUnknownSearchTags,
  readSearchAuthors,
  replaceSearchName,
  replaceSearchTags,
  replaceSearchAuthors,
  clearSearchFilters,
} from "../src/utils/galleryQuery";
import {
  getTemplateIdentifier,
  formatAzdInitCommand,
} from "../src/utils/templateCommands";

const templates: Template[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    title: "Zulu Python API",
    description: "A serverless application",
    author: "Ada, Grace",
    authorUrl: "https://github.com/ada, https://github.com/grace",
    source: "https://github.com/Example/Python-API",
    tags: ["community"],
    languages: ["python"],
    frameworks: ["django"],
    azureServices: ["functions"],
    IaC: ["bicep"],
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    title: "Alpha Web",
    description: "A web application",
    author: "Grace",
    authorUrl: "https://github.com/grace",
    source: "https://github.com/Azure-Samples/Web-App",
    tags: ["msft"],
    languages: ["typescript"],
    frameworks: ["reactjs"],
    azureServices: ["swa"],
    IaC: ["terraform"],
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    title: "Python dashboard",
    description: "A dashboard",
    author: "Linus",
    authorUrl: "https://github.com/linus",
    source: "https://github.com/Example/Dashboard",
    tags: ["community"],
    languages: ["python"],
  },
];

const extensions: Extension[] = [
  {
    id: "example.beta",
    displayName: "Beta Tools",
    description: "Build containers",
    author: "Ada, Grace",
    source: "https://github.com/Example/Beta",
    registryUrl: "https://example.com/registry.json",
    capabilities: ["lifecycle-events", "custom-commands"],
    tags: ["community"],
    website: "https://docs.example.com/guides",
  },
  {
    id: "example.alpha",
    displayName: "Alpha Tools",
    description: "Local validation",
    author: "Linus",
    source: "https://github.com/Example/Alpha",
    registryUrl: "https://example.com/registry.json",
    capabilities: ["validation-provider"],
    tags: ["msft"],
  },
];

describe("production gallery tag helpers", () => {
  test("combines all template categories in their existing order", () => {
    expect(getTemplateTags(templates[0])).toEqual([
      "community", "python", "django", "functions", "bicep",
    ]);
    expect(getTemplateTags(templates[2])).toEqual(["community", "python"]);
  });

  test("appends derived extension capabilities after catalog tags", () => {
    expect(getExtensionTags(extensions[0])).toEqual([
      "community", "ext-lifecycle-events", "ext-custom-commands",
    ]);
  });
});

describe("production gallery filtering", () => {
  test("keeps the original array when there are no filters", () => {
    expect(filterTemplates(templates, [], [], null)).toBe(templates);
    expect(filterExtensions(extensions, [], [], null)).toBe(extensions);
  });

  test("searches template titles and authors case-insensitively", () => {
    expect(filterTemplates(templates, [], [], "PYTHON")).toEqual([
      templates[0], templates[2],
    ]);
    expect(filterTemplates(templates, [], [], "GRACE")).toEqual([
      templates[0], templates[1],
    ]);
    expect(filterTemplates(templates, [], [], "serverless")).toEqual([]);
  });

  test("matches any selected individual author in a multi-author entry", () => {
    expect(filterTemplates(templates, [], ["Grace"], null)).toEqual([
      templates[0], templates[1],
    ]);
    expect(filterTemplates(templates, [], ["Ada", "Linus"], null)).toEqual([
      templates[0], templates[2],
    ]);
    expect(filterExtensions(extensions, [], ["Grace"], null)).toEqual([
      extensions[0],
    ]);
  });

  test("requires all selected tags across template categories", () => {
    expect(filterTemplates(templates, ["python", "bicep"], [], null)).toEqual([
      templates[0],
    ]);
    expect(filterTemplates(templates, ["python", "terraform"], [], null)).toEqual([]);
  });

  test("combines search, author and capability filters without mutating input", () => {
    const originalTemplates = JSON.stringify(templates);
    const originalExtensions = JSON.stringify(extensions);
    expect(filterTemplates(templates, ["community"], ["Grace"], "python")).toEqual([
      templates[0],
    ]);
    expect(filterExtensions(extensions, ["community", "ext-lifecycle-events"], ["Ada"], "beta")).toEqual([
      extensions[0],
    ]);
    expect(filterExtensions(extensions, ["ext-validation-provider"], ["Ada"], null)).toEqual([]);
    expect(JSON.stringify(templates)).toBe(originalTemplates);
    expect(JSON.stringify(extensions)).toBe(originalExtensions);
  });

  test.each(["BETA TOOLS", "CONTAINERS", "ADA", "EXAMPLE.BETA", "DOCS.EXAMPLE.COM"])(
    "searches every extension field for %s",
    (query) => {
      expect(filterExtensions(extensions, [], [], query)).toEqual([extensions[0]]);
    },
  );
});

describe("production gallery sorting", () => {
  const alphabeticalTemplates = [templates[1], templates[2], templates[0]];
  const alphabeticalExtensions = [extensions[1], extensions[0]];

  test.each<[string, Template[]]>([
    [GALLERY_SORT_OPTIONS[0], [templates[2], templates[1], templates[0]]],
    [GALLERY_SORT_OPTIONS[1], templates],
    [GALLERY_SORT_OPTIONS[2], alphabeticalTemplates],
    [GALLERY_SORT_OPTIONS[3], [templates[0], templates[2], templates[1]]],
  ])("preserves template ordering for %s", (choice, expected) => {
    expect(getSortedTemplates(templates, alphabeticalTemplates, choice)).toEqual(expected);
    expect(templates.map((template) => template.id)).toEqual([
      "00000000-0000-4000-8000-000000000001",
      "00000000-0000-4000-8000-000000000002",
      "00000000-0000-4000-8000-000000000003",
    ]);
  });

  test.each<[string, Extension[]]>([
    [GALLERY_SORT_OPTIONS[0], [extensions[1], extensions[0]]],
    [GALLERY_SORT_OPTIONS[1], extensions],
    [GALLERY_SORT_OPTIONS[2], alphabeticalExtensions],
    [GALLERY_SORT_OPTIONS[3], extensions],
  ])("preserves extension ordering for %s", (choice, expected) => {
    expect(getSortedExtensions(extensions, alphabeticalExtensions, choice)).toEqual(expected);
    expect(extensions.map((extension) => extension.id)).toEqual([
      "example.beta", "example.alpha",
    ]);
  });

  test.each([undefined, "unsupported"])("preserves different fallback orders for %s", (choice) => {
    expect(getSortedTemplates(templates, alphabeticalTemplates, choice)).toBe(alphabeticalTemplates);
    expect(getSortedExtensions(extensions, alphabeticalExtensions, choice)).toBe(extensions);
  });
});

describe("production gallery query helpers", () => {
  const search = "?name=Hello+world&tags=python&tags=outdated&tags=__proto__&tags=typescript&tags=python&tags=constructor&authors=Grace&authors=Ada&marker=one&marker=two&type=extensions";

  test("rejects unknown and prototype keys while retaining valid tag order and duplicates", () => {
    expect(readSearchName(search)).toBe("Hello world");
    expect(readSearchTags(search)).toEqual(["python", "typescript", "python"]);
    expect(readUnknownSearchTags(search)).toEqual(["outdated", "__proto__", "constructor"]);
    expect(readSearchAuthors(search)).toEqual(["Grace", "Ada"]);
  });

  test("reads absent filters without inventing defaults", () => {
    expect(readSearchName("")).toBeNull();
    expect(readSearchTags("")).toEqual([]);
    expect(readUnknownSearchTags("")).toEqual([]);
    expect(readSearchAuthors("")).toEqual([]);
  });

  test("replaces a name without dropping unrelated or repeated parameters", () => {
    const updated = replaceSearchName(search, "A + B & C");
    expect(readSearchName(updated)).toBe("A + B & C");
    expect(new URLSearchParams(updated).getAll("marker")).toEqual(["one", "two"]);
    expect(new URLSearchParams(updated).getAll("tags")).toEqual(
      new URLSearchParams(search).getAll("tags"),
    );
    expect(readSearchName(replaceSearchName(updated, null))).toBeNull();
  });

  test("replaces tags and authors while preserving the other filters", () => {
    const withTags = replaceSearchTags(search, ["bicep", "python", "python"]);
    expect(readSearchTags(withTags)).toEqual(["bicep", "python", "python"]);
    expect(readSearchAuthors(withTags)).toEqual(["Grace", "Ada"]);
    expect(readSearchName(withTags)).toBe("Hello world");
    const withAuthors = replaceSearchAuthors(withTags, ["Ada + Grace", "Linus"]);
    expect(readSearchAuthors(withAuthors)).toEqual(["Ada + Grace", "Linus"]);
    expect(readSearchTags(withAuthors)).toEqual(["bicep", "python", "python"]);
    expect(new URLSearchParams(withAuthors).getAll("marker")).toEqual(["one", "two"]);
    expect(new URLSearchParams(withAuthors).get("type")).toBe("extensions");
  });

  test("clears only tag and author filters", () => {
    const cleared = clearSearchFilters(search);
    expect(readSearchTags(cleared)).toEqual([]);
    expect(readUnknownSearchTags(cleared)).toEqual([]);
    expect(readSearchAuthors(cleared)).toEqual([]);
    expect(readSearchName(cleared)).toBe("Hello world");
    expect(new URLSearchParams(cleared).getAll("marker")).toEqual(["one", "two"]);
    expect(new URLSearchParams(cleared).get("type")).toBe("extensions");
  });
});

describe("production template commands", () => {
  test.each([
    ["https://github.com/Azure-Samples/My-App", "my-app"],
    ["https://github.com/Example/My-App", "example/my-app"],
    ["https://github.com/Azure-Samples/Examples/tree/main/App", "examples/tree/main/app"],
  ])("preserves the identifier and init command for %s", (source, identifier) => {
    expect(getTemplateIdentifier(source)).toBe(identifier);
    expect(formatAzdInitCommand(identifier)).toBe(`azd init -t ${identifier}`);
  });
});

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { describe, expect, test } from "@jest/globals";
import type { Extension } from "../src/data/extensionTypes";
import { filterExtensions } from "../src/utils/galleryFiltering";
import {
  EXTENSION_SORT_OPTIONS,
  getSortedExtensions,
} from "../src/utils/gallerySorting";
import { getExtensionTags } from "../src/utils/galleryTags";
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
import { splitAuthors } from "../src/utils/jsUtils";
import { validateExtensions } from "../src/data/extensions";

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

describe("extension metadata validation", () => {
  const safeExtension: Extension = {
    ...extensions[0],
    registryUrl:
      "https://raw.githubusercontent.com/example/extensions/main/registry.json",
  };

  test("accepts HTTPS links and a shell-safe raw GitHub registry URL", () => {
    expect(validateExtensions([safeExtension])).toEqual([safeExtension]);
  });

  test.each([
    ["id", "--help"],
    ["source", "javascript:alert(1)"],
    ["authorUrl", "https://user:password@github.com/example"],
    ["website", "data:text/html,test"],
    [
      "registryUrl",
      "https://raw.githubusercontent.com/example/extensions/main/registry.json;calc",
    ],
    [
      "registryUrl",
      "https://raw.githubusercontent.com/$(printf INJECTED)/../example/extensions/main/registry.json",
    ],
  ] as const)("rejects an unsafe %s", (field, value) => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    expect(
      validateExtensions([{ ...safeExtension, [field]: value }]),
    ).toEqual([]);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(`'${field}'`),
    );

    warn.mockRestore();
  });
});

describe("extension gallery tag helpers", () => {
  test("appends derived extension capabilities after catalog tags", () => {
    expect(getExtensionTags(extensions[0])).toEqual([
      "community", "ext-lifecycle-events", "ext-custom-commands",
    ]);
  });
});

describe("extension gallery filtering", () => {
  test("keeps the original array when there are no filters", () => {
    expect(filterExtensions(extensions, [], [], null)).toBe(extensions);
  });

  test("matches individual authors in multi-author entries", () => {
    expect(filterExtensions(extensions, [], ["Grace"], null)).toEqual([
      extensions[0],
    ]);
  });

  test("combines search, author and capability filters without mutating input", () => {
    const originalExtensions = JSON.stringify(extensions);
    expect(
      filterExtensions(
        extensions,
        ["community", "ext-lifecycle-events"],
        ["Ada"],
        "beta",
      ),
    ).toEqual([extensions[0]]);
    expect(
      filterExtensions(
        extensions,
        ["ext-validation-provider"],
        ["Ada"],
        null,
      ),
    ).toEqual([]);
    expect(JSON.stringify(extensions)).toBe(originalExtensions);
  });

  test.each([
    "BETA TOOLS",
    "CONTAINERS",
    "ADA",
    "EXAMPLE.BETA",
    "DOCS.EXAMPLE.COM",
  ])("searches every extension field for %s", (query) => {
    expect(filterExtensions(extensions, [], [], query)).toEqual([
      extensions[0],
    ]);
  });

  test("normalizes comma-separated authors", () => {
    expect(splitAuthors("John Doe, Jane Smith")).toEqual([
      "John Doe",
      "Jane Smith",
    ]);
    expect(splitAuthors("John Doe,Jane Smith")).toEqual([
      "John Doe",
      "Jane Smith",
    ]);
    expect(splitAuthors("John Doe")).toEqual(["John Doe"]);
    expect(splitAuthors("")).toEqual([]);
  });
});

describe("extension gallery sorting", () => {
  const alphabeticalExtensions = [extensions[1], extensions[0]];

  test.each<[string, Extension[]]>([
    [EXTENSION_SORT_OPTIONS[0], [extensions[1], extensions[0]]],
    [EXTENSION_SORT_OPTIONS[1], extensions],
    [EXTENSION_SORT_OPTIONS[2], alphabeticalExtensions],
    [EXTENSION_SORT_OPTIONS[3], extensions],
  ])("preserves extension ordering for %s", (choice, expected) => {
    expect(
      getSortedExtensions(extensions, alphabeticalExtensions, choice),
    ).toEqual(expected);
    expect(extensions.map((extension) => extension.id)).toEqual([
      "example.beta", "example.alpha",
    ]);
  });

  test.each([undefined, "unsupported"])(
    "falls back to manifest order for %s",
    (choice) => {
      expect(
        getSortedExtensions(extensions, alphabeticalExtensions, choice),
      ).toBe(extensions);
    },
  );
});

describe("extension gallery query helpers", () => {
  const search =
    "?name=Hello+world&tags=python&tags=outdated&tags=__proto__&tags=typescript&tags=python&tags=constructor&authors=Grace&authors=Ada&marker=one&marker=two&type=extensions";

  test("rejects unknown and prototype keys while retaining valid tag order and duplicates", () => {
    expect(readSearchName(search)).toBe("Hello world");
    expect(readSearchTags(search)).toEqual(["python", "typescript", "python"]);
    expect(readUnknownSearchTags(search)).toEqual([
      "outdated",
      "__proto__",
      "constructor",
    ]);
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
    expect(new URLSearchParams(withAuthors).getAll("marker")).toEqual([
      "one",
      "two",
    ]);
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

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { describe, expect, test } from "@jest/globals";
import templates from "../static/templates.json";
import {
  catalogTemplates,
  findCatalogTemplate,
  getCatalogTemplatePath,
} from "../src/catalog/catalogData";
import {
  clearCatalogState,
  getMatchingCatalogTemplates,
  parseCatalogState,
  serializeCatalogState,
  sortCatalogTemplates,
} from "../src/catalog/catalogQuery";

describe("unified catalog data", () => {
  test("includes standard and AI templates without duplicate sources", () => {
    const expectedCount = templates.filter(
      (template) =>
        template.templateType == null ||
        template.templateType === "" ||
        template.templateType === "ai-app-templates",
    ).length;

    expect(catalogTemplates).toHaveLength(expectedCount);
    expect(catalogTemplates.filter((template) => template.isAi)).toHaveLength(
      56,
    );
    expect(
      new Set(
        catalogTemplates.map((template) => template.normalizedSource),
      ).size,
    ).toBe(catalogTemplates.length);
  });

  test("creates stable detail paths for current and legacy repositories", () => {
    const template =
      catalogTemplates.find((candidate) => candidate.legacySlugs.length > 0) ??
      catalogTemplates[0];
    expect(getCatalogTemplatePath(template)).toBe(
      `/templates/${template.slug}`,
    );
    expect(
      findCatalogTemplate(template.owner, template.repo)?.id,
    ).toBe(template.id);
    for (const legacySlug of template.legacySlugs) {
      const [owner, repo] = legacySlug.split("/");
      expect(findCatalogTemplate(owner, repo)?.id).toBe(template.id);
    }
  });

  test("does not expose author email fields through the unified view model", () => {
    expect(
      catalogTemplates.flatMap((template) => template.authors),
    ).not.toEqual(expect.arrayContaining([expect.stringContaining("@")]));
  });

  test("derives featured status only from the existing featured tag", () => {
    const rawTemplates = templates as Array<{
      source?: string;
      tags?: unknown;
      templateType?: string;
    }>;
    const expectedFeaturedSources = rawTemplates
      .filter(
        (template) =>
          (template.templateType == null ||
            template.templateType === "" ||
            template.templateType === "ai-app-templates") &&
          Array.isArray(template.tags) &&
          template.tags.includes("featured"),
      )
      .map((template) => template.source)
      .filter((source): source is string => typeof source === "string")
      .sort();
    const actualFeaturedSources = catalogTemplates
      .filter((template) => template.featured)
      .map((template) => template.source)
      .sort();

    expect(actualFeaturedSources).toEqual(expectedFeaturedSources);
  });
});

describe("unified catalog query", () => {
  test("filters AI templates through the prototype-compatible type query", () => {
    const state = parseCatalogState("?type=ai", catalogTemplates);
    const matches = getMatchingCatalogTemplates(
      catalogTemplates,
      state,
      null,
    );

    expect(matches).toHaveLength(56);
    expect(matches.every((template) => template.isAi)).toBe(true);
    expect(serializeCatalogState(state)).toBe("type=ai");
  });

  test("combines local search with allowlisted backend source matches", () => {
    const target = catalogTemplates.find((template) => template.isAi);
    if (!target) {
      throw new Error("Expected an AI catalog template.");
    }
    const state = parseCatalogState(
      "?q=zzzz-no-local-match",
      catalogTemplates,
    );
    const matches = getMatchingCatalogTemplates(
      catalogTemplates,
      state,
      new Set([target.normalizedSource]),
    );

    expect(matches).toEqual([target]);
  });

  test("ignores unavailable saved filters without losing valid criteria", () => {
    const state = parseCatalogState(
      "?language=Python,Unknown&type=ai",
      catalogTemplates,
    );

    expect(state.languages).toEqual(["Python"]);
    expect(state.types).toEqual(["ai"]);
    expect(state.unavailable).toEqual(["Language: Unknown"]);
  });

  test.each(["newest", "oldest", "az", "za"] as const)(
    "round-trips the %s sort option",
    (sort) => {
      const state = parseCatalogState(`?sort=${sort}`, catalogTemplates);

      expect(state.sort).toBe(sort);
      expect(serializeCatalogState(state)).toBe(`sort=${sort}`);
    },
  );

  test("restores the previous chronology and alphabetical orders", () => {
    const sourceOrder = new Map(
      catalogTemplates.map((template, index) => [
        template.normalizedSource,
        index,
      ]),
    );
    const sources = catalogTemplates.map(
      (template) => template.normalizedSource,
    );
    const titles = catalogTemplates.map((template) => template.title);
    const state = clearCatalogState();
    const metrics = new Map();

    expect(
      sortCatalogTemplates(
        catalogTemplates,
        { ...state, sort: "oldest" },
        metrics,
        sourceOrder,
      ).map((template) => template.normalizedSource),
    ).toEqual(sources);
    expect(
      sortCatalogTemplates(
        catalogTemplates,
        { ...state, sort: "newest" },
        metrics,
        sourceOrder,
      ).map((template) => template.normalizedSource),
    ).toEqual([...sources].reverse());
    expect(
      sortCatalogTemplates(
        catalogTemplates,
        { ...state, sort: "az" },
        metrics,
        sourceOrder,
      ).map((template) => template.title),
    ).toEqual([...titles].sort((left, right) => left.localeCompare(right)));
    expect(
      sortCatalogTemplates(
        catalogTemplates,
        { ...state, sort: "za" },
        metrics,
        sourceOrder,
      ).map((template) => template.title),
    ).toEqual(
      [...titles].sort((left, right) => right.localeCompare(left)),
    );
  });

  test("keeps popularity independent from the featured presentation tag", () => {
    const featured = catalogTemplates.find((template) => template.featured);
    const regular = catalogTemplates.find((template) => !template.featured);
    if (!featured || !regular) {
      throw new Error("Expected featured and regular catalog templates.");
    }

    const sourceOrder = new Map([
      [featured.normalizedSource, 0],
      [regular.normalizedSource, 1],
    ]);
    const metrics = new Map([
      [
        featured.normalizedSource,
        { forks: 0, stars: 1, updatedOn: "2025-01-01", score: 1 },
      ],
      [
        regular.normalizedSource,
        { forks: 0, stars: 10, updatedOn: "2025-01-02", score: 10 },
      ],
    ]);

    expect(
      sortCatalogTemplates(
        [featured, regular],
        clearCatalogState(),
        metrics,
        sourceOrder,
      ).map((template) => template.normalizedSource),
    ).toEqual([regular.normalizedSource, featured.normalizedSource]);
  });
});


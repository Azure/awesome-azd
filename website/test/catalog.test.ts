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

  test("keeps the renamed AI chat repository route working", () => {
    const template = findCatalogTemplate(
      "azure-samples",
      "azureai-basic-python",
    );

    expect(template?.source).toBe(
      "https://github.com/Azure-Samples/get-started-with-ai-chat",
    );
  });

  test("does not expose author email fields through the unified view model", () => {
    expect(
      catalogTemplates.flatMap((template) => template.authors),
    ).not.toEqual(expect.arrayContaining([expect.stringContaining("@")]));
    expect(
      catalogTemplates.some((template) => "markdownUrl" in template),
    ).toBe(false);
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

  test("uses one canonical PostgreSQL facet label", () => {
    const labels = [
      ...new Set(
        catalogTemplates
          .flatMap((template) => template.databases)
          .filter((label) => /postgresql/i.test(label)),
      ),
    ];

    expect(labels).toEqual(["Azure Database for PostgreSQL"]);
  });

  test("distinguishes database queries from document chat", () => {
    const sqlTemplate = catalogTemplates.find(
      (template) => template.title === "NLP to SQL In-A-Box",
    );
    const cargoTemplate = catalogTemplates.find((template) =>
      template.title.startsWith("Jakarta Java EE Cargo Tracker"),
    );

    expect(sqlTemplate?.task).toBe("Query a database");
    expect(cargoTemplate?.task).toBe("Build a web app");
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

  test("supports current and legacy service links", () => {
    const currentState = parseCatalogState(
      "?service=aca",
      catalogTemplates,
    );
    const legacyState = parseCatalogState("?tags=swa", catalogTemplates);

    expect(currentState.services).toEqual(["aca"]);
    expect(legacyState.legacyTags).toEqual(["swa"]);
    expect(
      getMatchingCatalogTemplates(
        catalogTemplates,
        legacyState,
        null,
      ).every((template) => template.legacyTags.includes("swa")),
    ).toBe(true);
    expect(serializeCatalogState(legacyState)).toBe("tags=swa");
  });

  test("preserves AND semantics for repeated legacy tags", () => {
    const state = parseCatalogState(
      "?tags=python&tags=aca",
      catalogTemplates,
    );
    const matches = getMatchingCatalogTemplates(
      catalogTemplates,
      state,
      null,
    );

    expect(state.legacyTags).toEqual(["python", "aca"]);
    expect(matches.length).toBeGreaterThan(0);
    expect(
      matches.every(
        (template) =>
          template.legacyTags.includes("python") &&
          template.legacyTags.includes("aca"),
      ),
    ).toBe(true);
    expect(serializeCatalogState(state)).toBe("tags=python%2Caca");
  });

  test("preserves exact legacy author filters", () => {
    const state = parseCatalogState(
      "?authors=Microsoft",
      catalogTemplates,
    );
    const matches = getMatchingCatalogTemplates(
      catalogTemplates,
      state,
      null,
    );

    expect(state.authors).toEqual(["Microsoft"]);
    expect(matches.length).toBeGreaterThan(0);
    expect(
      matches.every((template) => template.authors.includes("Microsoft")),
    ).toBe(true);
    expect(serializeCatalogState(state)).toBe("authors=Microsoft");
  });

  test("round-trips pagination with the catalog state", () => {
    const state = parseCatalogState(
      "?type=ai&page=2",
      catalogTemplates,
    );

    expect(state.page).toBe(2);
    expect(serializeCatalogState(state)).toBe("type=ai&page=2");
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

  test("reorders measured templates without demoting unmeasured templates", () => {
    const [unmeasured, lessPopular, morePopular] = catalogTemplates;
    const sourceOrder = new Map([
      [unmeasured.normalizedSource, 0],
      [lessPopular.normalizedSource, 1],
      [morePopular.normalizedSource, 2],
    ]);
    const metrics = new Map([
      [
        lessPopular.normalizedSource,
        { forks: 0, stars: 1, updatedOn: "2025-01-01", score: 1 },
      ],
      [
        morePopular.normalizedSource,
        { forks: 0, stars: 10, updatedOn: "2025-01-02", score: 10 },
      ],
    ]);

    expect(
      sortCatalogTemplates(
        [unmeasured, lessPopular, morePopular],
        clearCatalogState(),
        metrics,
        sourceOrder,
      ).map((template) => template.normalizedSource),
    ).toEqual([
      unmeasured.normalizedSource,
      morePopular.normalizedSource,
      lessPopular.normalizedSource,
    ]);
  });
});


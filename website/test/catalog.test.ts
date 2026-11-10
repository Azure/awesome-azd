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
import { isCatalogTemplate } from "../route_generator_plugin/aiRouteGenerator";
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
      templates.filter(
        (template) => template.templateType === "ai-app-templates",
      ).length,
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

  test("preserves legacy preview images in the unified view model", () => {
    const rawTemplate = templates.find(
      (template) =>
        typeof template.preview === "string" && template.preview.length > 0,
    );
    if (!rawTemplate) {
      throw new Error("Expected a template with a legacy preview image.");
    }

    expect(
      catalogTemplates.find(
        (template) => template.source === rawTemplate.source,
      )?.preview,
    ).toBe(rawTemplate.preview);
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

  test("does not duplicate resources when legacy service aliases are preserved", () => {
    for (const template of catalogTemplates) {
      expect(
        new Set(template.resources.map((resource) => resource.label)).size,
      ).toBe(template.resources.length);
    }
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

  test("uses positive task signals when language metadata is missing", () => {
    const apiTemplate = catalogTemplates.find(
      (template) =>
        template.title ===
        "Minimal .NET API with ConferenceAPI sample",
    );
    const webTemplate = catalogTemplates.find(
      (template) =>
        template.title ===
        "Blazor BadgeMaker with Azure AI Services",
    );

    expect(apiTemplate?.task).toBe("Build an API");
    expect(webTemplate?.task).toBe("Build a web app");
  });
});

describe("catalog route generation", () => {
  test.each([undefined, null, "", "ai-app-templates"])(
    "generates detail routes for templateType %p",
    (templateType) => {
      expect(
        isCatalogTemplate({
          source: "https://github.com/example/template",
          templateType,
        }),
      ).toBe(true);
    },
  );

  test("does not generate detail routes for other specialized templates", () => {
    expect(
      isCatalogTemplate({
        source: "https://github.com/example/extension",
        templateType: "extension.ai.agent",
      }),
    ).toBe(false);
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
    const expectedAiCount = catalogTemplates.filter(
      (template) => template.isAi,
    ).length;

    expect(matches).toHaveLength(expectedAiCount);
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

  test("preserves curated migration services and languages", () => {
    const cargoState = parseCatalogState(
      "?tags=aks&q=cargo%20tracker",
      catalogTemplates,
    );
    const cargoMatches = getMatchingCatalogTemplates(
      catalogTemplates,
      cargoState,
      null,
    );
    const purviewTemplate = catalogTemplates.find(
      (template) =>
        template.source ===
        "https://github.com/Azure-Samples/azure-search-openai-demo-purviewdatasecurity",
    );
    const ragTemplate = catalogTemplates.find(
      (template) =>
        template.source ===
        "https://github.com/Azure-Samples/azure-search-openai-demo",
    );

    expect(cargoMatches.map((template) => template.source)).toContain(
      "https://github.com/Azure-Samples/cargotracker-liberty-aks-azd",
    );
    expect(purviewTemplate?.serviceIds).toContain("purview");
    expect(ragTemplate?.legacyTags).toContain("nodejs");
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

  test("preserves superseded author names as filter aliases", () => {
    const state = parseCatalogState(
      "?authors=ISE%20Scale",
      catalogTemplates,
    );
    const matches = getMatchingCatalogTemplates(
      catalogTemplates,
      state,
      null,
    );

    expect(state.authors).toEqual(["ISE Scale"]);
    expect(matches.map((template) => template.source)).toContain(
      "https://github.com/Azure-Samples/Copilot-Studio-with-Azure-AI-Search",
    );
    expect(
      matches.every((template) =>
        template.legacyAuthors.includes("ISE Scale"),
      ),
    ).toBe(true);
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

  test("normalizes the legacy popularity sort to recommended order", () => {
    const state = parseCatalogState(
      "?sort=popular",
      catalogTemplates,
    );

    expect(state.sort).toBe("recommended");
    expect(serializeCatalogState(state)).toBe("");
  });

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

    expect(
      sortCatalogTemplates(
        catalogTemplates,
        { ...state, sort: "oldest" },
        sourceOrder,
      ).map((template) => template.normalizedSource),
    ).toEqual(sources);
    expect(
      sortCatalogTemplates(
        catalogTemplates,
        { ...state, sort: "newest" },
        sourceOrder,
      ).map((template) => template.normalizedSource),
    ).toEqual([...sources].reverse());
    expect(
      sortCatalogTemplates(
        catalogTemplates,
        { ...state, sort: "az" },
        sourceOrder,
      ).map((template) => template.title),
    ).toEqual([...titles].sort((left, right) => left.localeCompare(right)));
    expect(
      sortCatalogTemplates(
        catalogTemplates,
        { ...state, sort: "za" },
        sourceOrder,
      ).map((template) => template.title),
    ).toEqual(
      [...titles].sort((left, right) => right.localeCompare(left)),
    );
  });

  test("uses curated source order for the recommended sort", () => {
    const [first, second, third] = catalogTemplates;
    const sourceOrder = new Map([
      [first.normalizedSource, 0],
      [second.normalizedSource, 1],
      [third.normalizedSource, 2],
    ]);

    expect(
      sortCatalogTemplates(
        [third, first, second],
        clearCatalogState(),
        sourceOrder,
      ).map((template) => template.normalizedSource),
    ).toEqual([
      first.normalizedSource,
      second.normalizedSource,
      third.normalizedSource,
    ]);
  });
});


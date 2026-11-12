/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { describe, expect, test } from "@jest/globals";
import templates from "../static/templates.json";
import reviewedTemplateUseCases from "../src/catalog/template-use-cases.json";
import { catalogTemplates } from "../src/catalog/catalogData";
import {
  catalogFacets,
  clearCatalogState,
  getFacetOptions,
  getFacetValueCounts,
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

  test("keeps the renamed AI chat template in the catalog", () => {
    const template = catalogTemplates.find(
      (candidate) =>
        candidate.source ===
        "https://github.com/Azure-Samples/get-started-with-ai-chat",
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

  test("has reviewed use cases for every catalog template", () => {
    expect(Object.keys(reviewedTemplateUseCases).sort()).toEqual(
      catalogTemplates
        .map((template) => template.normalizedSource)
        .sort(),
    );
    expect(
      catalogTemplates.every((template) => template.tasks.length > 0),
    ).toBe(true);
    expect(
      catalogTemplates.some((template) => template.tasks.length > 1),
    ).toBe(true);
  });

  test("preserves the reviewed decisions for ambiguous templates", () => {
    expect(
      catalogTemplates.find(
        (template) =>
          template.source ===
          "https://github.com/Arize-ai/phoenix-on-azure",
      )?.tasks,
    ).toEqual(["Start with infrastructure"]);
    expect(
      catalogTemplates.find(
        (template) =>
          template.source ===
          "https://github.com/petender/azd-vision-face",
      )?.tasks,
    ).toEqual(["Build a web app", "Start with infrastructure"]);
  });

  test("preserves reviewed catalog-retention and authorship decisions", () => {
    const sources = catalogTemplates.map((template) => template.source);
    expect(sources).not.toContain(
      "https://github.com/Azure-Samples/Azure-Language-OpenAI-Conversational-Agent-Accelerator",
    );
    expect(sources).not.toContain(
      "https://github.com/Azure-Samples/Copilot-Studio-with-Azure-AI-Search",
    );
    expect(
      catalogTemplates.find(
        (template) =>
          template.source ===
          "https://github.com/seligj95/app-service-foundry-chat",
      )?.authorship,
    ).toBe("Community");
  });

  test("keeps new tags only on the two templates added within the past month", () => {
    expect(
      catalogTemplates
        .filter((template) => template.legacyTags.includes("new"))
        .map((template) => template.source)
        .sort(),
    ).toEqual(
      [
        "https://github.com/JayChase/langchain-ag-ui-angular",
        "https://github.com/massimobonanni/DBSemanticSearch",
      ].sort(),
    );
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

    expect(sqlTemplate?.tasks).toContain("Query a database");
    expect(cargoTemplate?.tasks).toEqual(["Build a web app"]);
  });

  test("uses reviewed use cases when language metadata is missing", () => {
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

    expect(apiTemplate?.tasks).toContain("Build an API");
    expect(webTemplate?.tasks).toContain("Build a web app");
  });
});

describe("unified catalog query", () => {
  test("filters AI templates through the prototype-compatible type query", () => {
    const state = parseCatalogState("?type=ai", catalogTemplates);
    const matches = getMatchingCatalogTemplates(
      catalogTemplates,
      state,
    );
    const expectedAiCount = catalogTemplates.filter(
      (template) => template.isAi,
    ).length;

    expect(matches).toHaveLength(expectedAiCount);
    expect(matches.every((template) => template.isAi)).toBe(true);
    expect(serializeCatalogState(state)).toBe("type=ai");
  });

  test("translates the legacy AI collection tag without dropping other filters", () => {
    const state = parseCatalogState(
      "?tags=aicollection&tags=python",
      catalogTemplates,
    );
    const matches = getMatchingCatalogTemplates(
      catalogTemplates,
      state,
    );

    expect(state.types).toEqual(["ai"]);
    expect(state.legacyTags).toEqual(["python"]);
    expect(state.unavailable).toEqual([]);
    expect(matches.length).toBeGreaterThan(0);
    expect(
      matches.every(
        (template) =>
          template.isAi && template.legacyTags.includes("python"),
      ),
    ).toBe(true);
    expect(serializeCatalogState(state)).toBe("type=ai&tags=python");
  });

  test("lists Microsoft before Community in the authorship filter", () => {
    const authorshipFacet = catalogFacets.find(
      (facet) => facet.key === "authorship",
    );
    if (!authorshipFacet) {
      throw new Error("Expected the authorship facet.");
    }

    expect(getFacetOptions(catalogTemplates, authorshipFacet)).toEqual([
      "Microsoft",
      "Community",
    ]);
  });

  test("counts facet values in one pass while ignoring that facet", () => {
    const languageFacet = catalogFacets.find(
      (facet) => facet.key === "languages",
    );
    if (!languageFacet) {
      throw new Error("Expected the language facet.");
    }

    const state = parseCatalogState(
      "?type=ai&language=Python",
      catalogTemplates,
    );
    const counts = getFacetValueCounts(
      catalogTemplates,
      state,
      languageFacet,
    );
    const expectedTypeScriptCount = catalogTemplates.filter(
      (template) =>
        template.isAi && template.languages.includes("TypeScript"),
    ).length;

    expect(counts.get("TypeScript")).toBe(expectedTypeScriptCount);
  });

  test("searches title, description, tags, authors, and use case locally", () => {
    const target = catalogTemplates.find(
      (template) =>
        template.source ===
        "https://github.com/Azure-Samples/get-started-with-ai-chat",
    );
    if (!target) {
      throw new Error("Expected the Get Started with Chat template.");
    }

    const queries = [
      target.title,
      target.description,
      target.legacyTags[0],
      target.authors[0],
      ...target.tasks,
    ];

    for (const query of queries) {
      const state = parseCatalogState(
        `?${new URLSearchParams({ q: query })}`,
        catalogTemplates,
      );
      const matches = getMatchingCatalogTemplates(
        catalogTemplates,
        state,
      );

      expect(
        matches.map((template) => template.normalizedSource),
      ).toContain(target.normalizedSource);
      expect(query).toBeTruthy();
    }
  });

  test("filters templates by every reviewed use case", () => {
    const target = catalogTemplates.find(
      (template) =>
        template.source ===
        "https://github.com/Azure-Samples/azure-search-openai-demo-csharp",
    );
    if (!target) {
      throw new Error("Expected the C# RAG chat template.");
    }

    expect(target.tasks).toEqual([
      "Build a web app",
      "Build an API",
      "Chat with documents",
    ]);
    for (const task of target.tasks) {
      const state = parseCatalogState(
        `?${new URLSearchParams({ task })}`,
        catalogTemplates,
      );
      expect(
        getMatchingCatalogTemplates(catalogTemplates, state).map(
          (template) => template.normalizedSource,
        ),
      ).toContain(target.normalizedSource);
    }
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

  test("uses reviewed migration services and languages", () => {
    const cargoState = parseCatalogState(
      "?tags=aks&q=cargo%20tracker",
      catalogTemplates,
    );
    const cargoMatches = getMatchingCatalogTemplates(
      catalogTemplates,
      cargoState,
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
    expect(ragTemplate?.languages).toContain("TypeScript");
    expect(ragTemplate?.legacyTags).not.toContain("nodejs");
  });

  test("preserves exact legacy author filters", () => {
    const state = parseCatalogState(
      "?authors=Microsoft",
      catalogTemplates,
    );
    const matches = getMatchingCatalogTemplates(
      catalogTemplates,
      state,
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
      "?authors=Azure%20Cosmos%20DB%20Content%20Team",
      catalogTemplates,
    );
    const matches = getMatchingCatalogTemplates(
      catalogTemplates,
      state,
    );

    expect(state.authors).toEqual(["Azure Cosmos DB Content Team"]);
    expect(matches.map((template) => template.source)).toContain(
      "https://github.com/AzureCosmosDB/cosmosdb-nosql-copilot",
    );
    expect(
      matches.every((template) =>
        template.legacyAuthors.includes("Azure Cosmos DB Content Team"),
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

  test("sorts featured templates first, then by catalog order", () => {
    const sourceOrder = new Map(
      catalogTemplates.map((template, index) => [
        template.normalizedSource,
        index,
      ]),
    );
    const sorted = sortCatalogTemplates(
      catalogTemplates,
      clearCatalogState(),
      sourceOrder,
    );
    const featuredCount = catalogTemplates.filter(
      (template) => template.featured,
    ).length;

    expect(featuredCount).toBeGreaterThan(0);
    expect(
      sorted.slice(0, featuredCount).every((template) => template.featured),
    ).toBe(true);
    expect(
      sorted.slice(featuredCount).every((template) => !template.featured),
    ).toBe(true);
    expect(
      sorted.slice(0, featuredCount).map((template) => template.id),
    ).toEqual(
      catalogTemplates
        .filter((template) => template.featured)
        .map((template) => template.id),
    );
    expect(
      sorted.slice(featuredCount).map((template) => template.id),
    ).toEqual(
      catalogTemplates
        .filter((template) => !template.featured)
        .map((template) => template.id),
    );
  });
});


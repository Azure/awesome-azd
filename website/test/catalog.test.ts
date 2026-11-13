/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { describe, expect, test } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";
import templates from "../static/templates.json";
import {
  canonicalizeCatalogTagIds,
  catalogTagAliases,
  catalogTags,
  removedCatalogTags,
} from "../src/catalog/catalogTags";
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
import {
  dataFileName,
  resolveDetailAsset,
} from "../route_generator_plugin/catalogRouteGenerator";

const websiteRoot = path.resolve(__dirname, "..");

describe("unified catalog data", () => {
  test("includes standard and AI templates without duplicate sources", () => {
    const expectedCount = templates.filter(
      (template) =>
        template.templateType == null ||
        template.templateType === "",
    ).length;

    expect(catalogTemplates).toHaveLength(expectedCount);
    expect(catalogTemplates.filter((template) => template.isAi)).toHaveLength(
      templates.filter(
        (template) => template.tags?.includes("aiapplication"),
      ).length,
    );
    expect(catalogTemplates.filter((template) => template.isAi)).toHaveLength(
      56,
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

  test("includes the approved upstream AI additions and preserves authorship decisions", () => {
    const sources = catalogTemplates.map((template) => template.source);
    expect(sources).toContain(
      "https://github.com/Azure-Samples/Azure-Language-OpenAI-Conversational-Agent-Accelerator",
    );
    expect(sources).toContain(
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

  test("keeps new tags on newly added catalog entries", () => {
    expect(
      catalogTemplates
        .filter((template) => template.legacyTags.includes("new"))
        .map((template) => template.source)
        .sort(),
    ).toEqual(
      [
        "https://github.com/Azure-Samples/Azure-Language-OpenAI-Conversational-Agent-Accelerator",
        "https://github.com/Azure-Samples/Copilot-Studio-with-Azure-AI-Search",
        "https://github.com/JayChase/langchain-ag-ui-angular",
        "https://github.com/massimobonanni/DBSemanticSearch",
      ].sort(),
    );
  });

  test("preserves verified hosting services and infrastructure metadata", () => {
    const rawTemplates = templates as Array<{
      source?: string;
      azureServices?: string[];
      IaC?: string[];
    }>;
    const bySource = new Map(
      rawTemplates.map((template) => [template.source, template]),
    );

    for (const [source, service] of [
      [
        "https://github.com/Azure-Samples/get-started-with-ai-agents",
        "aca",
      ],
      [
        "https://github.com/Azure-Samples/cargotracker-liberty-aks-azd",
        "aks",
      ],
      [
        "https://github.com/Azure-Samples/azure-search-openai-demo-purviewdatasecurity",
        "aca",
      ],
      [
        "https://github.com/Azure-Samples/get-started-with-ai-chat",
        "aca",
      ],
    ]) {
      expect(bySource.get(source)?.azureServices).toContain(service);
    }

    expect(
      bySource.get(
        "https://github.com/Azure-Samples/Azure-Language-OpenAI-Conversational-Agent-Accelerator",
      )?.IaC,
    ).toEqual(["bicep"]);
    expect(
      bySource.get(
        "https://github.com/Azure-Samples/Copilot-Studio-with-Azure-AI-Search",
      )?.IaC,
    ).toEqual(["terraform"]);
  });

  test("derives card previews from non-AI architecture diagrams", () => {
    const rawTemplate = templates.find(
      (template) =>
        !template.tags?.includes("aiapplication") &&
        typeof template.architectureDiagram === "string" &&
        template.architectureDiagram.length > 0,
    );
    if (!rawTemplate) {
      throw new Error(
        "Expected a non-AI template with an architecture diagram.",
      );
    }

    expect(rawTemplate.preview).toBeUndefined();
    expect(
      catalogTemplates.find(
        (template) => template.source === rawTemplate.source,
      )?.preview,
    ).toBe(rawTemplate.architectureDiagram);
  });

  test("prefers classified screenshots for card previews", () => {
    const rawTemplate = templates.find(
      (template) =>
        template.preview === undefined &&
        typeof template.screenshot === "string" &&
        template.screenshot.length > 0,
    );
    if (!rawTemplate) {
      throw new Error("Expected a template with a classified screenshot.");
    }

    expect(
      catalogTemplates.find(
        (template) => template.source === rawTemplate.source,
      )?.preview,
    ).toBe(rawTemplate.screenshot);
  });

  test("stores non-AI detail media as architecture metadata", () => {
    const nonAiTemplates = templates.filter(
      (template) => !template.tags?.includes("aiapplication"),
    );

    expect(
      nonAiTemplates.filter((template) => template.preview !== undefined),
    ).toEqual([]);
    expect(
      templates.filter(
        (template) =>
          template.preview === "./templates/images/test.png" ||
          template.architectureDiagram === "./templates/images/test.png",
      ),
    ).toEqual([]);
  });

  test("omits unavailable local detail assets", () => {
    expect(
      resolveDetailAsset(
        websiteRoot,
        "./templates/images/does-not-exist.png",
      ),
    ).toBeUndefined();
    expect(
      resolveDetailAsset(
        websiteRoot,
        "./img/Azure-App-Service.svg",
      ),
    ).toBe("./img/Azure-App-Service.svg");
    expect(
      resolveDetailAsset(
        websiteRoot,
        "https://example.com/preview.png",
      ),
    ).toBe("https://example.com/preview.png");
    expect(
      resolveDetailAsset(websiteRoot, "../package.json"),
    ).toBeUndefined();
  });

  test("creates stable repository detail routes for every template", () => {
    const detailPaths = catalogTemplates.map(
      (template) => template.detailPath,
    );

    expect(new Set(detailPaths).size).toBe(catalogTemplates.length);
    expect(
      catalogTemplates.find(
        (template) =>
          template.source ===
          "https://github.com/Azure-Samples/azure-search-openai-demo",
      ),
    ).toMatchObject({
      repository: "azure-samples/azure-search-openai-demo",
      detailPath:
        "/templates/azure-samples/azure-search-openai-demo",
    });
  });

  test("creates collision-safe route data filenames", () => {
    const first = dataFileName("template", "example/one-two");
    const second = dataFileName("template", "example-one/two");

    expect(first).toBe("template-example%2Fone-two.json");
    expect(second).toBe("template-example-one%2Ftwo.json");
    expect(first).not.toBe(second);
  });

  test("merges product descriptions and portal icons for resources", () => {
    const resources = catalogTemplates.flatMap(
      (template) => template.resources,
    );

    expect(resources.length).toBeGreaterThan(0);
    expect(
      resources.every(
        (resource) =>
          resource.icon &&
          resource.url &&
          /^https:\/\//.test(resource.url) &&
          resource.description &&
          !/^Template (?:architecture|for)\b/.test(
            resource.description,
          ) &&
          !resource.description.startsWith("Learn more about "),
      ),
    ).toBe(true);
    for (const icon of new Set(
      resources.flatMap((resource) =>
        [resource.icon, resource.darkModeIcon].filter(
          (value): value is string => value != null,
        ),
      ),
    )) {
      const assetPath = icon.replace(/^\.?\//, "");
      if (!fs.existsSync(path.join(websiteRoot, "static", assetPath))) {
        throw new Error(`Missing resource icon ${icon}`);
      }
    }
    expect(
      catalogTemplates
        .find(
          (template) =>
            template.source ===
            "https://github.com/Azure-Samples/azure-search-openai-demo",
        )
        ?.resources.find((resource) => resource.id === "appservice"),
    ).toMatchObject({
      label: "Azure App Service",
      description:
        "Quickly create powerful cloud apps for web and mobile.",
      icon: "./img/Azure-App-Service.svg",
    });
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
            template.templateType === "") &&
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

  test("exposes one categorized canonical tag taxonomy", () => {
    expect(
      Object.values(catalogTags).every(
        (tag) => tag.type.trim().length > 0,
      ),
    ).toBe(true);
    expect(
      Object.values(catalogTags).filter(
        (tag) => tag.type === "Collection",
      ),
    ).toEqual([]);
    expect(
      Object.values(catalogTags).filter(
        (tag) => tag.type === "Platform",
      ),
    ).toEqual([]);

    const idsByCategoryAndLabel = new Map<string, string[]>();
    for (const tag of Object.values(catalogTags)) {
      const key = `${tag.type}:${tag.label.toLowerCase()}`;
      const ids = idsByCategoryAndLabel.get(key) ?? [];
      ids.push(tag.id);
      idsByCategoryAndLabel.set(key, ids);
    }
    expect(
      [...idsByCategoryAndLabel.values()].filter(
        (ids) => ids.length > 1,
      ),
    ).toEqual([]);
  });

  test("collapses aliases and replaces collection tags with services", () => {
    expect(
      canonicalizeCatalogTagIds([
        "aicollection",
        "azureaiservice",
        "azurecosmosdb",
        "azuredb-mysql",
        "azureopenai",
        "golang",
      ]),
    ).toEqual([
      "aiapplication",
      "azureai",
      "cosmosdb",
      "azuredb-mySQL",
      "openai",
      "go",
    ]);

    for (const alias of catalogTagAliases.keys()) {
      expect(catalogTags).not.toHaveProperty(alias);
    }
    for (const removedTag of removedCatalogTags) {
      expect(catalogTags).not.toHaveProperty(removedTag);
      expect(
        catalogTemplates.some((template) =>
          template.legacyTags.includes(removedTag),
        ),
      ).toBe(false);
    }

    const aiApplications = (templates as Array<{
      source?: string;
      tags?: unknown;
      templateType?: unknown;
    }>).filter(
      (template) =>
        Array.isArray(template.tags) &&
        template.tags.includes("aiapplication"),
    );
    expect(aiApplications).toHaveLength(56);
    for (const rawTemplate of aiApplications) {
      expect(rawTemplate.templateType).toBeUndefined();
      expect(rawTemplate.tags).not.toContain("aicollection");
      expect(rawTemplate.tags).not.toContain("azureopenai");
    }
    expect(
      catalogTemplates.find(
        (template) =>
          template.source ===
          "https://github.com/Azure-Samples/azure-search-openai-demo",
      )?.serviceIds,
    ).toContain("openai");
  });

  test("uses the reviewed categories for ambiguous tags", () => {
    expect(catalogTags.powershell.type).toBe("Language");
    expect(catalogTags.aisearch.type).toBe("Service");
    expect(catalogTags.rag.type).toBe("Framework");
    expect(catalogTags.dapr.type).toBe("Tools");
    expect(catalogTags.aspire.type).toBe("Framework");
    expect(catalogTags.kubernetes.type).toBe("Framework");
    expect(catalogTags.prometheus.type).toBe("Tools");
    expect(catalogTags.sap.type).toBe("Tools");
    expect(catalogTags.sapcap.type).toBe("Tools");
    expect(catalogTags.thymeleaf.type).toBe("Tools");
    expect(catalogTags["dall-e"].type).toBe("Tools");
    expect(catalogTags.serverlessapi.type).toBe("Service");
    expect(catalogTags.webapps.type).toBe("Service");
    expect(catalogTags.aiapplication).toMatchObject({
      label: "AI application",
      type: "Application Type",
    });
  });

  test("stores categorized values only in their target template fields", () => {
    const targetFields = new Map([
      ["aspire", "frameworks"],
      ["dall-e", "tags"],
      ["dapr", "tags"],
      ["gpt", "models"],
      ["kubernetes", "frameworks"],
      ["openai", "azureServices"],
      ["powershell", "languages"],
      ["sapcap", "tags"],
      ["serverlessapi", "tags"],
      ["thymeleaf", "tags"],
    ]);
    const rawTemplates = templates as Array<Record<string, unknown>>;

    for (const template of rawTemplates) {
      if (
        typeof template.templateType === "string" &&
        template.templateType.startsWith("extension.")
      ) {
        continue;
      }
      for (const [tag, targetField] of targetFields) {
        for (const field of [
          "tags",
          "languages",
          "frameworks",
          "azureServices",
          "models",
        ]) {
          if (field === targetField) {
            continue;
          }
          expect(
            Array.isArray(template[field])
              ? template[field].includes(tag)
              : false,
          ).toBe(false);
        }
      }
    }
  });

  test("uses current Azure product descriptions for reviewed services", () => {
    expect(catalogTags.azurespringapps.productDescription).toBe(
      "Build and deploy Spring Boot applications with a fully managed service from Microsoft and VMware.",
    );
    expect(catalogTags.loadtesting.productDescription).toBe(
      "Optimize app performance with high-scale load testing.",
    );
    expect(catalogTags.privatelink.productDescription).toBe(
      "Private access to services hosted on the Azure platform, keeping your data on the Microsoft network.",
    );
    expect(catalogTags.vmsqlserver.productDescription).toBe(
      "Migrate SQL Server workloads to the cloud at lower total cost of ownership (TCO).",
    );
    expect(catalogTags.azureai).toMatchObject({
      label: "Azure AI Service",
      url: "https://azure.microsoft.com/solutions/ai/",
    });
    expect(catalogTags.azuresignalr.url).toBe(
      "https://azure.microsoft.com/products/signalr-service/",
    );
    expect(catalogTags.aifoundry.url).toBe(
      "https://azure.microsoft.com/products/ai-foundry",
    );
  });

  test("shows every merged Azure service on template details", () => {
    const rawTemplate = (templates as Array<{
      source?: string;
      azureServices?: unknown;
    }>).find(
      (template) =>
        template.source ===
        "https://github.com/Azure-Samples/azure-search-openai-demo",
    );
    const template = catalogTemplates.find(
      (candidate) => candidate.source === rawTemplate?.source,
    );
    const expectedServiceIds = canonicalizeCatalogTagIds(
      Array.isArray(rawTemplate?.azureServices)
        ? rawTemplate.azureServices.filter(
            (value): value is string => typeof value === "string",
          )
        : [],
    );

    expect(template?.serviceIds).toEqual(expectedServiceIds);
    expect(template?.resources.map((resource) => resource.id)).toEqual(
      expectedServiceIds,
    );
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

  test("uses the aiapplication tag as the canonical AI type filter", () => {
    const state = parseCatalogState(
      "?tags=aiapplication",
      catalogTemplates,
    );
    const matches = getMatchingCatalogTemplates(
      catalogTemplates,
      state,
    );

    expect(state.types).toEqual(["ai"]);
    expect(state.legacyTags).toEqual([]);
    expect(state.unavailable).toEqual([]);
    expect(matches).toHaveLength(56);
    expect(matches.every((template) => template.isAi)).toBe(true);
    expect(serializeCatalogState(state)).toBe("type=ai");
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
      "azureopenai",
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

  test("preserves legacy Azure service names in local search", () => {
    const expectedSources = catalogTemplates
      .filter((template) => template.serviceIds.includes("azureai"))
      .map((template) => template.normalizedSource);
    const state = parseCatalogState(
      `?${new URLSearchParams({ q: "Azure AI Services" })}`,
      catalogTemplates,
    );
    const matchingSources = getMatchingCatalogTemplates(
      catalogTemplates,
      state,
    ).map((template) => template.normalizedSource);

    expect(expectedSources.length).toBeGreaterThan(0);
    expect(matchingSources).toEqual(
      expect.arrayContaining(expectedSources),
    );
  });

  test("migrates renamed and reclassified saved filters", () => {
    const serviceState = parseCatalogState(
      "?service=azureaiservice",
      catalogTemplates,
    );
    expect(serviceState.services).toEqual(["azureai"]);
    expect(serviceState.unavailable).toEqual([]);
    expect(serializeCatalogState(serviceState)).toBe("service=azureai");

    for (const { query, stateKey, stateValue, rawTag } of [
      {
        query: "?database=Prometheus",
        stateKey: "databases" as const,
        stateValue: "Prometheus",
        rawTag: "prometheus",
      },
      {
        query: "?tags=meta",
        stateKey: "legacyTags" as const,
        stateValue: "llama",
        rawTag: "llama",
      },
    ]) {
      const rawSources = new Set(
        (
          templates as Array<{
            source?: string;
            tags?: unknown;
          }>
        )
          .filter(
            (template) =>
              (Array.isArray(template.tags) &&
                template.tags.includes(rawTag)) ||
              (Array.isArray(
                (template as Record<string, unknown>).models,
              ) &&
                (
                  (template as Record<string, unknown>)
                    .models as unknown[]
                ).includes(rawTag)),
          )
          .map((template) => template.source)
          .filter(
            (source): source is string => typeof source === "string",
          ),
      );
      const expectedSources = catalogTemplates
        .filter((template) => rawSources.has(template.source))
        .map((template) => template.normalizedSource)
        .sort();
      const state = parseCatalogState(query, catalogTemplates);
      const matchingSources = getMatchingCatalogTemplates(
        catalogTemplates,
        state,
      )
        .map((template) => template.normalizedSource)
        .sort();

      expect(state[stateKey]).toEqual([stateValue]);
      expect(state.unavailable).toEqual([]);
      expect(matchingSources).toEqual(expectedSources);
      expect(expectedSources.length).toBeGreaterThan(0);
    }
  });

  test("preserves OR semantics for migrated multi-select filters", () => {
    const prometheusState = parseCatalogState(
      "?database=Prometheus",
      catalogTemplates,
    );
    const mongoState = parseCatalogState(
      "?database=MongoDB",
      catalogTemplates,
    );
    const combinedState = parseCatalogState(
      "?database=Prometheus,MongoDB",
      catalogTemplates,
    );
    const expectedSources = [
      ...new Set(
        [
          ...getMatchingCatalogTemplates(
            catalogTemplates,
            prometheusState,
          ),
          ...getMatchingCatalogTemplates(catalogTemplates, mongoState),
        ].map((template) => template.normalizedSource),
      ),
    ].sort();
    const matchingSources = getMatchingCatalogTemplates(
      catalogTemplates,
      combinedState,
    )
      .map((template) => template.normalizedSource)
      .sort();

    expect(combinedState.databases).toEqual([
      "Prometheus",
      "MongoDB",
    ]);
    expect(combinedState.unavailable).toEqual([]);
    expect(matchingSources).toEqual(expectedSources);
    expect(serializeCatalogState(combinedState)).toBe(
      "database=Prometheus%2CMongoDB",
    );
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
      "?service=openai&q=cargo%20tracker",
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
    expect(purviewTemplate?.serviceIds).not.toContain("purview");
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

  test("translates legacy tag aliases to canonical service tags", () => {
    const state = parseCatalogState(
      "?tags=azureopenai",
      catalogTemplates,
    );
    const matches = getMatchingCatalogTemplates(
      catalogTemplates,
      state,
    );

    expect(state.legacyTags).toEqual(["openai"]);
    expect(state.unavailable).toEqual([]);
    expect(matches.length).toBeGreaterThan(0);
    expect(
      matches.every((template) =>
        template.serviceIds.includes("openai"),
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

  test("sorts stars descending, keeps ties stable, and puts missing values last", () => {
    const records = catalogTemplates.slice(0, 4).map((template, index) => ({
      ...template,
      normalizedSource: `https://github.com/example/template-${index}`,
      featured: index === 1,
      stars: [25, undefined, 0, 25][index],
    }));
    const sourceOrder = new Map(
      records.map((template, index) => [
        template.normalizedSource,
        index,
      ]),
    );
    const sorted = sortCatalogTemplates(
      records,
      clearCatalogState(),
      sourceOrder,
    );

    expect(sorted.map((template) => template.stars)).toEqual([
      25,
      25,
      0,
      undefined,
    ]);
    expect(sorted.slice(0, 2).map((template) => template.id)).toEqual([
      records[0].id,
      records[3].id,
    ]);
  });
});


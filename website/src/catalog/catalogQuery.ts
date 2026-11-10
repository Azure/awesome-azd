/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
  catalogTasks,
  type CatalogTemplate,
} from "./catalogData";
import type { RepositoryMetrics } from "../ai/utils/repositoryMetadata";

export type CatalogFacetKey =
  | "types"
  | "tasks"
  | "languages"
  | "frameworks"
  | "databases"
  | "services"
  | "iac"
  | "authorship"
  | "legacyTags"
  | "authors";

export type CatalogSort =
  | "popular"
  | "newest"
  | "oldest"
  | "az"
  | "za";

export type CatalogState = {
  q: string;
  sort: CatalogSort;
  page: number;
  types: string[];
  tasks: string[];
  languages: string[];
  frameworks: string[];
  databases: string[];
  services: string[];
  iac: string[];
  authorship: string[];
  legacyTags: string[];
  authors: string[];
  unavailable: string[];
};

export type CatalogFacet = {
  key: CatalogFacetKey;
  param: string;
  label: string;
  values?: readonly string[];
  labels?: Record<string, string>;
  legacyParams?: readonly string[];
  hidden?: boolean;
  open?: boolean;
};

export const catalogFacets: readonly CatalogFacet[] = [
  {
    key: "types",
    param: "type",
    label: "Template type",
    values: ["ai"],
    labels: { ai: "AI application" },
    open: true,
  },
  {
    key: "tasks",
    param: "task",
    label: "Use case",
    values: catalogTasks,
    labels: {
      "Build a web app": "Web apps",
      "Build an API": "APIs",
      "Build an AI agent": "AI agents",
      "Build an MCP server": "MCP servers",
      "Chat with documents": "Document Q&A",
      "Query a database": "Data queries with AI",
      "Automate a workflow": "Workflow automation",
      "Start with infrastructure": "Infrastructure",
    },
    open: true,
  },
  { key: "languages", param: "language", label: "Language" },
  { key: "frameworks", param: "framework", label: "Framework" },
  {
    key: "databases",
    param: "database",
    label: "Database / retrieval",
  },
  {
    key: "services",
    param: "service",
    label: "Azure service",
    labels: {
      aca: "Azure Container Apps",
      functions: "Azure Functions",
      swa: "Azure Static Web Apps",
    },
    hidden: true,
  },
  { key: "iac", param: "iac", label: "Infrastructure as code" },
  { key: "authorship", param: "authorship", label: "Authored by" },
  {
    key: "legacyTags",
    param: "tags",
    label: "Tag",
    hidden: true,
  },
  {
    key: "authors",
    param: "authors",
    label: "Author",
    hidden: true,
  },
] as const;

function getValues(
  template: CatalogTemplate,
  key: CatalogFacetKey,
): string[] {
  switch (key) {
    case "types":
      return template.collections;
    case "tasks":
      return [template.task];
    case "languages":
      return template.languages;
    case "frameworks":
      return template.frameworks;
    case "databases":
      return template.databases;
    case "services":
      return template.serviceIds;
    case "iac":
      return template.iac;
    case "authorship":
      return [template.authorship];
    case "legacyTags":
      return template.legacyTags;
    case "authors":
      return template.authors;
  }
}

export function getFacetLabel(facet: CatalogFacet, value: string): string {
  return facet.labels?.[value] ?? value;
}

export function getFacetOptions(
  records: readonly CatalogTemplate[],
  facet: CatalogFacet,
): string[] {
  return facet.values
    ? [...facet.values]
    : [
        ...new Set(
          records.flatMap((template) => getValues(template, facet.key)),
        ),
      ].sort((left, right) => left.localeCompare(right));
}

export function parseCatalogState(
  search: string,
  records: readonly CatalogTemplate[],
): CatalogState {
  const query = new URLSearchParams(search);
  const requestedSort = query.get("sort");
  const requestedPage = query.get("page");
  const sort =
    requestedSort === "newest" ||
    requestedSort === "oldest" ||
    requestedSort === "az" ||
    requestedSort === "za"
      ? requestedSort
      : "popular";
  const page =
    requestedPage !== null && /^[1-9]\d*$/.test(requestedPage)
      ? Number.parseInt(requestedPage, 10)
      : 1;
  const state: CatalogState = {
    q: query.get("q") ?? query.get("name") ?? "",
    sort,
    page,
    types: [],
    tasks: [],
    languages: [],
    frameworks: [],
    databases: [],
    services: [],
    iac: [],
    authorship: [],
    legacyTags: [],
    authors: [],
    unavailable: [],
  };

  for (const facet of catalogFacets) {
    const allowed = getFacetOptions(records, facet);
    const requested = [facet.param, ...(facet.legacyParams ?? [])]
      .flatMap((param) => query.getAll(param))
      .flatMap((value) => value.split(","))
      .filter(Boolean);
    state[facet.key] = [
      ...new Set(requested.filter((value) => allowed.includes(value))),
    ];
    state.unavailable.push(
      ...requested
        .filter((value) => !allowed.includes(value))
        .map((value) => `${facet.label}: ${value}`),
    );
  }

  return state;
}

export function serializeCatalogState(state: CatalogState): string {
  const query = new URLSearchParams();
  if (state.q.trim()) {
    query.set("q", state.q.trim());
  }
  for (const facet of catalogFacets) {
    if (state[facet.key].length > 0) {
      query.set(facet.param, state[facet.key].join(","));
    }
  }
  if (state.sort !== "popular") {
    query.set("sort", state.sort);
  }
  if (state.page > 1) {
    query.set("page", String(state.page));
  }
  return query.toString();
}

export function clearCatalogState(): CatalogState {
  return {
    q: "",
    sort: "popular",
    page: 1,
    types: [],
    tasks: [],
    languages: [],
    frameworks: [],
    databases: [],
    services: [],
    iac: [],
    authorship: [],
    legacyTags: [],
    authors: [],
    unavailable: [],
  };
}

export function matchesCatalogTemplate(
  template: CatalogTemplate,
  state: CatalogState,
  backendMatches: ReadonlySet<string> | null,
  ignoredFacet?: CatalogFacetKey,
): boolean {
  const tokens = state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const localMatch = tokens.every((token) =>
    template.searchText.includes(token),
  );
  const queryMatch =
    tokens.length === 0 ||
    localMatch ||
    backendMatches?.has(template.normalizedSource) === true;

  return (
    queryMatch &&
    catalogFacets.every((facet) => {
      if (facet.key === ignoredFacet || state[facet.key].length === 0) {
        return true;
      }
      const values = getValues(template, facet.key);
      if (facet.key === "legacyTags") {
        return state.legacyTags.every((value) => values.includes(value));
      }
      return values.some((value) => state[facet.key].includes(value));
    })
  );
}

export function getMatchingCatalogTemplates(
  records: readonly CatalogTemplate[],
  state: CatalogState,
  backendMatches: ReadonlySet<string> | null,
): CatalogTemplate[] {
  return records.filter((template) =>
    matchesCatalogTemplate(template, state, backendMatches),
  );
}

export function sortCatalogTemplates(
  records: readonly CatalogTemplate[],
  state: CatalogState,
  metrics: ReadonlyMap<string, RepositoryMetrics>,
  sourceOrder: ReadonlyMap<string, number>,
): CatalogTemplate[] {
  const result = [...records];
  if (state.sort === "newest" || state.sort === "oldest") {
    const direction = state.sort === "newest" ? -1 : 1;
    return result.sort(
      (left, right) =>
        direction *
        ((sourceOrder.get(left.normalizedSource) ??
          Number.MAX_SAFE_INTEGER) -
          (sourceOrder.get(right.normalizedSource) ??
            Number.MAX_SAFE_INTEGER)),
    );
  }

  if (state.sort === "az" || state.sort === "za") {
    const direction = state.sort === "za" ? -1 : 1;
    return result.sort(
      (left, right) => direction * left.title.localeCompare(right.title),
    );
  }

  const bySourceOrder = result.sort(
    (left, right) =>
      (sourceOrder.get(left.normalizedSource) ?? Number.MAX_SAFE_INTEGER) -
      (sourceOrder.get(right.normalizedSource) ?? Number.MAX_SAFE_INTEGER),
  );
  const rankedTemplates = bySourceOrder
    .filter((template) => metrics.has(template.normalizedSource))
    .sort((left, right) => {
      const leftMetrics = metrics.get(left.normalizedSource);
      const rightMetrics = metrics.get(right.normalizedSource);
      const leftPopularity = leftMetrics?.score ?? leftMetrics?.stars ?? 0;
      const rightPopularity =
        rightMetrics?.score ?? rightMetrics?.stars ?? 0;
      return (
        rightPopularity - leftPopularity ||
        (sourceOrder.get(left.normalizedSource) ??
          Number.MAX_SAFE_INTEGER) -
          (sourceOrder.get(right.normalizedSource) ??
            Number.MAX_SAFE_INTEGER)
      );
    });
  let rankedIndex = 0;

  return bySourceOrder.map((template) =>
    metrics.has(template.normalizedSource)
      ? rankedTemplates[rankedIndex++]
      : template,
  );
}

export function getFacetValueCount(
  records: readonly CatalogTemplate[],
  state: CatalogState,
  backendMatches: ReadonlySet<string> | null,
  facet: CatalogFacet,
  value: string,
): number {
  return records.filter(
    (template) =>
      matchesCatalogTemplate(
        template,
        state,
        backendMatches,
        facet.key,
      ) && getValues(template, facet.key).includes(value),
  ).length;
}


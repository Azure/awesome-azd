/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
  catalogTasks,
  type CatalogTemplate,
} from "./catalogData";
import {
  canonicalizeCatalogTagId,
  getCatalogTagCompatibilityIds,
} from "./catalogTags";

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
  | "recommended"
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
  {
    key: "authorship",
    param: "authorship",
    label: "Authored by",
    values: ["Microsoft", "Community"],
  },
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

const aiApplicationTagIds = new Set([
  "aicollection",
  "aiapplication",
]);

function getValues(
  template: CatalogTemplate,
  key: CatalogFacetKey,
): string[] {
  switch (key) {
    case "types":
      return template.collections;
    case "tasks":
      return template.tasks;
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
      return template.compatibilityTags;
    case "authors":
      return [...template.authors, ...template.legacyAuthors];
  }
}

function supportsLegacyTagCompatibility(
  key: CatalogFacetKey,
): boolean {
  return (
    key === "languages" ||
    key === "frameworks" ||
    key === "databases" ||
    key === "services" ||
    key === "iac"
  );
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
    requestedSort === "recommended" ||
    requestedSort === "newest" ||
    requestedSort === "oldest" ||
    requestedSort === "az" ||
    requestedSort === "za"
      ? requestedSort
      : "recommended";
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
  const legacyTagFacet = catalogFacets.find(
    (facet) => facet.key === "legacyTags",
  );
  if (!legacyTagFacet) {
    throw new Error("Expected the legacy tag facet.");
  }
  const allowedLegacyTags = getFacetOptions(records, legacyTagFacet);

  for (const facet of catalogFacets) {
    const allowed = getFacetOptions(records, facet);
    let requested = [facet.param, ...(facet.legacyParams ?? [])]
      .flatMap((param) => query.getAll(param))
      .flatMap((value) => value.split(","))
      .filter(Boolean);
    if (
      facet.key === "legacyTags" &&
      requested.some((value) =>
        aiApplicationTagIds.has(value.toLowerCase()),
      )
    ) {
      state.types = [...new Set([...state.types, "ai"])];
      requested = requested.filter(
        (value) => !aiApplicationTagIds.has(value.toLowerCase()),
      );
    }
    if (facet.key === "services") {
      requested = requested.map(
        (value) => canonicalizeCatalogTagId(value) ?? value,
      );
    }
    if (facet.key === "legacyTags") {
      requested = requested.map(
        (value) => canonicalizeCatalogTagId(value) ?? value,
      );
    }
    const accepted: string[] = [];
    for (const value of requested) {
      if (allowed.includes(value)) {
        accepted.push(value);
        continue;
      }

      const compatibilityIds = supportsLegacyTagCompatibility(
        facet.key,
      )
        ? getCatalogTagCompatibilityIds(value).filter((id) =>
            allowedLegacyTags.includes(id),
          )
        : [];
      if (compatibilityIds.length === 1) {
        accepted.push(value);
        continue;
      }

      state.unavailable.push(`${facet.label}: ${value}`);
    }
    state[facet.key] = [...new Set(accepted)];
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
  if (state.sort !== "recommended") {
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
    sort: "recommended",
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
  ignoredFacet?: CatalogFacetKey,
): boolean {
  const tokens = state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const queryMatch =
    tokens.length === 0 ||
    tokens.every((token) => template.searchText.includes(token));

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
      return state[facet.key].some((value) => {
        if (values.includes(value)) {
          return true;
        }
        if (!supportsLegacyTagCompatibility(facet.key)) {
          return false;
        }

        const compatibilityIds = getCatalogTagCompatibilityIds(value);
        return (
          compatibilityIds.length === 1 &&
          template.compatibilityTags.includes(compatibilityIds[0])
        );
      });
    })
  );
}

export function getMatchingCatalogTemplates(
  records: readonly CatalogTemplate[],
  state: CatalogState,
): CatalogTemplate[] {
  return records.filter((template) =>
    matchesCatalogTemplate(template, state),
  );
}

export function sortCatalogTemplates(
  records: readonly CatalogTemplate[],
  state: CatalogState,
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

  return result.sort(
    (left, right) => {
      const leftHasStars = left.stars !== undefined;
      const rightHasStars = right.stars !== undefined;
      if (leftHasStars !== rightHasStars) {
        return leftHasStars ? -1 : 1;
      }
      if (
        left.stars !== undefined &&
        right.stars !== undefined &&
        left.stars !== right.stars
      ) {
        return right.stars - left.stars;
      }
      return (
        (sourceOrder.get(left.normalizedSource) ??
          Number.MAX_SAFE_INTEGER) -
        (sourceOrder.get(right.normalizedSource) ??
          Number.MAX_SAFE_INTEGER)
      );
    },
  );
}

export function getFacetValueCounts(
  records: readonly CatalogTemplate[],
  state: CatalogState,
  facet: CatalogFacet,
): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();

  for (const template of records) {
    if (!matchesCatalogTemplate(template, state, facet.key)) {
      continue;
    }

    for (const value of new Set(getValues(template, facet.key))) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return counts;
}


/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { normalizeTemplateSource } from "./templateSources";

const searchEndpoint =
  "https://lp6qsotirqelc-function-app.azurewebsites.net/api/ai-apps-search";

type SearchResult = {
  document?: {
    source?: unknown;
  };
};

export function extractTemplateSearchSources(
  data: unknown,
  allowedSources: readonly string[],
): string[] {
  if (!Array.isArray(data)) {
    throw new Error("Unexpected API response format");
  }

  const allowedSourceSet = new Set(
    allowedSources
      .map(normalizeTemplateSource)
      .filter((source): source is string => source !== null),
  );
  const seen = new Set<string>();
  const matches: string[] = [];

  for (const result of data as SearchResult[]) {
    const source = result.document?.source;
    if (typeof source !== "string") {
      continue;
    }

    const normalizedSource = normalizeTemplateSource(source);
    if (
      normalizedSource === null ||
      !allowedSourceSet.has(normalizedSource) ||
      seen.has(normalizedSource)
    ) {
      continue;
    }

    seen.add(normalizedSource);
    matches.push(normalizedSource);
  }

  return matches;
}

export async function fetchTemplateSearchResults(
  searchTerm: string,
  signal: AbortSignal,
  allowedSources: readonly string[],
): Promise<string[]> {
  const response = await fetch(
    `${searchEndpoint}?search=${encodeURIComponent(searchTerm)}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Search API returned status ${response.status}`);
  }

  const data: unknown = await response.json();
  return extractTemplateSearchSources(data, allowedSources);
}

export async function warmTemplateSearch(): Promise<void> {
  const response = await fetch(`${searchEndpoint}?search=initialRequest`);
  if (!response.ok) {
    throw new Error(`Search API warm-up returned status ${response.status}`);
  }
}

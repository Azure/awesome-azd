/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { normalizeTemplateSource } from "./templateSources";

type RepositoryMetric = {
  stars?: unknown;
};

type RepositoryMetricsAggregate = {
  repositories?: Record<string, RepositoryMetric>;
};

export function getRepositorySlug(source: string): string | undefined {
  const normalizedSource = normalizeTemplateSource(source);
  if (normalizedSource === null) {
    return undefined;
  }

  return new URL(normalizedSource).pathname.slice(1);
}

export function getRepositoryStars(
  aggregate: RepositoryMetricsAggregate,
  source: string,
): number | undefined {
  const slug = getRepositorySlug(source);
  if (slug === undefined) {
    return undefined;
  }

  const stars = aggregate.repositories?.[slug]?.stars;
  return Number.isSafeInteger(stars) && Number(stars) >= 0
    ? Number(stars)
    : undefined;
}

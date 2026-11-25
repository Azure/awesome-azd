/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { normalizeTemplateSource } from "./templateSources";
import repositoryMetricsConfig from "./repository-metrics.config.json";

export const repositoryMetricsUrl = repositoryMetricsConfig.url;

const repositoryMetricsSchemaVersion = 2;
const requestTimeoutMs = 3_000;
const maxResponseBytes = 1024 * 1024;

export type RepositoryMetric = {
  stars: number;
};

export type RepositoryMetricsAggregate = {
  schemaVersion: 2;
  generatedAt: string;
  repositories: Record<string, RepositoryMetric>;
};

type RepositoryMetricsLookup = {
  repositories?: Record<string, { stars?: unknown }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function assertExactKeys(
  value: unknown,
  expectedKeys: readonly string[],
  field: string,
): asserts value is Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`${field} must be an object.`);
  }

  const actualKeys = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (
    actualKeys.length !== expected.length ||
    actualKeys.some((key, index) => key !== expected[index])
  ) {
    throw new Error(
      `${field} must contain only ${expected.join(", ")}.`,
    );
  }
}

function readCanonicalIsoDate(
  value: unknown,
  field: string,
): string {
  if (typeof value !== "string") {
    throw new Error(`${field} must be a canonical ISO date.`);
  }

  const timestamp = Date.parse(value);
  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString() !== value
  ) {
    throw new Error(`${field} must be a canonical ISO date.`);
  }

  return value;
}

function readRepositoryMetricsUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Repository metrics URL must be valid.");
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "Repository metrics URL must be public credential-free HTTPS.",
    );
  }
  if (!url.pathname.endsWith(".json")) {
    throw new Error(
      "Repository metrics URL must identify a JSON file.",
    );
  }

  return url.href;
}

async function readResponseText(response: Response): Promise<string> {
  const contentLength = Number(
    response.headers.get("content-length"),
  );
  if (
    Number.isFinite(contentLength) &&
    contentLength > maxResponseBytes
  ) {
    throw new Error("Repository metrics response is too large.");
  }

  if (!response.body) {
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > maxResponseBytes) {
      throw new Error("Repository metrics response is too large.");
    }
    return text;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    byteLength += value.byteLength;
    if (byteLength > maxResponseBytes) {
      await reader.cancel();
      throw new Error("Repository metrics response is too large.");
    }
    chunks.push(value);
  }

  const combined = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(combined);
}

export function getRepositorySlug(
  source: string,
): string | undefined {
  const normalizedSource = normalizeTemplateSource(source);
  if (normalizedSource === null) {
    return undefined;
  }

  return new URL(normalizedSource).pathname.slice(1);
}

export function parseRepositoryMetricsAggregate(
  value: unknown,
): RepositoryMetricsAggregate {
  assertExactKeys(
    value,
    ["schemaVersion", "generatedAt", "repositories"],
    "Repository metrics aggregate",
  );
  if (value.schemaVersion !== repositoryMetricsSchemaVersion) {
    throw new Error("Unsupported repository metrics schema.");
  }

  const generatedAt = readCanonicalIsoDate(
    value.generatedAt,
    "Repository metrics generatedAt",
  );
  if (!isRecord(value.repositories)) {
    throw new Error(
      "Repository metrics repositories must be an object.",
    );
  }

  const repositories: Record<string, RepositoryMetric> =
    Object.create(null);
  for (const [slug, metric] of Object.entries(value.repositories)) {
    if (
      getRepositorySlug(`https://github.com/${slug}`) !== slug
    ) {
      throw new Error(
        `Repository metrics slug must be canonical: ${slug}.`,
      );
    }
    assertExactKeys(
      metric,
      ["stars"],
      `Repository metrics for ${slug}`,
    );
    if (
      !Number.isSafeInteger(metric.stars) ||
      Number(metric.stars) < 0
    ) {
      throw new Error(
        `Repository metrics stars must be a non-negative integer for ${slug}.`,
      );
    }

    repositories[slug] = { stars: Number(metric.stars) };
  }

  return {
    schemaVersion: repositoryMetricsSchemaVersion,
    generatedAt,
    repositories,
  };
}

export async function fetchRepositoryMetrics(
  fetchImpl: typeof fetch = fetch,
  sourceUrl: string = repositoryMetricsUrl,
): Promise<RepositoryMetricsAggregate> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(
    () => controller.abort(),
    requestTimeoutMs,
  );

  try {
    const response = await fetchImpl(
      readRepositoryMetricsUrl(sourceUrl),
      {
        cache: "default",
        credentials: "omit",
        headers: { Accept: "application/json" },
        redirect: "error",
        signal: controller.signal,
      },
    );
    if (!response.ok) {
      throw new Error(
        `Repository metrics request failed with HTTP ${response.status}.`,
      );
    }

    const contentType =
      response.headers.get("content-type") ?? "";
    if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
      throw new Error(
        `Repository metrics response must use application/json, received "${contentType || "unknown"}".`,
      );
    }

    const content = await readResponseText(response);
    let value: unknown;
    try {
      value = JSON.parse(content);
    } catch {
      throw new Error(
        "Repository metrics response is not valid JSON.",
      );
    }
    return parseRepositoryMetricsAggregate(value);
  } catch (error) {
    if (
      isRecord(error) &&
      error.name === "AbortError"
    ) {
      throw new Error(
        `Repository metrics request timed out after ${requestTimeoutMs}ms.`,
      );
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export function getRepositoryStarsBySlug(
  aggregate: RepositoryMetricsAggregate,
  slug: string,
): number | undefined {
  const normalizedSlug = getRepositorySlug(
    `https://github.com/${slug}`,
  );
  if (normalizedSlug === undefined) {
    return undefined;
  }

  return aggregate.repositories[normalizedSlug]?.stars;
}

export function getRepositoryStars(
  aggregate: RepositoryMetricsLookup,
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

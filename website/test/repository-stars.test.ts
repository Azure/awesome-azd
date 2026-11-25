/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, jest, test } from "@jest/globals";
import {
  fetchRepositoryMetrics,
  getRepositorySlug,
  getRepositoryStars,
  parseRepositoryMetricsAggregate,
} from "../src/catalog/repositoryMetrics";
import { applyRuntimeRepositoryMetrics } from "../src/catalog/useRuntimeRepositoryMetrics";
import { RepositoryStarCount } from "../src/components/catalog/CatalogPage/RepositoryStarCount";

const aggregate = {
  schemaVersion: 2 as const,
  generatedAt: "2026-11-19T00:00:00.000Z",
  repositories: {
    "example/one": { stars: 381 },
    "example/zero": { stars: 0 },
  },
};

describe("repository star metadata", () => {
  test("maps canonical public GitHub repositories to star counts", () => {
    expect(getRepositorySlug("https://github.com/Example/One")).toBe(
      "example/one",
    );
    expect(
      getRepositoryStars(aggregate, "https://github.com/Example/One"),
    ).toBe(381);
    expect(
      getRepositoryStars(
        aggregate,
        "https://github.com/example/zero",
      ),
    ).toBe(0);
    expect(
      getRepositoryStars(
        aggregate,
        "https://github.com/example/missing",
      ),
    ).toBeUndefined();
  });

  test("renders zero and positive counts but hides missing stars", () => {
    const render = (stars?: number) =>
      renderToStaticMarkup(
        React.createElement(RepositoryStarCount, {
          stars,
          icon: React.createElement("span", null, "star"),
        }),
      );

    expect(render()).toBe("");
    expect(render(0)).toContain('role="img"');
    expect(render(0)).toContain('aria-label="0 GitHub stars"');
    expect(render(1)).toContain('aria-label="1 GitHub star"');
    expect(render(381)).toContain('aria-label="381 GitHub stars"');
    expect(render(381)).toContain(">381<");
    expect(render(1234)).toContain(">1,234<");
  });

  test("validates and applies live star counts over bundled values", () => {
    const liveAggregate = parseRepositoryMetricsAggregate({
      schemaVersion: 2,
      generatedAt: "2026-11-19T00:00:00.000Z",
      repositories: {
        "example/one": { stars: 500 },
      },
    });
    const bundledTemplates = [
      {
        repository: "example/one",
        stars: 381,
        title: "Updated",
      },
      {
        repository: "example/missing",
        stars: 10,
        title: "Fallback",
      },
    ];

    expect(
      applyRuntimeRepositoryMetrics(bundledTemplates, undefined),
    ).toBe(bundledTemplates);
    expect(
      applyRuntimeRepositoryMetrics(
        bundledTemplates,
        liveAggregate,
      ),
    ).toEqual([
      {
        repository: "example/one",
        stars: 500,
        title: "Updated",
      },
      {
        repository: "example/missing",
        stars: 10,
        title: "Fallback",
      },
    ]);
  });

  test.each([
    [
      "non-canonical slug",
      {
        schemaVersion: 2,
        generatedAt: "2026-11-19T00:00:00.000Z",
        repositories: {
          "Example/One": { stars: 1 },
        },
      },
    ],
    [
      "negative stars",
      {
        schemaVersion: 2,
        generatedAt: "2026-11-19T00:00:00.000Z",
        repositories: {
          "example/one": { stars: -1 },
        },
      },
    ],
    [
      "unapproved fields",
      {
        schemaVersion: 2,
        generatedAt: "2026-11-19T00:00:00.000Z",
        repositories: {
          "example/one": {
            stars: 1,
            email: "author@example.com",
          },
        },
      },
    ],
  ])("rejects malformed live metrics: %s", (_description, value) => {
    expect(() =>
      parseRepositoryMetricsAggregate(value),
    ).toThrow();
  });

  test("fetches live metrics without credentials using browser caching", async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) =>
          name === "content-type"
            ? "application/json; charset=utf-8"
            : null,
      },
      body: null,
      text: async () => JSON.stringify(aggregate),
    })) as unknown as typeof fetch;

    await expect(
      fetchRepositoryMetrics(
        fetchImpl,
        "https://cache.example.net/repository-metrics.json",
      ),
    ).resolves.toEqual(aggregate);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://cache.example.net/repository-metrics.json",
      expect.objectContaining({
        cache: "default",
        credentials: "omit",
        headers: { Accept: "application/json" },
        redirect: "error",
      }),
    );
  });

  test("rejects oversized live metrics before reading the body", async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => {
          if (name === "content-type") {
            return "application/json";
          }
          if (name === "content-length") {
            return String(1024 * 1024 + 1);
          }
          return null;
        },
      },
      body: null,
      text: async () => JSON.stringify(aggregate),
    })) as unknown as typeof fetch;

    await expect(
      fetchRepositoryMetrics(
        fetchImpl,
        "https://cache.example.net/repository-metrics.json",
      ),
    ).rejects.toThrow("too large");
  });
});

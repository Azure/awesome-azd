/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { describe, expect, test } from "@jest/globals";
import {
  availableTemplates,
  allTemplates,
} from "../src/ai/data/templates";
import {
  filterTemplates,
  findLocalTemplateMatches,
  orderTemplatesBySearchMatches,
} from "../src/ai/utils/galleryFiltering";
import { extractTemplateSearchSources } from "../src/ai/utils/templateSearch";
import { normalizeTemplateSource } from "../src/ai/utils/templateSources";

describe("AI gallery data adapter", () => {
  test("exposes the 56 active AI records without duplicate sources", () => {
    expect(allTemplates).toHaveLength(56);
    expect(availableTemplates).toBe(allTemplates);
    expect(
      new Set(
        allTemplates.map((template) =>
          normalizeTemplateSource(template.source),
        ),
      ).size,
    ).toBe(56);
  });

  test("uses the preserved AI title and description metadata", () => {
    const template = availableTemplates.find(
      (candidate) =>
        candidate.source.toLowerCase() ===
        "https://github.com/azure-samples/aisearch-openai-rag-audio".toLowerCase(),
    );
    expect(template).toBeDefined();
    expect(template?.title).toBe("VoiceRAG with Realtime API");
    expect(template?.description).toContain("real-time voice interface");
  });
});

describe("AI search allowlisting", () => {
  const first = availableTemplates[0];
  const second = availableTemplates[1];
  const allowedSources = availableTemplates.map(
    (template) => template.source,
  );

  test("matches local search results by normalized repository source", () => {
    const matches = findLocalTemplateMatches(
      availableTemplates,
      first.title,
    );
    expect(matches).toContain(normalizeTemplateSource(first.source));
    expect(
      filterTemplates(availableTemplates, [], matches).map(
        (template) => template.source,
      ),
    ).toContain(first.source);
  });

  test("accepts only unique local sources from backend results", () => {
    const matches = extractTemplateSearchSources(
      [
        {
          document: {
            source: first.source.toUpperCase(),
            email: [`private${"@"}example.com`],
          },
        },
        { document: { source: first.source } },
        { document: { source: "https://github.com/example/stale-template" } },
        { document: { source: "javascript:alert(1)" } },
        { document: { title: first.title } },
      ],
      allowedSources,
    );

    expect(matches).toEqual([normalizeTemplateSource(first.source)]);
  });

  test("preserves backend relevance ordering by source", () => {
    const rankedSources = [
      normalizeTemplateSource(second.source),
      normalizeTemplateSource(first.source),
    ].filter((source): source is string => source !== null);
    const ordered = orderTemplatesBySearchMatches(
      [first, second],
      rankedSources,
    );

    expect(ordered.map((template) => template.source)).toEqual([
      second.source,
      first.source,
    ]);
  });
});

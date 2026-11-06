/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import type { TagType, Template } from "../data/tags";
import { getTemplateTags } from "./galleryTags";
import { normalizeTemplateSource } from "./templateSources";

export function findLocalTemplateMatches(
  templates: Template[],
  searchTerm: string,
): string[] {
  if (!searchTerm) {
    return [];
  }

  const normalizedSearchTerm = searchTerm.toLowerCase();
  return templates
    .filter(
      (template) =>
        template.title.toLowerCase().includes(normalizedSearchTerm) ||
        template.description.toLowerCase().includes(normalizedSearchTerm) ||
        getTemplateTags(template).some((tag) =>
          tag.toLowerCase().includes(normalizedSearchTerm),
        ),
    )
    .map((template) => normalizeTemplateSource(template.source))
    .filter((source): source is string => source !== null);
}

export function filterTemplates(
  templates: Template[],
  selectedTags: TagType[],
  matchingSources: string[] | null,
): Template[] {
  let filteredTemplates = templates;

  if (matchingSources !== null) {
    const matchingSourceSet = new Set(matchingSources);
    filteredTemplates = templates.filter((template) => {
      const source = normalizeTemplateSource(template.source);
      return source !== null && matchingSourceSet.has(source);
    });
  }

  if (selectedTags.length === 0) {
    return filteredTemplates;
  }

  return filteredTemplates.filter((template) => {
    const templateTags = getTemplateTags(template);
    return selectedTags.every((tag) => templateTags.includes(tag));
  });
}

export function orderTemplatesBySearchMatches(
  templates: Template[],
  matchingSources: string[],
): Template[] {
  const sourceRanks = new Map<string, number>();
  matchingSources.forEach((source, index) => {
    if (!sourceRanks.has(source)) {
      sourceRanks.set(source, index);
    }
  });

  return [...templates].sort((left, right) => {
    const leftSource = normalizeTemplateSource(left.source);
    const rightSource = normalizeTemplateSource(right.source);
    return (
      (leftSource === null
        ? Number.MAX_SAFE_INTEGER
        : sourceRanks.get(leftSource) ?? Number.MAX_SAFE_INTEGER) -
      (rightSource === null
        ? Number.MAX_SAFE_INTEGER
        : sourceRanks.get(rightSource) ?? Number.MAX_SAFE_INTEGER)
    );
  });
}

export function collectActiveTags(templates: Template[]): TagType[] {
  const activeTags = new Set<TagType>();
  templates.forEach((template) => {
    getTemplateTags(template).forEach((tag) => activeTags.add(tag));
  });
  return Array.from(activeTags);
}

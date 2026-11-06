/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import type { Template } from "../data/tags";
import { availableTemplates } from "../data/templates";
import { getCachedRepositoryScore } from "./repositoryMetadata";

export const sortOptions = [
  "Most Popular",
  "New to Old",
  "Old to New",
  "Alphabetical (A - Z)",
  "Alphabetical (Z - A)",
] as const;

export type SortOption = (typeof sortOptions)[number];

export const defaultSortOption: SortOption = sortOptions[0];

const originalTemplateIndexes = new Map(
  availableTemplates.map((template, index) => [template.source, index]),
);

function compareOriginalOrder(left: Template, right: Template): number {
  return (
    (originalTemplateIndexes.get(left.source) ?? Number.MAX_SAFE_INTEGER) -
    (originalTemplateIndexes.get(right.source) ?? Number.MAX_SAFE_INTEGER)
  );
}

export function sortGalleryTemplates(
  templates: Template[],
  option: SortOption,
): Template[] {
  switch (option) {
    case "New to Old":
      return [...templates].sort(
        (left, right) => compareOriginalOrder(right, left),
      );
    case "Old to New":
      return [...templates].sort(compareOriginalOrder);
    case "Alphabetical (A - Z)":
      return [...templates].sort((left, right) =>
        left.title.localeCompare(right.title),
      );
    case "Alphabetical (Z - A)":
      return [...templates].sort((left, right) =>
        right.title.localeCompare(left.title),
      );
    case "Most Popular":
    default:
      return [...templates].sort(
        (left, right) =>
          (getCachedRepositoryScore(right.source) ?? right.score ?? 10) -
          (getCachedRepositoryScore(left.source) ?? left.score ?? 10),
      );
  }
}

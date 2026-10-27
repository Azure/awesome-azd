/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import type { Extension } from "../data/extensionTypes";
import type { Template } from "../data/tags";

export const GALLERY_SORT_OPTIONS = [
  "New to old",
  "Old to new",
  "Alphabetical (A - Z)",
  "Alphabetical (Z - A)",
] as const;

export function getSortedTemplates(
  templates: Template[],
  alphabeticalTemplates: Template[],
  sortChoice: string | undefined,
): Template[] {
  if (sortChoice === GALLERY_SORT_OPTIONS[0]) {
    return templates.slice().reverse();
  }
  if (sortChoice === GALLERY_SORT_OPTIONS[1]) {
    return templates;
  }
  if (sortChoice === GALLERY_SORT_OPTIONS[3]) {
    return alphabeticalTemplates.slice().reverse();
  }
  return alphabeticalTemplates;
}

export function getSortedExtensions(
  extensions: Extension[],
  alphabeticalExtensions: Extension[],
  sortChoice: string | undefined,
): Extension[] {
  if (sortChoice === GALLERY_SORT_OPTIONS[2]) {
    return alphabeticalExtensions;
  }
  if (sortChoice === GALLERY_SORT_OPTIONS[3]) {
    return alphabeticalExtensions.slice().reverse();
  }
  if (sortChoice === GALLERY_SORT_OPTIONS[0]) {
    return extensions.slice().reverse();
  }
  // Unlike templates, extensions fall back to manifest order.
  return extensions;
}

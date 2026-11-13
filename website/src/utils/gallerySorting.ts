/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import type { Extension } from "../data/extensionTypes";

export const EXTENSION_SORT_OPTIONS = [
  "New to old",
  "Old to new",
  "Alphabetical (A - Z)",
  "Alphabetical (Z - A)",
] as const;

export function getSortedExtensions(
  extensions: Extension[],
  alphabeticalExtensions: Extension[],
  sortChoice: string | undefined,
): Extension[] {
  if (sortChoice === EXTENSION_SORT_OPTIONS[2]) {
    return alphabeticalExtensions;
  }
  if (sortChoice === EXTENSION_SORT_OPTIONS[3]) {
    return alphabeticalExtensions.slice().reverse();
  }
  if (sortChoice === EXTENSION_SORT_OPTIONS[0]) {
    return extensions.slice().reverse();
  }
  return extensions;
}

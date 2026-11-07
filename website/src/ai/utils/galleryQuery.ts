/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Tags, type TagType } from "../data/tags";

const searchNameQueryKey = "name";
const tagQueryKey = "tags";

export function readSearchName(search: string): string {
  return new URLSearchParams(search).get(searchNameQueryKey) ?? "";
}

export function replaceSearchName(search: string, name: string): string {
  const searchParams = new URLSearchParams(search);
  if (name) {
    searchParams.set(searchNameQueryKey, name);
  } else {
    searchParams.delete(searchNameQueryKey);
  }
  return searchParams.toString();
}

export function readSearchTags(search: string): TagType[] {
  return Array.from(
    new Set(
      new URLSearchParams(search)
        .getAll(tagQueryKey)
        .filter(
          (tag): tag is TagType =>
            Object.prototype.hasOwnProperty.call(Tags, tag),
        ),
    ),
  );
}

export function replaceSearchTags(
  search: string,
  tags: TagType[],
): string {
  const searchParams = new URLSearchParams(search);
  searchParams.delete(tagQueryKey);
  tags.forEach((tag) => searchParams.append(tagQueryKey, tag));
  return searchParams.toString();
}

export function clearSearchTags(search: string): string {
  const searchParams = new URLSearchParams(search);
  searchParams.delete(tagQueryKey);
  return searchParams.toString();
}

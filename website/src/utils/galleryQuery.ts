/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Tags, type TagType } from "../data/tags";

const SearchNameQueryKey = "name";
const TagQueryStringKey = "tags";
const AuthorQueryStringKey = "authors";

export function readSearchName(search: string): string | null {
  return new URLSearchParams(search).get(SearchNameQueryKey);
}

export function readSearchTags(search: string): TagType[] {
  return new URLSearchParams(search).getAll(TagQueryStringKey).filter(isKnownTag);
}

function isKnownTag(tag: string): tag is TagType {
  return Object.hasOwn(Tags, tag);
}

export function readUnknownSearchTags(search: string): string[] {
  return new URLSearchParams(search).getAll(TagQueryStringKey).filter((tag) => !isKnownTag(tag));
}

export function readSearchAuthors(search: string): string[] {
  return new URLSearchParams(search).getAll(AuthorQueryStringKey);
}

function replaceSearchValues(
  search: string,
  key: string,
  values: readonly string[],
): string {
  const searchParams = new URLSearchParams(search);
  searchParams.delete(key);
  values.forEach((value) => searchParams.append(key, value));
  return searchParams.toString();
}

export function replaceSearchName(search: string, name: string | null): string {
  return replaceSearchValues(search, SearchNameQueryKey, name ? [name] : []);
}

export function replaceSearchTags(search: string, newTags: TagType[]): string {
  return replaceSearchValues(search, TagQueryStringKey, newTags);
}

export function replaceSearchAuthors(
  search: string,
  newAuthors: string[],
): string {
  return replaceSearchValues(search, AuthorQueryStringKey, newAuthors);
}

export function clearSearchFilters(search: string): string {
  const searchParams = new URLSearchParams(search);
  searchParams.delete(TagQueryStringKey);
  searchParams.delete(AuthorQueryStringKey);
  return searchParams.toString();
}

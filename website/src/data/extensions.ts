/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { sortBy } from '../utils/jsUtils';
import { type Extension } from './extensionTypes';
import extensionsData from '../../static/extensions.json';

// SECURITY: Regex for safe extension ids — only allow alphanumeric, dots,
// hyphens, underscores, and at-signs. Ids are used to build the rendered
// `azd ext install <id>` command displayed on cards, so they must reject
// shell metacharacters (;|&$`\) and whitespace to prevent command injection
// if a user copy-pastes the rendered text into a terminal.
const SAFE_EXTENSION_ID = /^[a-zA-Z0-9.\-_@]+$/;

function validateExtensions(raw: unknown): Extension[] {
  if (!Array.isArray(raw)) {
    console.warn('Extensions data is not an array, returning empty list');
    return [];
  }
  return (raw as Record<string, unknown>[]).filter((entry, i) => {
    if (typeof entry !== 'object' || entry === null) {
      console.warn(`Extension[${i}]: not a valid object, skipping`);
      return false;
    }
    const id = entry.id;
    const displayName = entry.displayName;
    const description = entry.description;
    if (typeof id !== 'string' || !id) {
      console.warn(`Extension[${i}]: missing or invalid 'id', skipping`);
      return false;
    }
    if (!SAFE_EXTENSION_ID.test(id)) {
      console.warn(`Extension[${i}]: unsafe characters in 'id', skipping`);
      return false;
    }
    if (typeof displayName !== 'string' || !displayName) {
      console.warn(`Extension[${i}]: missing or invalid 'displayName', skipping`);
      return false;
    }
    if (typeof description !== 'string' || !description) {
      console.warn(`Extension[${i}]: missing or invalid 'description', skipping`);
      return false;
    }
    // Validate remaining fields consumed by extension cards and filters.
    const author = entry.author;
    const authorUrl = entry.authorUrl;
    const source = entry.source;
    const registryUrl = entry.registryUrl;
    if (typeof author !== 'string' || !author) {
      console.warn(`Extension[${i}]: missing or invalid 'author', skipping`);
      return false;
    }
    if (authorUrl != null && typeof authorUrl !== 'string') {
      console.warn(`Extension[${i}]: invalid 'authorUrl' type, skipping`);
      return false;
    }
    if (typeof source !== 'string' || !source) {
      console.warn(`Extension[${i}]: missing or invalid 'source', skipping`);
      return false;
    }
    if (typeof registryUrl !== 'string' || !registryUrl) {
      console.warn(`Extension[${i}]: missing or invalid 'registryUrl', skipping`);
      return false;
    }
    // Validate required array fields (coerce missing to empty arrays).
    const capabilities = entry.capabilities;
    const tags = entry.tags;
    if (capabilities != null && !Array.isArray(capabilities)) {
      console.warn(`Extension[${i}]: invalid 'capabilities' type, skipping`);
      return false;
    }
    if (capabilities == null) {
      (entry as Record<string, unknown>).capabilities = [];
    }
    if (tags != null && !Array.isArray(tags)) {
      console.warn(`Extension[${i}]: invalid 'tags' type, skipping`);
      return false;
    }
    if (tags == null) {
      (entry as Record<string, unknown>).tags = [];
    }
    return true;
  }) as Extension[];
}

export const unsortedExtensions: Extension[] = validateExtensions(extensionsData);

function sortExtensions() {
  let result = unsortedExtensions;
  result = sortBy(result, (ext) => ext.displayName.toLowerCase());
  return result;
}

export const sortedExtensions = sortExtensions();

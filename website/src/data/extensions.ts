/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { sortBy } from '../utils/jsUtils';
import { type Extension } from './extensionTypes';
import extensionsData from '../../static/extensions.json';

const SAFE_EXTENSION_ID = /^[a-zA-Z0-9@][a-zA-Z0-9._@-]*$/;
const SAFE_REGISTRY_URL =
  /^https:\/\/raw\.githubusercontent\.com\/[a-zA-Z0-9._/-]+$/i;
const SAFE_REGISTRY_PATH = /^\/[a-zA-Z0-9._/-]+$/;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

function isSafeHttpsUrl(value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    !value ||
    CONTROL_CHARACTERS.test(value)
  ) {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.port
    );
  } catch {
    return false;
  }
}

function isSafeRegistryUrl(value: unknown): value is string {
  if (!isSafeHttpsUrl(value) || !SAFE_REGISTRY_URL.test(value)) {
    return false;
  }

  const url = new URL(value);
  return (
    url.hostname.toLowerCase() === 'raw.githubusercontent.com' &&
    !url.search &&
    !url.hash &&
    SAFE_REGISTRY_PATH.test(url.pathname)
  );
}

export function validateExtensions(raw: unknown): Extension[] {
  if (!Array.isArray(raw)) {
    console.warn('Extensions data is not an array, returning empty list');
    return [];
  }

  return raw.flatMap((entry, i) => {
    if (typeof entry !== 'object' || entry === null) {
      console.warn(`Extension[${i}]: not a valid object, skipping`);
      return [];
    }

    const record = entry as Record<string, unknown>;
    const id = record.id;
    const displayName = record.displayName;
    const description = record.description;
    if (typeof id !== 'string' || !id) {
      console.warn(`Extension[${i}]: missing or invalid 'id', skipping`);
      return [];
    }
    if (!SAFE_EXTENSION_ID.test(id)) {
      console.warn(`Extension[${i}]: unsafe characters in 'id', skipping`);
      return [];
    }
    if (typeof displayName !== 'string' || !displayName) {
      console.warn(`Extension[${i}]: missing or invalid 'displayName', skipping`);
      return [];
    }
    if (typeof description !== 'string' || !description) {
      console.warn(`Extension[${i}]: missing or invalid 'description', skipping`);
      return [];
    }

    const author = record.author;
    const authorUrl = record.authorUrl;
    const source = record.source;
    const registryUrl = record.registryUrl;
    const website = record.website;
    if (typeof author !== 'string' || !author) {
      console.warn(`Extension[${i}]: missing or invalid 'author', skipping`);
      return [];
    }
    if (authorUrl != null && !isSafeHttpsUrl(authorUrl)) {
      console.warn(`Extension[${i}]: unsafe 'authorUrl', skipping`);
      return [];
    }
    if (!isSafeHttpsUrl(source)) {
      console.warn(`Extension[${i}]: unsafe or invalid 'source', skipping`);
      return [];
    }
    if (!isSafeRegistryUrl(registryUrl)) {
      console.warn(`Extension[${i}]: unsafe or invalid 'registryUrl', skipping`);
      return [];
    }
    if (website != null && !isSafeHttpsUrl(website)) {
      console.warn(`Extension[${i}]: unsafe 'website', skipping`);
      return [];
    }

    const capabilities = record.capabilities;
    const tags = record.tags;
    if (
      capabilities != null &&
      (!Array.isArray(capabilities) ||
        !capabilities.every((value) => typeof value === 'string'))
    ) {
      console.warn(`Extension[${i}]: invalid 'capabilities' type, skipping`);
      return [];
    }
    if (
      tags != null &&
      (!Array.isArray(tags) ||
        !tags.every((value) => typeof value === 'string'))
    ) {
      console.warn(`Extension[${i}]: invalid 'tags' type, skipping`);
      return [];
    }

    return [{
      id,
      displayName,
      description,
      author,
      ...(authorUrl ? { authorUrl } : {}),
      source,
      registryUrl,
      capabilities: (capabilities ?? []) as Extension['capabilities'],
      tags: (tags ?? []) as Extension['tags'],
      ...(website ? { website } : {}),
    }];
  });
}

export const unsortedExtensions: Extension[] = validateExtensions(extensionsData);

export const sortedExtensions = sortBy(
  unsortedExtensions,
  (extension) => extension.displayName.toLowerCase(),
);

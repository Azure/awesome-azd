/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { sortBy } from '../utils/jsUtils';
import { type Extension } from './extensionTypes';
import extensionsData from '../../static/extensions.json';

// SECURITY: Regex for safe installCommand values - only allow alphanumeric,
// dots, hyphens, underscores, forward slashes, at-signs, and spaces.
// Shell metacharacters (;|&$`\) are rejected to prevent command injection.
const SAFE_INSTALL_CMD = /^[a-zA-Z0-9.\-_/@ ]+$/;

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
    if (typeof displayName !== 'string' || !displayName) {
      console.warn(`Extension[${i}]: missing or invalid 'displayName', skipping`);
      return false;
    }
    if (typeof description !== 'string' || !description) {
      console.warn(`Extension[${i}]: missing or invalid 'description', skipping`);
      return false;
    }
    const installCommand = entry.installCommand;
    if (typeof installCommand !== 'string' || !installCommand) {
      console.warn(`Extension[${i}]: missing or invalid 'installCommand', skipping`);
      return false;
    }
    if (!SAFE_INSTALL_CMD.test(installCommand)) {
      console.warn(`Extension[${i}]: unsafe characters in 'installCommand', skipping`);
      return false;
    }
    // Validate remaining required string fields (coerce missing to defaults)
    const author = entry.author;
    const authorUrl = entry.authorUrl;
    const source = entry.source;
    const registryUrl = entry.registryUrl;
    const latestVersion = entry.latestVersion;
    if (author != null && typeof author !== 'string') {
      console.warn(`Extension[${i}]: invalid 'author' type, skipping`);
      return false;
    }
    if (author == null) {
      (entry as Record<string, unknown>).author = '';
    }
    if (authorUrl != null && typeof authorUrl !== 'string') {
      console.warn(`Extension[${i}]: invalid 'authorUrl' type, skipping`);
      return false;
    }
    if (authorUrl == null) {
      (entry as Record<string, unknown>).authorUrl = '';
    }
    if (source != null && typeof source !== 'string') {
      console.warn(`Extension[${i}]: invalid 'source' type, skipping`);
      return false;
    }
    if (source == null) {
      (entry as Record<string, unknown>).source = '';
    }
    if (registryUrl != null && typeof registryUrl !== 'string') {
      console.warn(`Extension[${i}]: invalid 'registryUrl' type, skipping`);
      return false;
    }
    if (registryUrl == null) {
      (entry as Record<string, unknown>).registryUrl = '';
    }
    if (latestVersion != null && typeof latestVersion !== 'string') {
      console.warn(`Extension[${i}]: invalid 'latestVersion' type, skipping`);
      return false;
    }
    if (latestVersion == null) {
      (entry as Record<string, unknown>).latestVersion = '';
    }
    // Validate required array fields (coerce missing to empty arrays)
    const capabilities = entry.capabilities;
    const platforms = entry.platforms;
    const tags = entry.tags;
    if (capabilities != null && !Array.isArray(capabilities)) {
      console.warn(`Extension[${i}]: invalid 'capabilities' type, skipping`);
      return false;
    }
    if (capabilities == null) {
      (entry as Record<string, unknown>).capabilities = [];
    }
    if (platforms != null && !Array.isArray(platforms)) {
      console.warn(`Extension[${i}]: invalid 'platforms' type, skipping`);
      return false;
    }
    if (platforms == null) {
      (entry as Record<string, unknown>).platforms = [];
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

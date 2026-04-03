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
const SAFE_INSTALL_CMD = /^[a-zA-Z0-9.\-_/@\s]+$/;

function validateExtensions(raw: unknown[]): Extension[] {
  return (raw as Record<string, unknown>[]).filter((entry, i) => {
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
    if (typeof installCommand === 'string' && !SAFE_INSTALL_CMD.test(installCommand)) {
      console.warn(`Extension[${i}]: unsafe characters in 'installCommand', skipping`);
      return false;
    }
    return true;
  }) as Extension[];
}

export const unsortedExtensions: Extension[] = validateExtensions(extensionsData as unknown[]);

function sortExtensions() {
  let result = unsortedExtensions;
  result = sortBy(result, (ext) => ext.displayName.toLowerCase());
  return result;
}

export const sortedExtensions = sortExtensions();

/**
* Copyright (c) Microsoft Corporation. All rights reserved.
* Licensed under the MIT License.
 */

/* eslint-disable global-require */

import { sortBy } from '../utils/jsUtils';
import { TagType, User, Tags } from './tags';
import templates from '../../static/templates.json'

// *** ADDING DATA TO AZD GALLERY ****/

// Currently using Custom Issues on Repo

// *************** CARD DATA STARTS HERE ***********************
// Add your site to this list
// prettier-ignore

// SECURITY: Runtime validation of JSON template data to catch malformed or
// tampered entries before they reach the UI.
function validateTemplates(raw: unknown): User[] {
  if (!Array.isArray(raw)) {
    console.warn('Templates data is not an array, returning empty list');
    return [];
  }
  return (raw as Record<string, unknown>[]).filter((entry, i) => {
    if (typeof entry !== 'object' || entry === null) {
      console.warn(`Template[${i}]: not a valid object, skipping`);
      return false;
    }
    const title = entry.title;
    const description = entry.description;
    const source = entry.source;
    const author = entry.author;
    const authorUrl = entry.authorUrl;
    const tags = entry.tags;
    if (typeof title !== 'string' || !title) {
      console.warn(`Template[${i}]: missing or invalid 'title', skipping`);
      return false;
    }
    if (typeof description !== 'string' || !description) {
      console.warn(`Template[${i}]: missing or invalid 'description', skipping`);
      return false;
    }
    if (typeof source !== 'string' || !source.startsWith('https://github.com/')) {
      console.warn(`Template[${i}]: invalid 'source' URL "${source}", skipping`);
      return false;
    }
    if (typeof author !== 'string' || !author) {
      console.warn(`Template[${i}]: missing or invalid 'author', skipping`);
      return false;
    }
    if (authorUrl != null && typeof authorUrl !== 'string') {
      console.warn(`Template[${i}]: invalid 'authorUrl' type, skipping`);
      return false;
    }
    // Coerce missing authorUrl to empty string for type safety
    if (authorUrl == null) {
      (entry as Record<string, unknown>).authorUrl = '';
    }

    if (!Array.isArray(tags) || tags.length === 0) {
      console.warn(`Template[${i}]: missing or empty 'tags', skipping`);
      return false;
    }
    return true;
  }) as User[];
}

// Extension templates (e.g. `azd ai agent init` agents with
// `templateType: "extension.ai.agent"`) live in the same templates.json
// manifest so specialized `azd` flows can consume a single source of truth,
// but they are NOT displayed in the awesome-azd gallery.
export function isGalleryTemplate(user: User): boolean {
  return !(
    typeof user.templateType === 'string' &&
    user.templateType.startsWith('extension.')
  );
}

export function filterGalleryTemplates(users: User[]): User[] {
  return users.filter(isGalleryTemplate);
}

export const unsortedUsers: User[] = filterGalleryTemplates(
  validateTemplates(templates)
);

export const TagList = Object.keys(Tags) as TagType[];
function sortUsers() {
  let result = unsortedUsers;
  // Sort by site name
  result = sortBy(result, (user) => user.title.toLowerCase());
  return result;
}

export const sortedUsers = sortUsers();

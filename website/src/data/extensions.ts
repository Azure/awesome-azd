/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { sortBy } from '../utils/jsUtils';
import { type Extension } from './extensionTypes';
import extensionsData from '../../static/extensions.json';

export const unsortedExtensions: Extension[] = extensionsData as Extension[];

function sortExtensions() {
  let result = unsortedExtensions;
  result = sortBy(result, (ext) => ext.displayName.toLowerCase());
  return result;
}

export const sortedExtensions = sortExtensions();

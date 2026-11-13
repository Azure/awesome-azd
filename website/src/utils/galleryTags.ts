/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import type { Extension } from "../data/extensionTypes";
import type { TagType } from "../data/tags";

export function getExtensionTags(extension: Extension): TagType[] {
  return [
    ...extension.tags,
    ...extension.capabilities.map(
      (capability): TagType => `ext-${capability}`,
    ),
  ];
}

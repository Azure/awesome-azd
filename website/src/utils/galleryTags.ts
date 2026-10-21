/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import type { Extension } from "../data/extensionTypes";
import type { TagType, User } from "../data/tags";

export function getTemplateTags(template: User): TagType[] {
  return [
    ...(template.tags || []),
    ...(template.languages || []),
    ...(template.frameworks || []),
    ...(template.azureServices || []),
    ...(template.IaC || []),
  ];
}

export function getExtensionTags(extension: Extension): TagType[] {
  return [
    ...extension.tags,
    ...extension.capabilities.map(
      (capability): TagType => `ext-${capability}`,
    ),
  ];
}

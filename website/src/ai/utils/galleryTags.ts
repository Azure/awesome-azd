/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import type { TagType, Template } from "../data/tags";

const templateTags = new WeakMap<Template, TagType[]>();

export function getTemplateTags(template: Template): TagType[] {
  const cachedTags = templateTags.get(template);
  if (cachedTags) {
    return cachedTags;
  }

  const tags = [
    ...template.tags,
    ...template.language,
    ...template.app_type,
    ...template.azure_service,
    ...template.models,
  ];
  templateTags.set(template, tags);
  return tags;
}

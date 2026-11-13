/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import type { Extension } from "../data/extensionTypes";
import type { TagType } from "../data/tags";
import { getExtensionTags } from "./galleryTags";
import { splitAuthors } from "./jsUtils";

export function filterExtensions(
  extensions: Extension[],
  selectedTags: TagType[],
  selectedAuthors: string[],
  searchName: string | null,
): Extension[] {
  if (searchName) {
    const query = searchName.toLowerCase();
    extensions = extensions.filter(
      (extension) =>
        extension.displayName.toLowerCase().includes(query) ||
        extension.description.toLowerCase().includes(query) ||
        extension.author.toLowerCase().includes(query) ||
        extension.id.toLowerCase().includes(query) ||
        (extension.website &&
          extension.website.toLowerCase().includes(query)),
    );
  }

  if (selectedAuthors.length > 0) {
    extensions = extensions.filter((extension) => {
      const authors = splitAuthors(extension.author);
      return selectedAuthors.some((author) => authors.includes(author));
    });
  }

  if (selectedTags.length === 0) {
    return extensions;
  }

  return extensions.filter((extension) => {
    const tags = getExtensionTags(extension);
    return selectedTags.every((tag) => tags.includes(tag));
  });
}

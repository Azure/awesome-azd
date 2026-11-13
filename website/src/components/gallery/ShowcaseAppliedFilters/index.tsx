/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Button } from "@fluentui/react-components";
import { useHistory } from "@docusaurus/router";
import type { Location } from "history";
import { Tags, type TagType } from "../../../data/tags";
import { toggleListItem } from "@site/src/utils/jsUtils";
import { captureGalleryNavigationState } from "@site/src/utils/galleryNavigation";
import {
  readSearchTags,
  replaceSearchTags,
  readSearchAuthors,
  replaceSearchAuthors,
} from "@site/src/utils/galleryQuery";
import controlStyles from "../../GalleryControls/styles.module.css";

export default function ShowcaseAppliedFilters({
  selectedTags,
  selectedAuthors,
  location,
}: {
  selectedTags: TagType[];
  selectedAuthors: string[];
  location: Location;
}) {
  const history = useHistory();
  const toggleTag = (tag: TagType) => {
    const tags = readSearchTags(location.search);
    const newTags = toggleListItem(tags, tag);
    const newSearch = replaceSearchTags(location.search, newTags);
    history.push({
      ...location,
      search: newSearch,
      state: captureGalleryNavigationState(),
    });
  }

  const toggleAuthor = (author: string) => {
    const authors = readSearchAuthors(location.search);
    const newAuthors = toggleListItem(authors, author);
    const newSearch = replaceSearchAuthors(location.search, newAuthors);
    history.push({
      ...location,
      search: newSearch,
      state: captureGalleryNavigationState(),
    });
  }

  return selectedTags.length > 0 || selectedAuthors.length > 0 ? (
    <div
      className={controlStyles.activeFilters}
      role="group"
      aria-label="Applied filters"
    >
      {selectedTags.map((tag) => {
        const tagObject = Tags[tag];
        const key = `showcase_checkbox_key_${tag}`;

        return (
          <Button
            key={key}
            appearance="outline"
            size="small"
            shape="circular"
            onClick={() => {
              toggleTag(tag);
            }}
            aria-label={`Remove ${tagObject.label} filter`}
          >
            {tagObject.label} <span aria-hidden="true">×</span>
          </Button>
        );
      })}
      {selectedAuthors.map((author) => {
        const key = `showcase_checkbox_author_key_${author}`;

        return (
          <Button
            key={key}
            appearance="outline"
            size="small"
            shape="circular"
            onClick={() => {
              toggleAuthor(author);
            }}
            aria-label={`Remove ${author} filter`}
          >
            {author} <span aria-hidden="true">×</span>
          </Button>
        );
      })}
    </div>
  ) : null;
}

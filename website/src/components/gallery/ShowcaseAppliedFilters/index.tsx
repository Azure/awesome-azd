/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { Badge, Body1 } from "@fluentui/react-components";
import { Dismiss20Filled } from "@fluentui/react-icons";
import { useHistory } from "@docusaurus/router";
import type { Location } from "history";
import { Tags, type TagType } from "../../../data/tags";
import { toggleListItem } from "@site/src/utils/jsUtils";
import { prepareUserState } from "@site/src/utils/galleryNavigation";
import styles from "./styles.module.css";

export default function ShowcaseAppliedFilters({
  clearAll,
  selectedTags,
  selectedAuthors,
  readSearchTags,
  replaceSearchTags,
  readSearchAuthors,
  replaceSearchAuthors,
  location,
}: {
  clearAll: () => void;
  selectedTags: TagType[];
  selectedAuthors: string[];
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
  readSearchAuthors: (search: string) => string[];
  replaceSearchAuthors: (search: string, newAuthors: string[]) => string;
  location: Location;
}) {
  const history = useHistory();
  const toggleTag = (tag: TagType, location: Location) => {
    const tags = readSearchTags(location.search);
    const newTags = toggleListItem(tags, tag);
    const newSearch = replaceSearchTags(location.search, newTags);
    history.push({
      ...location,
      search: newSearch,
      state: prepareUserState(),
    });
  }

  const toggleAuthor = (author: string, location: Location) => {
    const authors = readSearchAuthors(location.search);
    const newAuthors = toggleListItem(authors, author);
    const newSearch = replaceSearchAuthors(location.search, newAuthors);
    history.push({
      ...location,
      search: newSearch,
      state: prepareUserState(),
    });
  }

  return selectedTags && selectedTags.length > 0 || (selectedAuthors && selectedAuthors.length > 0) ? (
    <div className={styles.filterAppliedBar}>
      <Body1>
        Filters applied:
      </Body1>
      {selectedTags.map((tag, index) => {
        const tagObject = Tags[tag];
        const key = `showcase_checkbox_key_${tag}`;
        const id = `showcase_checkbox_id_${tag}`;

        return (
          <Badge
            key={key}
            appearance="tint"
            size="extra-large"
            color="brand"
            shape="rounded"
            icon={<Dismiss20Filled />}
            iconPosition="after"
            className={styles.filterBadge}
            role="button"
            tabIndex={0}
            onClick={() => {
              toggleTag(tag, location);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleTag(tag, location);
              }
            }}
            aria-label={`Remove ${tagObject.label} filter`}
          >
            {tagObject.label}
          </Badge>
        );
      })}
      {selectedAuthors.map((author, index) => {
        const key = `showcase_checkbox_author_key_${author}`;

        return (
          <Badge
            key={key}
            appearance="tint"
            size="extra-large"
            color="brand"
            shape="rounded"
            icon={<Dismiss20Filled />}
            iconPosition="after"
            className={styles.filterBadge}
            role="button"
            tabIndex={0}
            onClick={() => {
              toggleAuthor(author, location);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleAuthor(author, location);
              }
            }}
            aria-label={`Remove ${author} filter`}
          >
            {author}
          </Badge>
        );
      })}
      <button
        type="button"
        className={styles.clearAll}
        onClick={clearAll}
      >
        Clear all
      </button>
    </div>
  ) : null;
}

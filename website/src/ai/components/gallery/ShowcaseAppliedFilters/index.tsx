/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import { Badge, Body1 } from "@fluentui/react-components";
import { Dismiss20Filled } from "@fluentui/react-icons";
import { Tags, type TagType } from "../../../data/tags";
import {
  captureGalleryNavigationState,
  type GalleryNavigationState,
} from "../../../utils/galleryNavigation";
import {
  readSearchTags,
  replaceSearchTags,
} from "../../../utils/galleryQuery";
import { toggleListItem } from "../../../utils/jsUtils";
import styles from "../styles.module.css";

export default function ShowcaseAppliedFilters({
  selectedTags,
  onClearAll,
}: {
  selectedTags: TagType[];
  onClearAll: () => void;
}) {
  const history = useHistory();
  const location = useLocation<GalleryNavigationState>();

  const toggleTag = (tag: TagType) => {
    const tags = readSearchTags(location.search);
    history.push({
      ...location,
      search: replaceSearchTags(location.search, toggleListItem(tags, tag)),
      state: captureGalleryNavigationState(),
    });
  };

  if (selectedTags.length === 0) {
    return null;
  }

  return (
    <div className={styles.filterAppliedBar}>
      <Body1>Filters applied:</Body1>
      {selectedTags.map((tag) => (
        <Badge
          key={tag}
          id={`showcase_checkbox_id_filter_applied_${tag}`}
          className={styles.tagBadge}
          appearance="filled"
          size="extra-large"
          color="brand"
          shape="circular"
          icon={<Dismiss20Filled />}
          iconPosition="after"
          onClick={() => toggleTag(tag)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              toggleTag(tag);
            }
          }}
          tabIndex={0}
        >
          {Tags[tag].label}
        </Badge>
      ))}
      <div
        className={styles.clearAll}
        onClick={onClearAll}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onClearAll();
          }
        }}
        role="button"
        tabIndex={0}
      >
        Clear all
      </div>
    </div>
  );
}

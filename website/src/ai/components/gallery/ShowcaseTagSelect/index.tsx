/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import { toggleListItem } from "@site/src/ai/utils/jsUtils";
import { type TagType } from "@site/src/ai/data/tags";
import { Checkbox } from "@fluentui/react-components";
import {
  captureGalleryNavigationState,
  type GalleryNavigationState,
} from "@site/src/ai/utils/galleryNavigation";
import {
  readSearchTags,
  replaceSearchTags,
} from "@site/src/ai/utils/galleryQuery";

export default function ShowcaseTagSelect(
  {
    label,
    tag,
    id,
    activeTags,
    selectedTags,
  }: {
    label: string;
    tag: TagType;
    id: string;
    activeTags: TagType[];
    selectedTags: TagType[];
  }
): React.JSX.Element {
  const history = useHistory();
  const location = useLocation<GalleryNavigationState>();
  // updates only the url query
  const toggleTag = () => {
    const tags = readSearchTags(location.search);
    const newTags = toggleListItem(tags, tag);
    const newSearch = replaceSearchTags(location.search, newTags);
    history.push({
      ...location,
      search: newSearch,
      state: captureGalleryNavigationState(),
    });
  };

  // Adobe Analytics
  const checkbox = id.replace("showcase_checkbox_id_", "")
  const contentForAdobeAnalytics = `{\"id\":\"${checkbox}\",\"cN\":\"Tags\"}`

  return (
    <>
      <Checkbox
        id={id}
        data-m={contentForAdobeAnalytics}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            toggleTag();
          }
        }}
        onChange={() => {
          toggleTag();
        }}
        checked={selectedTags.includes(tag)}
        label={label}
        disabled={
          !activeTags.includes(tag) && !selectedTags.includes(tag)
        }
      />
    </>
  );
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import type { Location } from "history";
import { useHistory } from "@docusaurus/router";
import { toggleListItem } from "@site/src/utils/jsUtils";
import { captureGalleryNavigationState } from "@site/src/utils/galleryNavigation";
import { readSearchTags, replaceSearchTags } from "@site/src/utils/galleryQuery";
import { type TagType } from "@site/src/data/tags";
import { Checkbox } from "@fluentui/react-components";

export default function ShowcaseTagSelect({
  label,
  tag,
  id,
  activeTags,
  selectedTags,
  location,
  count,
}: {
  label: string;
  tag: TagType;
  id: string;
  activeTags: TagType[];
  selectedTags: TagType[];
  location: Location;
  count?: number;
}): React.JSX.Element {
  const history = useHistory();
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

  const tagId = id.replace("showcase_checkbox_id_", "");
  const contentForAdobeAnalytics = `{\"id\":\"${tagId}\",\"cN\":\"Tags\"}`;

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
        label={count !== undefined ? `${label} (${count})` : label}
        disabled={!activeTags?.includes(tag)}
      />
    </>
  );
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useCallback, useEffect } from "react";
import { useHistory } from "@docusaurus/router";
import { toggleListItem } from "@site/src/utils/jsUtils";
import { prepareUserState } from "@site/src/pages/index";
import { type TagType } from "@site/src/data/tags";
import { Checkbox } from "@fluentui/react-components";

export const TagQueryStringKey = "tags";

export function readSearchTags(search: string): TagType[] {
  return new URLSearchParams(search).getAll(TagQueryStringKey) as TagType[];
}

function replaceSearchTags(search: string, newTags: TagType[]) {
  const searchParams = new URLSearchParams(search);
  searchParams.delete(TagQueryStringKey);
  newTags.forEach((tag) => searchParams.append(TagQueryStringKey, tag));
  return searchParams.toString();
}

export function toggleTag(tag: TagType, location: Location) {
  const history = useHistory();
  return useCallback(() => {
    const tags = readSearchTags(location.search);
    const newTags = toggleListItem(tags, tag);
    const newSearch = replaceSearchTags(location.search, newTags);
    history.push({
      ...location,
      search: newSearch,
      state: prepareUserState(),
    });
  }, [tag, location, history]);
}

export default function ShowcaseTagSelect({
  label,
  tag,
  id,
  activeTags,
  selectedCheckbox,
  setSelectedCheckbox,
  location,
  setSelectedTags,
}: {
  label: string;
  tag: TagType;
  id: string;
  activeTags: TagType[];
  selectedCheckbox: boolean;
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<boolean>>;
  location;
  setSelectedTags: React.Dispatch<React.SetStateAction<TagType[]>>;
}): JSX.Element {
  useEffect(() => {
    const tags = readSearchTags(location.search);
    setSelectedCheckbox(tags.includes(tag));
  }, [tag, location]);
  const template = id.replace("showcase_checkbox_id_", "");
  const contentForAdobeAnalytics = `{\"id\":\"${template}\",\"cN\":\"Tags\"}`;
  return (
    <>
      <Checkbox
        id={id}
        data-m={contentForAdobeAnalytics}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            toggleTag(tag, location);
          }
        }}
        onChange={toggleTag(tag, location)}
        checked={selectedCheckbox}
        label={label}
        disabled={!activeTags?.includes(tag)}
      />
    </>
  );
}

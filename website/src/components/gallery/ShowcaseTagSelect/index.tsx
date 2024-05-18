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

export default function ShowcaseTagSelect({
  label,
  tag,
  id,
  activeTags,
  selectedCheckbox,
  setSelectedCheckbox,
  location,
  readSearchTags,
  replaceSearchTags,
}: {
  label: string;
  tag: TagType;
  id: string;
  activeTags: TagType[];
  selectedCheckbox: TagType[];
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  location;
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
}): JSX.Element {
  const history = useHistory();
  // updates only the url query
  const toggleTag = () => {
    const tags = readSearchTags(location.search);
    const newTags = toggleListItem(tags, tag);
    const newSearch = replaceSearchTags(location.search, newTags);
    history.push({
      ...location,
      search: newSearch,
      state: prepareUserState(),
    });
  };

  const template = id.replace("showcase_checkbox_id_", "");
  const contentForAdobeAnalytics = `{\"id\":\"${template}\",\"cN\":\"Tags\"}`;

  const toggleCheck = (tag: TagType) => {
    if (selectedCheckbox.includes(tag)) {
      setSelectedCheckbox(selectedCheckbox.filter((item) => item !== tag));
    } else {
      setSelectedCheckbox([...selectedCheckbox, tag]);
    }
  };

  return (
    <>
      <Checkbox
        id={id}
        data-m={contentForAdobeAnalytics}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            toggleTag();
          }
          toggleCheck(tag);
        }}
        onChange={() => {
          toggleTag();
          toggleCheck(tag);
        }}
        checked={selectedCheckbox.includes(tag)}
        label={label}
        disabled={!activeTags?.includes(tag)}
      />
    </>
  );
}

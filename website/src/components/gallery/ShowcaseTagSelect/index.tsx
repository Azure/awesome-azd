/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useCallback, useState, useEffect } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import { toggleListItem } from "@site/src/utils/jsUtils";
import { prepareUserState } from "@site/src/pages/index";
import { type TagType } from "@site/src/data/tags";

import { Checkbox } from "@fluentui/react-components";

const TagQueryStringKey = "tags";

export function readSearchTags(search: string): TagType[] {
  return new URLSearchParams(search).getAll(TagQueryStringKey) as TagType[];
}

function replaceSearchTags(search: string, newTags: TagType[]) {
  const searchParams = new URLSearchParams(search);
  searchParams.delete(TagQueryStringKey);
  newTags.forEach((tag) => searchParams.append(TagQueryStringKey, tag));
  return searchParams.toString();
}

export default function ShowcaseTagSelect(
  // id: string,
  {
    label,
    tag,
  }: {
    label: string;
    tag: TagType;
  }
): JSX.Element {
  const location = useLocation();
  const history = useHistory();
  const [selected, setSelected] = useState(false);
  useEffect(() => {
    const tags = readSearchTags(location.search);
    setSelected(tags.includes(tag));
  }, [tag, location]);
  const toggleTag = useCallback(() => {
    const tags = readSearchTags(location.search);
    const newTags = toggleListItem(tags, tag);
    const newSearch = replaceSearchTags(location.search, newTags);
    history.push({
      ...location,
      search: newSearch,
      state: prepareUserState(),
    });
  }, [tag, location, history]);
  return (
    <>
      <Checkbox
        // id={id}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            toggleTag();
          }
        }}
        onChange={toggleTag}
        checked={selected}
        label={label}
      />
    </>
  );
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import { SearchBox } from "@fluentui/react-search";
import {
  captureGalleryNavigationState,
  type GalleryNavigationState,
} from "../../../utils/galleryNavigation";
import { replaceSearchName } from "../../../utils/galleryQuery";
import styles from "../styles.module.css";

const searchTracking = {
  name: "Search",
  id: "search_submit_btn",
};

export default function ShowcaseTemplateSearch({
  searchValue,
  onSearchSubmit,
}: {
  searchValue: string;
  onSearchSubmit: (submittedValue: string) => void;
}) {
  const history = useHistory();
  const location = useLocation<GalleryNavigationState>();
  const [value, setValue] = useState(searchValue);

  useEffect(() => {
    setValue(searchValue);
  }, [searchValue]);

  const updateSearch = (nextValue: string) => {
    history.push({
      ...location,
      search: replaceSearchName(location.search, nextValue),
      state: captureGalleryNavigationState(),
    });
  };

  return (
    <div
      className={styles.searchBoxDiv}
      role="search"
      data-m={JSON.stringify({ cN: "Searchbox" })}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          updateSearch(value);
          onSearchSubmit(value);
        }
      }}
    >
      <SearchBox
        className={styles.searchBox}
        id="filterBar"
        appearance="outline"
        size="large"
        value={value}
        placeholder="Search templates"
        data-bi-mto
        data-bi-name={searchTracking.name}
        data-bi-id={searchTracking.id}
        onChange={(_event, data) => {
          setValue(data.value);
          if (!data.value) {
            updateSearch("");
          }
        }}
      />
    </div>
  );
}

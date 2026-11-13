/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "@docusaurus/Link";
import { useHistory, useLocation } from "@docusaurus/router";
import { SearchBox } from "@fluentui/react-components";
import { Open16Regular } from "@fluentui/react-icons";
import { captureGalleryNavigationState } from "@site/src/utils/galleryNavigation";
import { readSearchName, replaceSearchName } from "@site/src/utils/galleryQuery";
import controlStyles from "../../GalleryControls/styles.module.css";
import styles from "./styles.module.css";

export function ExtensionSearchBox(): React.JSX.Element {
  const history = useHistory();
  const location = useLocation();
  const [value, setValue] = useState<string | null>(null);
  const valueRef = useRef("");

  useEffect(() => {
    const searchValue = readSearchName(location.search);
    valueRef.current = searchValue ?? "";
    setValue(searchValue);
  }, [location.search]);

  const submitSearch = useCallback(
    (searchValue: string) => {
      history.push({
        ...location,
        search: replaceSearchName(location.search, searchValue),
        state: captureGalleryNavigationState(),
      });
    },
    [history, location],
  );

  return (
    <form
      className={styles.searchForm}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        submitSearch(valueRef.current);
      }}
    >
      <SearchBox
        id="filterBar"
        className={controlStyles.search}
        appearance="outline"
        size="medium"
        value={value ?? ""}
        placeholder="Search extensions by name, capability, or author"
        aria-label="Search extensions"
        autoComplete="off"
        dismiss={value ? { "aria-label": "Clear search" } : null}
        onChange={(_event, data) => {
          valueRef.current = data.value;
          setValue(data.value);
          if (!data.value && readSearchName(location.search)) {
            submitSearch("");
          }
        }}
      />
    </form>
  );
}

export default function ExtensionGalleryHeader(): React.JSX.Element {
  return (
    <section className={styles.searchContainer}>
      <div className={styles.searchArea}>
        <div className={styles.heroIntro}>
          <h1 className={styles.heroBar}>Extension Gallery</h1>
          <p className={styles.heroDescription}>
            Discover azd extensions that add new capabilities to your workflow.
          </p>
        </div>
        <div className={styles.heroActions}>
          <p className={styles.heroSubtext}>
            Extensions add new commands, lifecycle hooks, and capabilities to
            azd.
          </p>
          <Link
            to="https://learn.microsoft.com/azure/developer/azure-developer-cli/extensions/overview"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.docsLink}
          >
            Explore extension docs
            <Open16Regular aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

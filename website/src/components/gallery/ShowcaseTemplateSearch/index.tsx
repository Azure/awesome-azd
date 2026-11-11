/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useCallback, useEffect, useState } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import { Link as FluentUILink } from "@fluentui/react-components";
import { Open16Regular } from "@fluentui/react-icons";
import { SearchBox } from "@fluentui/react-search";
import { getContentType } from "@site/src/utils/contentType";
import { captureGalleryNavigationState } from "@site/src/utils/galleryNavigation";
import { readSearchName, replaceSearchName } from "@site/src/utils/galleryQuery";
import styles from "./styles.module.css";

const PLACEHOLDERS: Record<string, string> = {
  templates: "Search for an azd template or author...",
  extensions: "Search for an azd extension, capability, or author...",
};

export function GallerySearchBox(): React.JSX.Element {
  const history = useHistory();
  const location = useLocation();
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    setValue(readSearchName(location.search));
  }, [location.search]);

  const contentType = getContentType(location);
  const placeholder = PLACEHOLDERS[contentType] || PLACEHOLDERS.templates;
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
        submitSearch(value ?? "");
      }}
    >
      <SearchBox
        id="filterBar"
        className={styles.searchBox}
        appearance="outline"
        size="medium"
        value={value ?? ""}
        placeholder={placeholder}
        aria-label="Search extensions"
        autoComplete="off"
        dismiss={value ? { "aria-label": "Clear search" } : null}
        onChange={(_event, data) => {
          setValue(data.value);
          if (!data.value && readSearchName(location.search)) {
            submitSearch("");
          }
        }}
      />
    </form>
  );
}

export default function ShowcaseTemplateSearch(): React.JSX.Element {
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
          <FluentUILink
            href="https://learn.microsoft.com/azure/developer/azure-developer-cli/extensions/overview"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.docsLink}
          >
            Explore extension docs
            <Open16Regular aria-hidden="true" />
          </FluentUILink>
        </div>
      </div>
    </section>
  );
}

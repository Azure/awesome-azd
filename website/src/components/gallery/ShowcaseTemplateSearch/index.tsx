/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useState } from "react";
import { SearchBox, type ISearchBoxStyles } from "@fluentui/react/lib/SearchBox";
import { useHistory, useLocation } from "@docusaurus/router";
import { Link as FluentUILink } from "@fluentui/react-components";
import { getContentType } from "@site/src/utils/contentType";
import { captureGalleryNavigationState } from "@site/src/utils/galleryNavigation";
import { readSearchName, replaceSearchName } from "@site/src/utils/galleryQuery";
import styles from "./styles.module.css";

const PLACEHOLDERS: Record<string, string> = {
  templates: "Search for an azd template or author...",
  extensions: "Search for an azd extension, capability, or author...",
};
const searchBoxStyles: Partial<ISearchBoxStyles> = {
  root: {
    border: "1px solid var(--site-color-border)",
    height: "40px",
    maxWidth: "100%",
    width: "100%",
    borderRadius: "8px",
    background: "var(--site-color-surface)",
  },
  icon: {
    fontSize: "18px",
    paddingLeft: "8px",
  },
  field: {
    paddingLeft: "10px",
    fontSize: "14px",
    color: "var(--site-color-text)",
    backgroundColor: "transparent",
    selectors: {
      "::placeholder": {
        color: "var(--site-color-text-muted)",
      },
    },
  },
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

  return (
    <SearchBox
      styles={searchBoxStyles}
      id="filterBar"
      value={value ?? ""}
      placeholder={placeholder}
      role="search"
      ariaLabel="Search extensions"
      onClear={() => {
        setValue(null);
        history.push({
          ...location,
          search: replaceSearchName(location.search, null),
          state: captureGalleryNavigationState(),
        });
      }}
      onSearch={(newValue) => {
        const submitted =
          typeof newValue === "string" ? newValue : (value ?? "");
        setValue(submitted);
        history.push({
          ...location,
          search: replaceSearchName(location.search, submitted),
          state: captureGalleryNavigationState(),
        });
      }}
      onChange={(event) => {
        if (event) {
          setValue(event.currentTarget.value);
        }
      }}
    />
  );
}

export default function ShowcaseTemplateSearch(): React.JSX.Element {
  return (
    <section className={styles.searchContainer}>
      <div className={styles.searchArea}>
        <div className={styles.heroIntro}>
          <h1 className={styles.heroBar}>
            Extension <span>Gallery</span>
          </h1>
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
            className={styles.outlineButton}
          >
            Explore extension docs
          </FluentUILink>
        </div>
      </div>
    </section>
  );
}

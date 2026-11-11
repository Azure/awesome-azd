/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useMemo, useEffect } from "react";
import useIsBrowser from "@docusaurus/useIsBrowser";
import ShowcaseLeftFilters from "../ShowcaseLeftFilters";
import ShowcaseTemplateSearch from "../ShowcaseTemplateSearch";
import {
  type DropdownProps,
} from "@fluentui/react-components";
import SiteFluentProvider from "../../SiteFluentProvider";
import type { GalleryNavigationState } from "@site/src/utils/galleryNavigation";
import {
  readSearchTags,
  readUnknownSearchTags,
  readSearchAuthors,
} from "@site/src/utils/galleryQuery";
import { type TagType } from "@site/src/data/tags";
import { unsortedExtensions } from "@site/src/data/extensions";
import { getExtensionTags } from "@site/src/utils/galleryTags";
import styles from "./styles.module.css";
import ShowcaseResults from "../ShowcaseResults";
import ShowcaseResultsToolbar from "../ShowcaseResultsToolbar";
import { useLocation } from "@docusaurus/router";
import { initializeFluentIcons } from "@site/src/utils/fluentIcons";
import { GALLERY_SORT_OPTIONS } from "@site/src/utils/gallerySorting";

initializeFluentIcons();

const extensionTags = [
  ...new Set(unsortedExtensions.flatMap(getExtensionTags)),
];

const BackToTopButton = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      className={styles.backToTopButton}
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
    >
      ↑
    </button>
  );
};

export default function GalleryPage(): React.JSX.Element | null {
  const isBrowser = useIsBrowser();
  const [activeTags, setActiveTags] =
    useState<TagType[]>(extensionTags);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([
    GALLERY_SORT_OPTIONS[2],
  ]);
  const location = useLocation<GalleryNavigationState>();
  const hydrationSafeSearch = isBrowser ? location.search : "";
  const galleryLocation = useMemo(
    () => ({ ...location, search: hydrationSafeSearch }),
    [hydrationSafeSearch, location],
  );
  const selectedTags = useMemo(
    () => readSearchTags(hydrationSafeSearch),
    [hydrationSafeSearch],
  );
  const selectedAuthors = useMemo(
    () => readSearchAuthors(hydrationSafeSearch),
    [hydrationSafeSearch],
  );
  useEffect(() => {
    if (
      isBrowser &&
      readUnknownSearchTags(location.search).length > 0
    ) {
      console.warn("Unsupported gallery URL tags were ignored.");
    }
  }, [isBrowser, location.search]);
  const sortByOnSelect: NonNullable<DropdownProps["onOptionSelect"]> = (
    _event,
    data,
  ) => {
    setSelectedOptions(
      data.selectedOptions.length > 0
        ? data.selectedOptions
        : [GALLERY_SORT_OPTIONS[2]],
    );
  };

  return (
    <SiteFluentProvider className={styles.fluentProvider}>
      <main className={styles.page}>
        <ShowcaseTemplateSearch />
        <ShowcaseResultsToolbar
          selectedOptions={selectedOptions}
          onSortSelect={sortByOnSelect}
        />
        <div className={styles.filterAndCard}>
          <div
            className={styles.filter}
            data-testid="extension-filter-panel"
          >
            <ShowcaseLeftFilters
              activeTags={activeTags}
              location={galleryLocation}
              selectedTags={selectedTags}
              selectedAuthors={selectedAuthors}
            />
          </div>
          <div className={styles.card}>
            <ShowcaseResults
              setActiveTags={setActiveTags}
              selectedTags={selectedTags}
              location={galleryLocation}
              selectedAuthors={selectedAuthors}
              selectedOptions={selectedOptions}
            />
          </div>
        </div>
        <BackToTopButton />
      </main>
    </SiteFluentProvider>
  );
}

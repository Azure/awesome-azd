/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useMemo, useEffect } from "react";
import useIsBrowser from "@docusaurus/useIsBrowser";
import ExtensionFilters from "../ExtensionFilters";
import ExtensionGalleryHeader from "../ExtensionGalleryHeader";
import {
  Button,
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
import ExtensionResults from "../ExtensionResults";
import ExtensionResultsToolbar from "../ExtensionResultsToolbar";
import { useLocation } from "@docusaurus/router";
import { initializeFluentIcons } from "@site/src/utils/fluentIcons";
import { EXTENSION_SORT_OPTIONS } from "@site/src/utils/gallerySorting";

initializeFluentIcons();

const extensionTags = [
  ...new Set(unsortedExtensions.flatMap(getExtensionTags)),
];

export default function ExtensionGalleryPage(): React.JSX.Element {
  const isBrowser = useIsBrowser();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activeTags, setActiveTags] = useState<TagType[]>(extensionTags);
  const [selectedSortOptions, setSelectedSortOptions] = useState<string[]>([
    EXTENSION_SORT_OPTIONS[2],
  ]);
  const location = useLocation<GalleryNavigationState>();
  const hydrationSafeSearch = isBrowser ? location.search : "";
  const extensionLocation = useMemo(
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
  const activeFilterCount = selectedTags.length + selectedAuthors.length;
  useEffect(() => {
    if (
      isBrowser &&
      readUnknownSearchTags(location.search).length > 0
    ) {
      console.warn("Unsupported gallery URL tags were ignored.");
    }
  }, [isBrowser, location.search]);
  const handleSortSelect: NonNullable<DropdownProps["onOptionSelect"]> = (
    _event,
    data,
  ) => {
    setSelectedSortOptions(
      data.selectedOptions.length > 0
        ? data.selectedOptions
        : [EXTENSION_SORT_OPTIONS[2]],
    );
  };

  return (
    <SiteFluentProvider className={styles.fluentProvider}>
      <main className={styles.page}>
        <ExtensionGalleryHeader />
        <ExtensionResultsToolbar
          selectedSortOptions={selectedSortOptions}
          onSortSelect={handleSortSelect}
        />
        <div className={styles.mobileFilterBar}>
          <Button
            className={styles.mobileFilters}
            appearance="outline"
            size="small"
            aria-controls="extension-filters"
            aria-expanded={mobileFiltersOpen}
            onClick={() => {
              setMobileFiltersOpen((open) => !open);
            }}
          >
            Filters
            {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Button>
        </div>
        <div className={styles.filterAndCard}>
          <div
            id="extension-filters"
            className={styles.filter}
            data-open={mobileFiltersOpen}
            data-testid="extension-filter-panel"
          >
            <ExtensionFilters
              activeTags={activeTags}
              location={extensionLocation}
              selectedTags={selectedTags}
              selectedAuthors={selectedAuthors}
            />
          </div>
          <div className={styles.card}>
            <ExtensionResults
              setActiveTags={setActiveTags}
              selectedTags={selectedTags}
              location={extensionLocation}
              selectedAuthors={selectedAuthors}
              selectedSortOptions={selectedSortOptions}
            />
          </div>
        </div>
      </main>
    </SiteFluentProvider>
  );
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useMemo, useEffect } from "react";
import type { TagType } from "../../../data/tags";
import {
  sortedExtensions as alphabeticalExtensions,
  unsortedExtensions,
} from "../../../data/extensions";
import ShowcaseExtensionCards from "./ShowcaseExtensionCards";
import { ExtensionResultsStatus } from "../ExtensionResultsToolbar";
import ShowcaseAppliedFilters from "../ShowcaseAppliedFilters";
import ShowcasePagination from "../ShowcasePagination";
import { useHistory } from "@docusaurus/router";
import type { Location } from "history";
import { filterExtensions } from "@site/src/utils/galleryFiltering";
import { getSortedExtensions } from "@site/src/utils/gallerySorting";
import { getExtensionTags } from "@site/src/utils/galleryTags";
import {
  captureGalleryNavigationState,
  restoreGalleryNavigationState,
  type GalleryNavigationState,
} from "@site/src/utils/galleryNavigation";
import {
  readSearchName,
  clearSearchFilters,
  replaceSearchName,
} from "@site/src/utils/galleryQuery";
import styles from "./styles.module.css";

const extensionPageSize = 20;

export default function ExtensionResults({
  setActiveTags,
  selectedTags,
  location,
  selectedAuthors,
  selectedSortOptions,
}: {
  setActiveTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  selectedTags: TagType[];
  location: Location & { state?: GalleryNavigationState | null; search: string };
  selectedAuthors: string[];
  selectedSortOptions: string[];
}) {
  const searchName = readSearchName(location.search);
  const [currentPage, setCurrentPage] = useState(1);
  const history = useHistory();

  const clearSearchAndFilters = () => {
    history.push({
      ...location,
      search: replaceSearchName(
        clearSearchFilters(location.search),
        null,
      ),
      state: captureGalleryNavigationState(),
    });
  };

  useEffect(() => {
    restoreGalleryNavigationState(location.state);
  }, [location, selectedSortOptions]);

  const orderedExtensions = useMemo(
    () =>
      getSortedExtensions(
        unsortedExtensions,
        alphabeticalExtensions,
        selectedSortOptions[0],
      ),
    [selectedSortOptions],
  );

  const matchingExtensions = useMemo(
    () =>
      filterExtensions(
        orderedExtensions,
        selectedTags,
        selectedAuthors,
        searchName,
      ),
    [orderedExtensions, selectedTags, selectedAuthors, searchName],
  );

  const totalExtensions = matchingExtensions.length;

  // Reset on navigation and sort selection, even when their values are unchanged.
  useEffect(() => {
    setCurrentPage(1);
  }, [location, selectedSortOptions]);

  const totalPages = Math.ceil(totalExtensions / extensionPageSize);
  const startIndex = (currentPage - 1) * extensionPageSize;
  const endIndex = startIndex + extensionPageSize;

  useEffect(() => {
    const unionTags = new Set<TagType>();
    matchingExtensions.forEach((extension) => {
      getExtensionTags(extension).forEach((tag) => unionTags.add(tag));
    });
    setActiveTags(Array.from(unionTags));
  }, [matchingExtensions, setActiveTags]);

  return (
    <>
      <ShowcaseAppliedFilters
        selectedTags={selectedTags}
        selectedAuthors={selectedAuthors}
        location={location}
      />
      <ShowcaseExtensionCards
        filteredExtensions={matchingExtensions.slice(startIndex, endIndex)}
        onClear={clearSearchAndFilters}
      />
      {totalPages > 1 && (
        <ShowcasePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      {totalExtensions > 0 ? (
        <div className={styles.resultsFooter}>
          <ExtensionResultsStatus
            totalItems={totalExtensions}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        </div>
      ) : (
        <div className={styles.visuallyHidden}>
          <ExtensionResultsStatus
            totalItems={totalExtensions}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        </div>
      )}
    </>
  );
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useMemo, useEffect } from "react";
import type { TagType } from "../../../data/tags";
import { sortedExtensions, unsortedExtensions } from "../../../data/extensions";
import ShowcaseExtensionCards from "./ShowcaseExtensionCards";
import { ShowcaseResultsStatus } from "../ShowcaseResultsToolbar";
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

export default function ShowcaseResults({
  setActiveTags,
  selectedTags,
  location,
  selectedAuthors,
  selectedOptions,
}: {
  setActiveTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  selectedTags: TagType[];
  location: Location & { state?: GalleryNavigationState | null; search: string };
  selectedAuthors: string[];
  selectedOptions: string[];
}) {
  const searchName = readSearchName(location.search);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const history = useHistory();

  const clearAll = () => {
    history.push({
      ...location,
      search: clearSearchFilters(location.search),
      state: captureGalleryNavigationState(),
    });
  };
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
  }, [location, selectedOptions]);

  const sortedItems = useMemo(
    () =>
      getSortedExtensions(
        unsortedExtensions,
        sortedExtensions,
        selectedOptions[0],
      ),
    [selectedOptions],
  );

  const activeItems = useMemo(
    () =>
      filterExtensions(
        sortedItems,
        selectedTags,
        selectedAuthors,
        searchName,
      ),
    [sortedItems, selectedTags, selectedAuthors, searchName],
  );

  const totalItems = activeItems.length;

  // Reset on navigation and sort selection, even when their values are unchanged.
  useEffect(() => {
    setCurrentPage(1);
  }, [location, selectedOptions]);

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  useEffect(() => {
    const unionTags = new Set<TagType>();
    activeItems.forEach((extension) => {
      getExtensionTags(extension).forEach((tag) => unionTags.add(tag));
    });
    setActiveTags(Array.from(unionTags));
  }, [activeItems, setActiveTags]);

  return (
    <>
      <ShowcaseAppliedFilters
        clearAll={clearAll}
        selectedTags={selectedTags}
        selectedAuthors={selectedAuthors}
        location={location}
      />
      <ShowcaseExtensionCards
        filteredExtensions={activeItems.slice(startIndex, endIndex)}
        onClear={clearSearchAndFilters}
      />
      {totalPages > 1 && (
        <ShowcasePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      {totalItems > 0 ? (
        <div className={styles.resultsFooter}>
          <ShowcaseResultsStatus
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        </div>
      ) : (
        <div className={styles.visuallyHidden}>
          <ShowcaseResultsStatus
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        </div>
      )}
    </>
  );
}

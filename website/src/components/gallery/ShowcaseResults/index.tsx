/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useMemo, useEffect } from "react";
import type { User, TagType } from "../../../data/tags";
import { sortedUsers, unsortedUsers } from "../../../data/users";
import { sortedExtensions, unsortedExtensions } from "../../../data/extensions";
import type { Extension } from "../../../data/extensionTypes";
import { Spinner } from "@fluentui/react-components";
import ShowcaseCards from "./ShowcaseCards";
import ShowcaseExtensionCards from "./ShowcaseExtensionCards";
import ShowcaseResultsToolbar from "../ShowcaseResultsToolbar";
import ShowcaseAppliedFilters from "../ShowcaseAppliedFilters";
import ShowcasePagination from "../ShowcasePagination";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";
import { useHistory } from "@docusaurus/router";
import type { Location } from "history";
import { getContentType } from "@site/src/utils/contentType";
import {
  filterTemplates,
  filterExtensions,
} from "@site/src/utils/galleryFiltering";
import {
  GALLERY_SORT_OPTIONS,
  getSortedTemplates,
  getSortedExtensions,
} from "@site/src/utils/gallerySorting";
import { getTemplateTags, getExtensionTags } from "@site/src/utils/galleryTags";
import {
  prepareUserState,
  restoreUserState,
  type UserState,
} from "@site/src/utils/galleryNavigation";
import { readSearchName, clearSearchFilters } from "@site/src/utils/galleryQuery";

type GalleryItems =
  | { type: "templates"; items: User[] }
  | { type: "extensions"; items: Extension[] };

export default function ShowcaseCardPage({
  setActiveTags,
  selectedTags,
  location,
  readSearchTags,
  replaceSearchTags,
  selectedAuthors,
  readSearchAuthors,
  replaceSearchAuthors,
}: {
  setActiveTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  selectedTags: TagType[];
  location: Location & { state?: UserState | null; search: string };
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
  selectedAuthors: string[];
  readSearchAuthors: (search: string) => string[];
  replaceSearchAuthors: (search: string, newAuthors: string[]) => string;
}) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([GALLERY_SORT_OPTIONS[2]]);
  const [loading, setLoading] = useState(true);
  const searchName = readSearchName(location.search);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const history = useHistory();

  // Content type is now derived from the URL pathname (`/extensions`) so the
  // two galleries live at distinct routes accessible via the navbar. The
  // legacy `?type=extensions` query param is still honored by getContentType
  // for backward compatibility with old shared links.
  const contentType = getContentType(location);

  const clearAll = () => {
    history.push({
      ...location,
      search: clearSearchFilters(location.search),
      state: prepareUserState(),
    });
  };

  useEffect(() => {
    restoreUserState(location.state);
    setLoading(false);
  }, [location, selectedOptions]);

  const { type: sortedType, items: sortedItems } = useMemo<GalleryItems>(
    () => {
      if (contentType === "extensions") {
        return {
          type: contentType,
          items: getSortedExtensions(unsortedExtensions, sortedExtensions, selectedOptions[0]),
        };
      }
      return {
        type: contentType,
        items: getSortedTemplates(unsortedUsers, sortedUsers, selectedOptions[0]),
      };
    },
    [contentType, selectedOptions]
  );

  const { type: activeType, items: activeItems } = useMemo<GalleryItems>(
    () => {
      if (sortedType === "extensions") {
        return {
          type: sortedType,
          items: filterExtensions(sortedItems, selectedTags, selectedAuthors, searchName),
        };
      }
      return {
        type: sortedType,
        items: filterTemplates(sortedItems, selectedTags, selectedAuthors, searchName),
      };
    },
    [sortedType, sortedItems, selectedTags, selectedAuthors, searchName]
  );

  const isExtensions = activeType === "extensions";
  const totalItems = activeItems ? activeItems.length : 0;

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
    if (activeType === "extensions") {
      activeItems.forEach((ext) => {
        getExtensionTags(ext).forEach((tag) => unionTags.add(tag));
      });
    } else {
      activeItems.forEach((user) => {
        getTemplateTags(user).forEach((tag) => unionTags.add(tag));
      });
    }
    setActiveTags(Array.from(unionTags));
  }, [activeItems, activeType]);

  const sortByOnSelect = (event, data) => {
    setLoading(true);
    setSelectedOptions(data.selectedOptions);
  };

  return (
    <>
      <ShowcaseResultsToolbar
        totalItems={totalItems}
        startIndex={startIndex}
        endIndex={endIndex}
        isExtensions={isExtensions}
        searchName={searchName}
        onSortSelect={sortByOnSelect}
      />
      <ShowcaseAppliedFilters
        clearAll={clearAll}
        selectedTags={selectedTags}
        selectedAuthors={selectedAuthors}
        readSearchTags={readSearchTags}
        replaceSearchTags={replaceSearchTags}
        readSearchAuthors={readSearchAuthors}
        replaceSearchAuthors={replaceSearchAuthors}
        location={location}
      />
      {loading ? (
        <Spinner labelPosition="below" label="Loading..." />
      ) : (
        <>
          {activeType === "extensions" ? (
            <ShowcaseExtensionCards
              filteredExtensions={activeItems.slice(startIndex, endIndex)}
              searchName={searchName}
            />
          ) : (
            <ShowcaseCards
              filteredUsers={activeItems.slice(startIndex, endIndex)}
              searchName={searchName}
            />
          )}
          {totalPages > 1 && (
            <ShowcasePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </>
  );
}

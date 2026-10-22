/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useMemo, useEffect } from "react";
import { Tags, type User, type TagType } from "../data/tags";
import { sortedUsers, unsortedUsers } from "../data/users";
import { sortedExtensions, unsortedExtensions } from "../data/extensions";
import {
  Text,
  Combobox,
  Option,
  Spinner,
  Badge,
  Body1,
  Button,
} from "@fluentui/react-components";
import ShowcaseCards from "./ShowcaseCards";
import ShowcaseExtensionCards from "./ShowcaseExtensionCards";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import { useColorMode } from "@docusaurus/theme-common";
import { useHistory } from "@docusaurus/router";
import type { Location } from "history";
import { toggleListItem, splitAuthors } from "@site/src/utils/jsUtils";
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
import { Dismiss20Filled } from "@fluentui/react-icons";

function FilterAppliedBar({
  clearAll,
  selectedTags,
  selectedAuthors,
  readSearchTags,
  replaceSearchTags,
  readSearchAuthors,
  replaceSearchAuthors,
  location,
}: {
  clearAll: () => void;
  selectedTags: TagType[];
  selectedAuthors: string[];
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
  readSearchAuthors: (search: string) => string[];
  replaceSearchAuthors: (search: string, newAuthors: string[]) => string;
  location: Location;
}) {
  const history = useHistory();
  const toggleTag = (tag: TagType, location: Location) => {
    const tags = readSearchTags(location.search);
    const newTags = toggleListItem(tags, tag);
    const newSearch = replaceSearchTags(location.search, newTags);
    history.push({
      ...location,
      search: newSearch,
      state: prepareUserState(),
    });
  }

  const toggleAuthor = (author: string, location: Location) => {
    const authors = readSearchAuthors(location.search);
    const newAuthors = toggleListItem(authors, author);
    const newSearch = replaceSearchAuthors(location.search, newAuthors);
    history.push({
      ...location,
      search: newSearch,
      state: prepareUserState(),
    });
  }

  return selectedTags && selectedTags.length > 0 || (selectedAuthors && selectedAuthors.length > 0) ? (
    <div className={styles.filterAppliedBar}>
      <Body1>
        Filters applied:
      </Body1>
      {selectedTags.map((tag, index) => {
        const tagObject = Tags[tag];
        const key = `showcase_checkbox_key_${tag}`;
        const id = `showcase_checkbox_id_${tag}`;

        return (
          <Badge
            key={key}
            appearance="tint"
            size="extra-large"
            color="brand"
            shape="rounded"
            icon={<Dismiss20Filled />}
            iconPosition="after"
            className={styles.filterBadge}
            role="button"
            tabIndex={0}
            onClick={() => {
              toggleTag(tag, location);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleTag(tag, location);
              }
            }}
            aria-label={`Remove ${tagObject.label} filter`}
          >
            {tagObject.label}
          </Badge>
        );
      })}
      {selectedAuthors.map((author, index) => {
        const key = `showcase_checkbox_author_key_${author}`;

        return (
          <Badge
            key={key}
            appearance="tint"
            size="extra-large"
            color="brand"
            shape="rounded"
            icon={<Dismiss20Filled />}
            iconPosition="after"
            className={styles.filterBadge}
            role="button"
            tabIndex={0}
            onClick={() => {
              toggleAuthor(author, location);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleAuthor(author, location);
              }
            }}
            aria-label={`Remove ${author} filter`}
          >
            {author}
          </Badge>
        );
      })}
      <button
        type="button"
        className={styles.clearAll}
        onClick={clearAll}
      >
        Clear all
      </button>
    </div>
  ) : null;
}

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    
    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  return (
    <div className={styles.pagination}>
      <Button
        appearance="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      
      {getVisiblePages().map((page, index) => {
        if (page === "...") {
          return (
            <Text
              key={`ellipsis-${index}`}
              size={400}
              className={styles.paginationEllipsis}
            >
              …
            </Text>
          );
        }
        
        return (
          <Button
            key={page}
            appearance={currentPage === page ? "primary" : "outline"}
            onClick={() => onPageChange(Number(page))}
            className={styles.pageButton}
          >
            {page}
          </Button>
        );
      })}
      
      <Button
        appearance="outline"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
}

export default function ShowcaseCardPage({
  setActiveTags,
  selectedTags,
  location,
  setSelectedTags,
  readSearchTags,
  replaceSearchTags,
  setSelectedCheckbox,
  setActiveAuthors,
  selectedAuthors,
  setSelectedAuthorCheckbox,
  setSelectedAuthors,
  readSearchAuthors,
  replaceSearchAuthors,
}: {
  setActiveTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  selectedTags: TagType[];
  location: Location & { state?: UserState | null; search: string };
  setSelectedTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  setActiveAuthors: React.Dispatch<React.SetStateAction<string[]>>;
  selectedAuthors: string[];
  setSelectedAuthorCheckbox: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedAuthors: React.Dispatch<React.SetStateAction<string[]>>;
  readSearchAuthors: (search: string) => string[];
  replaceSearchAuthors: (search: string, newAuthors: string[]) => string;
}) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([GALLERY_SORT_OPTIONS[2]]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const history = useHistory();

  // Content type is now derived from the URL pathname (`/extensions`) so the
  // two galleries live at distinct routes accessible via the navbar. The
  // legacy `?type=extensions` query param is still honored by getContentType
  // for backward compatibility with old shared links.
  const contentType = getContentType(location);

  const clearAll = () => {
    setSelectedTags([]);
    setSelectedCheckbox([]);
    setSelectedAuthors([]);
    setSelectedAuthorCheckbox([]);
    history.push({
      ...location,
      search: clearSearchFilters(location.search),
      state: prepareUserState(),
    });
  };

  useEffect(() => {
    setSelectedTags(readSearchTags(location.search));
    setSelectedUsers(
      getSortedTemplates(unsortedUsers, sortedUsers, selectedOptions[0])
    );
    setSearchName(readSearchName(location.search));
    restoreUserState(location.state);
    setLoading(false);
  }, [location, selectedOptions]);

  // Template filtering
  const cards = useMemo(
    () => filterTemplates(selectedUsers, selectedTags, selectedAuthors, searchName),
    [selectedUsers, selectedTags, selectedAuthors, searchName]
  );

  // Extension filtering
  const extensionCards = useMemo(
    () => filterExtensions(
      getSortedExtensions(unsortedExtensions, sortedExtensions, selectedOptions[0]),
      selectedTags,
      selectedAuthors,
      searchName
    ),
    [selectedTags, selectedAuthors, searchName, selectedOptions]
  );

  const isExtensions = contentType === "extensions";
  const activeItems = isExtensions ? extensionCards : cards;
  const totalItems = activeItems ? activeItems.length : 0;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTags, searchName, selectedUsers, contentType]);

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Paginated items
  const paginatedTemplates = cards.slice(startIndex, endIndex);
  const paginatedExtensions = extensionCards.slice(startIndex, endIndex);

  useEffect(() => {
    const unionTags = new Set<TagType>();
    if (isExtensions) {
      extensionCards.forEach((ext) => {
        getExtensionTags(ext).forEach((tag) => unionTags.add(tag));
      });
    } else {
      cards.forEach((user) => {
        getTemplateTags(user).forEach((tag) => unionTags.add(tag));
      });
    }
    setActiveTags(Array.from(unionTags));
  }, [cards, extensionCards, isExtensions]);

  useEffect(() => {
    if (isExtensions) {
      const unionAuthors = new Set<string>();
      extensionCards.forEach((ext) => unionAuthors.add(ext.author));
      setActiveAuthors(Array.from(unionAuthors));
    } else {
      const unionAuthors = new Set<string>();
      cards.forEach((user) => {
        const authors = splitAuthors(user.author);
        authors.forEach(author => unionAuthors.add(author));
      });
      setActiveAuthors(Array.from(unionAuthors));
    }
  }, [cards, extensionCards, isExtensions]);

  const sortByOnSelect = (event, data) => {
    setLoading(true);
    setSelectedOptions(data.selectedOptions);
  };

  // Count display logic
  const currentStart = totalItems > 0 ? startIndex + 1 : 0;
  const currentEnd = Math.min(endIndex, totalItems);
  const itemLabel = isExtensions ? "extension" : "template";
  const itemLabelPlural = isExtensions ? "extensions" : "templates";

  return (
    <>
      <div className={styles.viewingSortRow}>
        <div
          className={styles.viewingStatus}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <Text size={400}>Viewing</Text>
          {totalItems === 0 ? (
            <>
              <Text size={400} weight="bold">0</Text>
              <Text size={400}>{itemLabelPlural}</Text>
            </>
          ) : totalItems === 1 ? (
            <>
              <Text size={400} weight="bold">1</Text>
              <Text size={400}>{itemLabel}</Text>
            </>
          ) : (
            <>
              <Text size={400} weight="bold">
                {`${currentStart}-${currentEnd}`}
              </Text>
              <Text size={400}>of</Text>
              <Text size={400} weight="bold">
                {totalItems}
              </Text>
              <Text size={400}>{itemLabelPlural}</Text>
            </>
          )}
          {searchName != null ? (
            <>
              <Text size={400}>for</Text>
              <Text size={400} weight="bold">
                '{searchName}'
              </Text>
            </>
          ) : null}
        </div>
        <div className={styles.sortControls}>
          <Text size={400}>Sort by: </Text>
          <Combobox
            className={styles.sortCombobox}
            input={{ className: styles.sortInput }}
            defaultValue={GALLERY_SORT_OPTIONS[2]}
            defaultSelectedOptions={[GALLERY_SORT_OPTIONS[2]]}
            aria-label="Sort by"
            onOptionSelect={sortByOnSelect}
          >
            {GALLERY_SORT_OPTIONS.map((option) => (
              <Option key={option}>{option}</Option>
            ))}
          </Combobox>
        </div>
      </div>
      <FilterAppliedBar
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
          {isExtensions ? (
            <ShowcaseExtensionCards
              filteredExtensions={paginatedExtensions}
              searchName={searchName}
            />
          ) : (
            <ShowcaseCards
              filteredUsers={paginatedTemplates}
              searchName={searchName}
            />
          )}
          {totalPages > 1 && (
            <PaginationControls
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

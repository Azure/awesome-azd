/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  UserState,
  InputValue,
} from "../components/gallery/ShowcaseTemplateSearch";
import { Tags, type User, type TagType } from "../data/tags";
import { sortedUsers, unsortedUsers } from "../data/users";
import { type Extension } from "../data/extensionTypes";
import { sortedExtensions, unsortedExtensions } from "../data/extensions";
import {
  Text,
  Combobox,
  Option,
  Spinner,
  Badge,
  Body1,
  Button,
  ToggleButton,
} from "@fluentui/react-components";
import ShowcaseCards from "./ShowcaseCards";
import ShowcaseExtensionCards from "./ShowcaseExtensionCards";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import { useColorMode } from "@docusaurus/theme-common";
import { useHistory } from "@docusaurus/router";
import { toggleListItem, splitAuthors } from "@site/src/utils/jsUtils";
import { prepareUserState } from "./index";
import { Dismiss20Filled } from "@fluentui/react-icons";

const TagQueryStringKey2 = "tags";

const readSearchTags2 = (search: string): TagType[] => {
  return new URLSearchParams(search).getAll(TagQueryStringKey2) as TagType[];
}

function replaceSearchTags(search: string, newTags: TagType[]) {
  const searchParams = new URLSearchParams(search);
  searchParams.delete(TagQueryStringKey2);
  newTags.forEach((tag) => searchParams.append(TagQueryStringKey2, tag));
  return searchParams.toString();
}

// updates only the url query
const toggleTag = (tag: TagType, location: Location) => {
  const history = useHistory();
  return useCallback(() => {
    const tags = readSearchTags2(location.search);
    const newTags = toggleListItem(tags, tag);
    const newSearch = replaceSearchTags(location.search, newTags);
    history.push({
      ...location,
      search: newSearch,
      state: prepareUserState(),
    });
  }, [tag, location, history]);
}

function restoreUserState(userState: UserState | null) {
  const { scrollTopPosition, focusedElementId } = userState ?? {
    scrollTopPosition: 0,
    focusedElementId: undefined,
  };
  // @ts-expect-error: if focusedElementId is undefined it returns null
  document.getElementById(focusedElementId)?.focus();
  window.scrollTo({ top: scrollTopPosition });
}

const SORT_BY_OPTIONS = [
  "New to old",
  "Old to new",
  "Alphabetical (A - Z)",
  "Alphabetical (Z - A)",
];

function readSortChoice(rule: string): User[] {
  if (rule == SORT_BY_OPTIONS[0]) {
    const copyUnsortedUser = unsortedUsers.slice();
    return copyUnsortedUser.reverse();
  } else if (rule == SORT_BY_OPTIONS[1]) {
    return unsortedUsers;
  } else if (rule == SORT_BY_OPTIONS[2]) {
    return sortedUsers;
  } else if (rule == SORT_BY_OPTIONS[3]) {
    const copySortedUser = sortedUsers.slice();
    return copySortedUser.reverse();
  }
  return sortedUsers;
}

const SearchNameQueryKey = "name";

function readSearchName(search: string) {
  return new URLSearchParams(search).get(SearchNameQueryKey);
}

function filterUsers(
  users: User[],
  selectedTags: TagType[],
  selectedAuthors: string[],
  searchName: string | null
) {
  if (searchName) {
    // eslint-disable-next-line no-param-reassign
    users = users.filter((user) =>
      user.title.toLowerCase().includes(searchName.toLowerCase()) ||
      user.author.toLowerCase().includes(searchName.toLowerCase())
    );
  }
  
  // Filter by selected authors
  if (selectedAuthors && selectedAuthors.length > 0) {
    // eslint-disable-next-line no-param-reassign
    users = users.filter((user) => {
      // Split the author field to handle multiple authors
      const userAuthors = splitAuthors(user.author);
      // Check if any of the selected authors match any of the user's authors
      return selectedAuthors.some(selectedAuthor => 
        userAuthors.includes(selectedAuthor)
      );
    });
  }
  
  // Filter by selected tags
  if (!selectedTags || selectedTags.length === 0) {
    return users;
  }
  return users.filter((user) => {
    const tags = [
      ...(user.tags || []),
      ...(user.languages || []),
      ...(user.frameworks || []),
      ...(user.azureServices || []),
      ...(user.IaC || []),
    ];
    if (!user && !tags && tags.length === 0) {
      return false;
    }
    return selectedTags.every((tag) => tags.includes(tag));
  });
}

function filterExtensions(
  extensions: Extension[],
  selectedTags: TagType[],
  searchName: string | null
) {
  if (searchName) {
    const q = searchName.toLowerCase();
    extensions = extensions.filter((ext) =>
      ext.displayName.toLowerCase().includes(q) ||
      ext.description.toLowerCase().includes(q) ||
      ext.author.toLowerCase().includes(q) ||
      ext.namespace.toLowerCase().includes(q) ||
      ext.id.toLowerCase().includes(q) ||
      (ext.website && ext.website.toLowerCase().includes(q))
    );
  }

  if (!selectedTags || selectedTags.length === 0) {
    return extensions;
  }

  return extensions.filter((ext) => {
    const allTags = [...ext.tags];
    // Map capabilities to tag names
    ext.capabilities.forEach((cap) => {
      allTags.push(("ext-" + cap) as TagType);
    });
    return selectedTags.every((tag) => allTags.includes(tag));
  });
}

const ContentTypeQueryKey = "type";

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
  clearAll;
  selectedTags: TagType[];
  selectedAuthors: string[];
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
  readSearchAuthors: (search: string) => string[];
  replaceSearchAuthors: (search: string, newAuthors: string[]) => string;
  location;
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

  return selectedTags && selectedTags.length > 0 || selectedAuthors && selectedAuthors.length > 0 ? (
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
            onClick={() => {
              toggleTag(tag, location);
            }}
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
            onClick={() => {
              toggleAuthor(author, location);
            }}
          >
            {author}
          </Badge>
        );
      })}
      <div className={styles.clearAll} onClick={clearAll}>
        Clear all
      </div>
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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        margin: "24px 0",
      }}
    >
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
            <Text key={`ellipsis-${index}`} size={400} style={{ padding: "8px" }}>
              ...
            </Text>
          );
        }
        
        return (
          <Button
            key={page}
            appearance={currentPage === page ? "primary" : "outline"}
            onClick={() => onPageChange(Number(page))}
            style={{ minWidth: "40px" }}
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
  location;
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
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const history = useHistory();
  const searchParams = new URLSearchParams(location.search);

  // Content type toggle
  const contentType = searchParams.get(ContentTypeQueryKey) || "templates";
  const setContentType = (type: string) => {
    const newParams = new URLSearchParams(location.search);
    newParams.set(ContentTypeQueryKey, type);
    // Clear tag/author filters when switching content type
    newParams.delete("tags");
    newParams.delete("authors");
    setSelectedTags([]);
    setSelectedCheckbox([]);
    setSelectedAuthors([]);
    setSelectedAuthorCheckbox([]);
    history.push({
      ...location,
      search: newParams.toString(),
      state: prepareUserState(),
    });
  };

  const clearAll = () => {
    setSelectedTags([]);
    setSelectedCheckbox([]);
    setSelectedAuthors([]);
    setSelectedAuthorCheckbox([]);
    searchParams.delete("tags");
    searchParams.delete("authors");
    history.push({
      ...location,
      search: searchParams.toString(),
      state: prepareUserState(),
    });
  };

  useEffect(() => {
    setSelectedTags(readSearchTags(location.search));
    setSelectedUsers(readSortChoice(selectedOptions[0]));
    setSearchName(readSearchName(location.search));
    restoreUserState(location.state);
    setLoading(false);
  }, [location, selectedOptions]);

  // Template filtering
  const cards = useMemo(
    () => filterUsers(selectedUsers, selectedTags, selectedAuthors, searchName),
    [selectedUsers, selectedTags, selectedAuthors, searchName]
  );

  // Extension filtering
  const extensionCards = useMemo(
    () => filterExtensions(
      selectedOptions[0] === SORT_BY_OPTIONS[2] || selectedOptions[0] === SORT_BY_OPTIONS[3]
        ? (selectedOptions[0] === SORT_BY_OPTIONS[3] ? [...sortedExtensions].reverse() : sortedExtensions)
        : (selectedOptions[0] === SORT_BY_OPTIONS[0] ? [...unsortedExtensions].reverse() : unsortedExtensions),
      selectedTags,
      searchName
    ),
    [selectedTags, searchName, selectedOptions]
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
    if (isExtensions) {
      const unionTags = new Set<TagType>();
      extensionCards.forEach((ext) => {
        ext.tags.forEach((tag) => unionTags.add(tag));
        ext.capabilities.forEach((cap) => unionTags.add(("ext-" + cap) as TagType));
      });
      setActiveTags(Array.from(unionTags));
    } else {
      const unionTags = new Set<TagType>();
      cards.forEach((user) => {
        const tags = [
          ...(user.tags || []),
          ...(user.languages || []),
          ...(user.frameworks || []),
          ...(user.azureServices || []),
          ...(user.IaC || []),
        ];
        tags.forEach((tag) => unionTags.add(tag));
      });
      setActiveTags(Array.from(unionTags));
    }
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
      {/* Content Type Toggle */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "16px",
          alignItems: "center",
        }}
      >
        <ToggleButton
          appearance={!isExtensions ? "primary" : "outline"}
          size="medium"
          checked={!isExtensions}
          onClick={() => setContentType("templates")}
        >
          Templates
        </ToggleButton>
        <ToggleButton
          appearance={isExtensions ? "primary" : "outline"}
          size="medium"
          checked={isExtensions}
          onClick={() => setContentType("extensions")}
        >
          Extensions
        </ToggleButton>
        {isExtensions && (
          <Text size={300} style={{ marginLeft: "auto" }}>
            Built an extension?{" "}
            <a
              href="https://github.com/Azure/awesome-azd/issues/new?template=extension-submission.yml"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--ifm-color-purple-light)", textDecoration: "none" }}
            >
              Submit it here →
            </a>
          </Text>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "4px",
            flex: 1,
          }}
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
          {InputValue != null ? (
            <>
              <Text size={400}>for</Text>
              <Text size={400} weight="bold">
                '{InputValue}'
              </Text>
            </>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <Text size={400}>Sort by: </Text>
          <Combobox
            style={{ minWidth: "unset" }}
            input={{ style: { width: "130px" } }}
            defaultValue={SORT_BY_OPTIONS[2]}
            defaultSelectedOptions={[SORT_BY_OPTIONS[2]]}
            aria-label="Sort by"
            onOptionSelect={sortByOnSelect}
          >
            {SORT_BY_OPTIONS.map((option) => (
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
            <ShowcaseExtensionCards filteredExtensions={paginatedExtensions} />
          ) : (
            <ShowcaseCards filteredUsers={paginatedTemplates} />
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

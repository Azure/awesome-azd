/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect } from "react";
import Layout from "@theme/Layout";
import {
  teamsLightTheme,
  teamsDarkTheme,
  FluentProvider,
  Text,
  makeStyles,
  typographyStyles,
} from "@fluentui/react-components";
import { useColorMode } from "@docusaurus/theme-common";
import { useLocation, useHistory } from "@docusaurus/router";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { sortedExtensions, CapabilityList, type CapabilityType } from "@site/src/data/extensions";
import { type Extension } from "@site/src/data/tags";
import ExtensionCard from "@site/src/components/gallery/ExtensionCard";
import styles from "./gallery-styles.module.css";

const useStyles = makeStyles({
  title1: typographyStyles.title1,
  title2: typographyStyles.title2,
  subtitle1: typographyStyles.subtitle1,
});

const CapabilityQueryKey = "capabilities";
const AuthorQueryKey = "authors";
const SearchQueryKey = "search";

function readSearchParams(search: string) {
  const params = new URLSearchParams(search);
  return {
    capabilities: params.getAll(CapabilityQueryKey) as CapabilityType[],
    authors: params.getAll(AuthorQueryKey),
    searchText: params.get(SearchQueryKey) || "",
  };
}

function updateSearchParams(
  search: string,
  capabilities: CapabilityType[],
  authors: string[],
  searchText: string
) {
  const params = new URLSearchParams(search);
  params.delete(CapabilityQueryKey);
  params.delete(AuthorQueryKey);
  params.delete(SearchQueryKey);

  capabilities.forEach((cap) => params.append(CapabilityQueryKey, cap));
  authors.forEach((author) => params.append(AuthorQueryKey, author));
  if (searchText) params.set(SearchQueryKey, searchText);

  return params.toString();
}

function filterExtensions(
  extensions: Extension[],
  selectedCapabilities: CapabilityType[],
  selectedAuthors: string[],
  searchText: string
): Extension[] {
  let filtered = extensions;

  // Filter by capabilities
  if (selectedCapabilities.length > 0) {
    filtered = filtered.filter((ext) =>
      selectedCapabilities.some((cap) => ext.capabilities.includes(cap))
    );
  }

  // Filter by authors
  if (selectedAuthors.length > 0) {
    filtered = filtered.filter((ext) => selectedAuthors.includes(ext.author));
  }

  // Filter by search text
  if (searchText) {
    const lowerSearch = searchText.toLowerCase();
    filtered = filtered.filter(
      (ext) =>
        ext.title.toLowerCase().includes(lowerSearch) ||
        ext.description.toLowerCase().includes(lowerSearch) ||
        ext.namespace.toLowerCase().includes(lowerSearch) ||
        ext.id.toLowerCase().includes(lowerSearch)
    );
  }

  return filtered;
}

function getUniqueAuthors(extensions: Extension[]): string[] {
  const authors = new Set<string>();
  extensions.forEach((ext) => authors.add(ext.author));
  return Array.from(authors).sort();
}

function ExtensionFilters({
  selectedCapabilities,
  selectedAuthors,
  onCapabilityChange,
  onAuthorChange,
  availableAuthors,
}: {
  selectedCapabilities: CapabilityType[];
  selectedAuthors: string[];
  onCapabilityChange: (capabilities: CapabilityType[]) => void;
  onAuthorChange: (authors: string[]) => void;
  availableAuthors: string[];
}) {
  const style = useStyles();

  const toggleCapability = (capability: CapabilityType) => {
    if (selectedCapabilities.includes(capability)) {
      onCapabilityChange(selectedCapabilities.filter((c) => c !== capability));
    } else {
      onCapabilityChange([...selectedCapabilities, capability]);
    }
  };

  const toggleAuthor = (author: string) => {
    if (selectedAuthors.includes(author)) {
      onAuthorChange(selectedAuthors.filter((a) => a !== author));
    } else {
      onAuthorChange([...selectedAuthors, author]);
    }
  };

  const clearFilters = () => {
    onCapabilityChange([]);
    onAuthorChange([]);
  };

  const hasActiveFilters = selectedCapabilities.length > 0 || selectedAuthors.length > 0;

  return (
    <div className={styles.filters}>
      <div className={styles.filterHeader}>
        <Text className={style.title2}>Filters</Text>
        {hasActiveFilters && (
          <button className={styles.clearButton} onClick={clearFilters}>
            Clear All
          </button>
        )}
      </div>

      <div className={styles.filterSection}>
        <Text weight="semibold" className={styles.filterTitle}>
          Capabilities
        </Text>
        <div className={styles.filterOptions}>
          {CapabilityList.map((capability) => (
            <label key={capability} className={styles.filterOption}>
              <input
                type="checkbox"
                checked={selectedCapabilities.includes(capability)}
                onChange={() => toggleCapability(capability)}
                className={styles.checkbox}
              />
              <span className={styles.filterLabel}>
                {capability.replace(/-/g, " ")}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.filterSection}>
        <Text weight="semibold" className={styles.filterTitle}>
          Author
        </Text>
        <div className={styles.filterOptions}>
          {availableAuthors.map((author) => (
            <label key={author} className={styles.filterOption}>
              <input
                type="checkbox"
                checked={selectedAuthors.includes(author)}
                onChange={() => toggleAuthor(author)}
                className={styles.checkbox}
              />
              <span className={styles.filterLabel}>{author}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExtensionSearch({
  searchText,
  onSearchChange,
}: {
  searchText: string;
  onSearchChange: (text: string) => void;
}) {
  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="Search extensions by name, description, or namespace..."
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles.searchInput}
      />
    </div>
  );
}

function ExtensionGalleryContent() {
  const style = useStyles();
  const location = useLocation();
  const history = useHistory();
  const [loading, setLoading] = useState(true);

  const [selectedCapabilities, setSelectedCapabilities] = useState<CapabilityType[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");

  const availableAuthors = getUniqueAuthors(sortedExtensions);

  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      const params = readSearchParams(location.search);
      setSelectedCapabilities(params.capabilities);
      setSelectedAuthors(params.authors);
      setSearchText(params.searchText);
      setLoading(false);
    }
  }, [location.search]);

  const updateURL = (
    capabilities: CapabilityType[],
    authors: string[],
    search: string
  ) => {
    const newSearch = updateSearchParams(location.search, capabilities, authors, search);
    history.push({
      pathname: location.pathname,
      search: newSearch ? `?${newSearch}` : "",
    });
  };

  const handleCapabilityChange = (capabilities: CapabilityType[]) => {
    setSelectedCapabilities(capabilities);
    updateURL(capabilities, selectedAuthors, searchText);
  };

  const handleAuthorChange = (authors: string[]) => {
    setSelectedAuthors(authors);
    updateURL(selectedCapabilities, authors, searchText);
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    updateURL(selectedCapabilities, selectedAuthors, text);
  };

  const filteredExtensions = filterExtensions(
    sortedExtensions,
    selectedCapabilities,
    selectedAuthors,
    searchText
  );

  if (loading) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={style.title1}>Extension Gallery</h1>
        <p className={style.subtitle1}>
          Discover and install extensions to enhance your Azure Developer CLI experience
        </p>
      </div>

      <ExtensionSearch searchText={searchText} onSearchChange={handleSearchChange} />

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <ExtensionFilters
            selectedCapabilities={selectedCapabilities}
            selectedAuthors={selectedAuthors}
            onCapabilityChange={handleCapabilityChange}
            onAuthorChange={handleAuthorChange}
            availableAuthors={availableAuthors}
          />
        </aside>

        <main className={styles.main}>
          <div className={styles.resultsHeader}>
            <Text>
              Showing {filteredExtensions.length} of {sortedExtensions.length} extensions
            </Text>
          </div>

          {filteredExtensions.length === 0 ? (
            <div className={styles.emptyState}>
              <Text className={style.title2}>No extensions found</Text>
              <Text>Try adjusting your filters or search terms</Text>
            </div>
          ) : (
            <div className={styles.extensionGrid}>
              {filteredExtensions.map((extension) => (
                <ExtensionCard key={extension.id} extension={extension} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ExtensionGalleryApp() {
  const { colorMode } = useColorMode();

  return (
    <FluentProvider theme={colorMode === "dark" ? teamsDarkTheme : teamsLightTheme}>
      <ExtensionGalleryContent />
    </FluentProvider>
  );
}

export default function ExtensionGallery() {
  return (
    <Layout
      title="Extension Gallery"
      description="Browse and discover Azure Developer CLI extensions"
    >
      <ExtensionGalleryApp />
    </Layout>
  );
}

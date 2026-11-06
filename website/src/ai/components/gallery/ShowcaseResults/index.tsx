/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import { Dropdown, Option, Text } from "@fluentui/react-components";
import type { TagType } from "../../../data/tags";
import { availableTemplates } from "../../../data/templates";
import {
  collectActiveTags,
  filterTemplates,
  orderTemplatesBySearchMatches,
} from "../../../utils/galleryFiltering";
import {
  captureGalleryNavigationState,
  restoreGalleryNavigationState,
  type GalleryNavigationState,
} from "../../../utils/galleryNavigation";
import {
  clearSearchTags,
  readSearchName,
} from "../../../utils/galleryQuery";
import {
  defaultSortOption,
  sortGalleryTemplates,
  sortOptions,
  type SortOption,
} from "../../../utils/gallerySorting";
import {
  loadRepositoryMetrics,
  prioritizeRepositoryMetrics,
} from "../../../utils/repositoryMetadata";
import ShowcaseAppliedFilters from "../ShowcaseAppliedFilters";
import ShowcaseCards from "../ShowcaseCards";
import ShowcaseLearningResources from "../ShowcaseLearningResources";
import ShowcaseTemplateSearch from "../ShowcaseTemplateSearch";
import styles from "../styles.module.css";
import { useTemplateSearch } from "./useTemplateSearch";

const scoreRefreshDelayMs = 50;

function isSortOption(value: string | undefined): value is SortOption {
  return sortOptions.includes(value as SortOption);
}

export default function ShowcaseResults({
  setActiveTags,
  selectedTags,
  colorMode,
  searchSnapshot,
  queryReady,
}: {
  setActiveTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  selectedTags: TagType[];
  colorMode: string;
  searchSnapshot: string;
  queryReady: boolean;
}) {
  const history = useHistory();
  const location = useLocation<GalleryNavigationState>();
  const searchValue = readSearchName(searchSnapshot);
  const [searchRequestVersion, setSearchRequestVersion] = useState(0);
  const [sortOption, setSortOption] = useState<SortOption | null>(null);
  const [repositoryScoresVersion, setRepositoryScoresVersion] =
    useState(0);

  const { matchingSources, isPending: searchPending } = useTemplateSearch(
    searchValue,
    availableTemplates,
    searchRequestVersion,
  );
  const filteredTemplates = useMemo(
    () =>
      filterTemplates(availableTemplates, selectedTags, matchingSources),
    [matchingSources, selectedTags],
  );
  const effectiveSortOption =
    sortOption ?? (searchValue ? null : defaultSortOption);

  useEffect(() => {
    if (!queryReady) {
      return;
    }
    prioritizeRepositoryMetrics(
      filteredTemplates.map((template) => template.source),
    );
  }, [filteredTemplates, queryReady]);

  useEffect(() => {
    if (!queryReady || effectiveSortOption !== defaultSortOption) {
      return undefined;
    }

    let active = true;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const refreshScores = () => {
      if (!active || refreshTimer !== undefined) {
        return;
      }

      refreshTimer = setTimeout(() => {
        refreshTimer = undefined;
        if (active) {
          setRepositoryScoresVersion((version) => version + 1);
        }
      }, scoreRefreshDelayMs);
    };
    const requests = filteredTemplates.map((template) =>
      loadRepositoryMetrics(template.source).then((metrics) => {
        if (metrics.score !== undefined) {
          refreshScores();
        }
        return metrics;
      }),
    );
    void Promise.allSettled(requests);

    return () => {
      active = false;
      if (refreshTimer !== undefined) {
        clearTimeout(refreshTimer);
      }
    };
  }, [effectiveSortOption, filteredTemplates, queryReady]);

  const templates = useMemo(
    () =>
      effectiveSortOption === null && matchingSources !== null
        ? orderTemplatesBySearchMatches(
            filteredTemplates,
            matchingSources,
          )
        : sortGalleryTemplates(
            filteredTemplates,
            effectiveSortOption ?? defaultSortOption,
          ),
    [
      effectiveSortOption,
      filteredTemplates,
      matchingSources,
      repositoryScoresVersion,
    ],
  );

  useEffect(() => {
    restoreGalleryNavigationState(location.state);
  }, [location]);

  useEffect(() => {
    setActiveTags(collectActiveTags(templates));
  }, [setActiveTags, templates]);

  const clearAll = () => {
    history.push({
      ...location,
      search: clearSearchTags(location.search),
      state: captureGalleryNavigationState(),
    });
  };

  return (
    <>
      <div>
        <div className={styles.searchAndSortBarSection}>
          <ShowcaseTemplateSearch
            searchValue={searchValue}
            onSearchSubmit={(submittedValue) => {
              if (submittedValue && submittedValue === searchValue) {
                setSearchRequestVersion((version) => version + 1);
              }
            }}
          />
          <Dropdown
            className={styles.sortBar}
            aria-label="Sort Options"
            id="dropdown-default"
            appearance="outline"
            size="large"
            placeholder={defaultSortOption}
            onOptionSelect={(_event, data) => {
              if (isSortOption(data.optionValue)) {
                setSortOption(data.optionValue);
              }
            }}
          >
            {sortOptions.map((option) => (
              <Option key={option} value={option}>
                {option}
              </Option>
            ))}
          </Dropdown>
        </div>
        <div
          className={styles.templateResultsNumber}
          aria-live="polite"
          data-testid="template-results-count"
        >
          {searchPending && templates.length === 0 ? (
            <Text size={400}>Searching templates...</Text>
          ) : (
            <>
              <Text size={400}>Showing</Text>
              <Text size={400} weight="bold">
                {templates.length}
              </Text>
              <Text size={400}>
                {templates.length === 1 ? "template" : "templates"}
              </Text>
              {searchValue ? (
                <>
                  <Text size={400}>for</Text>
                  <Text size={400} weight="bold">
                    '{searchValue}'
                  </Text>
                </>
              ) : null}
            </>
          )}
        </div>
      </div>
      <ShowcaseAppliedFilters
        selectedTags={selectedTags}
        onClearAll={clearAll}
      />
      <ShowcaseCards
        templates={templates}
        coverPage={false}
        searchValue={searchValue}
        searchPending={searchPending}
        loadMetadata={queryReady}
      />
      <ShowcaseLearningResources colorMode={colorMode} />
    </>
  );
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import { useHistory, useLocation } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useIsBrowser from "@docusaurus/useIsBrowser";
import Layout from "@theme/Layout";
import {
  Button,
  Dropdown,
  Label,
  Option,
  SearchBox,
} from "@fluentui/react-components";
import type { CatalogListingTemplate } from "../../../catalog/catalogTypes";
import {
  catalogFacets,
  clearCatalogState,
  getFacetLabel,
  parseCatalogState,
  queryCatalog,
  serializeCatalogState,
  sortCatalogTemplates,
  type CatalogFacetKey,
  type CatalogSort,
  type CatalogState,
} from "../../../catalog/catalogQuery";
import {
  captureGalleryNavigationState,
  createTemplateDetailNavigationState,
  restoreGalleryNavigationState,
  type GalleryNavigationState,
} from "../../../utils/galleryNavigation";
import { serializeStructuredData } from "../../../utils/structuredData";
import controlStyles from "../../GalleryControls/styles.module.css";
import SiteFluentProvider from "../../SiteFluentProvider";
import FacetSection from "./FacetSection";
import TemplateCard from "./TemplateCard";
import styles from "./styles.module.css";

const itemsPerPage = 20;
const canonicalUrl = "https://azure.github.io/awesome-azd/templates";
const catalogJsonUrl = "https://aka.ms/awesome-azd/templates.json";
const catalogTitle = "Templates | Azure Developer CLI";
const catalogDescription =
  "Discover, understand, and start with an Azure Developer CLI template.";
const catalogStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Azure Developer CLI templates",
  description: catalogDescription,
  url: canonicalUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${canonicalUrl}?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};
const catalogSortOptions: ReadonlyArray<{
  value: CatalogSort;
  label: string;
}> = [
  { value: "recommended", label: "Most popular" },
  { value: "newest", label: "Latest" },
];
const catalogSortLabels: Record<CatalogSort, string> = {
  recommended: "Most popular",
  newest: "Latest",
  oldest: "Old to New",
  az: "Alphabetical (A - Z)",
  za: "Alphabetical (Z - A)",
};

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis-left" | "ellipsis-right"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-right", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis-left",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [
    1,
    "ellipsis-left",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-right",
    totalPages,
  ];
}

export default function CatalogPage({
  templates,
}: {
  templates: readonly CatalogListingTemplate[];
}): React.JSX.Element {
  const catalogTemplates = templates;
  const history = useHistory();
  const location = useLocation();
  const isBrowser = useIsBrowser();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const hydrationSafeSearch = isBrowser ? location.search : "";
  const state = useMemo(
    () => parseCatalogState(hydrationSafeSearch, catalogTemplates),
    [hydrationSafeSearch],
  );
  const [searchValue, setSearchValue] = useState(state.q);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const startWithCodeUrl = useBaseUrl("/templates/start-with-code");
  const llmsUrl = useBaseUrl("/llms.txt");
  const sourceOrder = useMemo(
    () =>
      new Map(
        catalogTemplates.map((template, index) => [
          template.id,
          index,
        ]),
      ),
    [catalogTemplates],
  );

  const pushState = useCallback(
    (nextState: CatalogState) => {
      const query = serializeCatalogState(nextState);
      const navigationState = captureGalleryNavigationState();
      history.replace({
        ...location,
        state: navigationState,
      });
      history.push({
        pathname: location.pathname,
        search: query ? `?${query}` : "",
        hash: location.hash,
        state: navigationState,
      });
    },
    [history, location],
  );

  const navigateToDetail = useCallback((detailUrl: string) => {
    const navigationState = captureGalleryNavigationState();
    history.replace({
      ...location,
      state: navigationState,
    });
    history.push({
      pathname: detailUrl,
      state: createTemplateDetailNavigationState(
        {
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
        },
        navigationState,
      ),
    });
  }, [history, location]);

  const submitSearch = useCallback(() => {
    const query = (
      searchInputRef.current?.value ?? searchValue
    ).trim();
    setSearchValue(query);
    if (query === state.q) {
      return;
    }
    pushState({
      ...state,
      q: query,
      page: 1,
      unavailable: [],
    });
  }, [pushState, searchValue, state]);

  const clearAll = useCallback(() => {
    setSearchValue("");
    pushState(clearCatalogState());
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }, [pushState]);

  const changeFacet = useCallback(
    (key: CatalogFacetKey, value: string, checked: boolean) => {
      const values = state[key];
      pushState({
        ...state,
        [key]: checked
          ? [...new Set([...values, value])]
          : values.filter((candidate) => candidate !== value),
        page: 1,
        unavailable: [],
      });
    },
    [pushState, state],
  );

  useEffect(() => {
    setSearchValue(state.q);
  }, [state.q]);

  useEffect(() => {
    if (!isBrowser) {
      return undefined;
    }
    const frame = window.requestAnimationFrame(() => {
      restoreGalleryNavigationState(
        location.state as GalleryNavigationState | null | undefined,
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isBrowser, location.key]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isEditable =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLSelectElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement instanceof HTMLElement &&
          activeElement.isContentEditable);

      if (
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !isEditable
      ) {
        event.preventDefault();
        event.stopPropagation();
        searchInputRef.current?.focus();
      }
      if (
        event.key === "Escape" &&
        activeElement === searchInputRef.current &&
        (searchValue || state.q)
      ) {
        event.preventDefault();
        event.stopPropagation();
        setSearchValue("");
        if (state.q) {
          pushState({
            ...state,
            q: "",
            page: 1,
            unavailable: [],
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [pushState, searchValue, state]);

  const queryResult = useMemo(
    () => queryCatalog(catalogTemplates, state),
    [catalogTemplates, state],
  );
  const sortedTemplates = useMemo(
    () =>
      sortCatalogTemplates(
        queryResult.templates,
        state,
        sourceOrder,
      ),
    [queryResult.templates, sourceOrder, state],
  );
  const totalItems = sortedTemplates.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const safeCurrentPage = Math.min(
    state.page,
    Math.max(totalPages, 1),
  );
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const visibleTemplates = sortedTemplates.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const activeFilterCount = catalogFacets.reduce(
    (count, facet) => count + state[facet.key].length,
    0,
  );
  const listingQuery = serializeCatalogState(state);
  const startUrl = `${startWithCodeUrl}${
    listingQuery ? `?${listingQuery}` : ""
  }`;
  const selectedSortLabel = catalogSortLabels[state.sort];
  const liveStatus =
    totalItems === 0
      ? "0 templates"
      : `${startIndex + 1}-${endIndex} of ${totalItems} templates${
          state.q ? ` for "${state.q}"` : ""
        }`;

  const changePage = (page: number) => {
    pushState({
      ...state,
      page,
      unavailable: [],
    });
    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <>
      <Head>
        <title>{catalogTitle}</title>
        <link rel="canonical" href={canonicalUrl} />
        <link rel="describedby" href={llmsUrl} />
        <link
          rel="alternate"
          type="application/json"
          href={catalogJsonUrl}
          title="Azure Developer CLI template catalog"
        />
        <meta name="description" content={catalogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Awesome azd" />
        <meta property="og:title" content={catalogTitle} />
        <meta property="og:description" content={catalogDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={catalogTitle} />
        <meta name="twitter:description" content={catalogDescription} />
        <script type="application/ld+json">
          {serializeStructuredData(catalogStructuredData)}
        </script>
      </Head>
      <Layout>
        <SiteFluentProvider className={styles.fluentProvider}>
          <main className={styles.page}>
            <div className={styles.wrap}>
              <section className={styles.hero}>
                <div className={styles.heroIntro}>
                  <h1>
                    Your next app. <span>Ready to build.</span>
                  </h1>
                  <p>
                    Explore application and infrastructure templates to build
                    and deploy on Azure.
                  </p>
                </div>
                <div className={styles.heroAction}>
                  <p>Have your own code, or starting from scratch?</p>
                  <Link className={styles.outlineButton} to={startUrl}>
                    Start with my own code
                  </Link>
                </div>
              </section>

              <div className={styles.discovery}>
                <form
                  className={styles.searchGroup}
                  role="search"
                  onSubmit={(event) => {
                    event.preventDefault();
                    submitSearch();
                  }}
                >
                  <SearchBox
                    ref={searchInputRef}
                    id="catalog-search"
                    className={controlStyles.search}
                    appearance="outline"
                    size="medium"
                    aria-label="Search templates"
                    value={searchValue}
                    placeholder="Search templates by name, service, language, or framework"
                    autoComplete="off"
                    dismiss={
                      searchValue
                        ? { "aria-label": "Clear search" }
                        : null
                    }
                    onChange={(_event, data) => {
                      setSearchValue(data.value);
                      if (!data.value && state.q) {
                        pushState({
                          ...state,
                          q: "",
                          page: 1,
                          unavailable: [],
                        });
                      }
                    }}
                  />
                </form>
                <div className={styles.sortGroup}>
                  <Label
                    className={controlStyles.sortLabel}
                    htmlFor="catalog-sort"
                    size="small"
                    weight="semibold"
                  >
                    Sort by
                  </Label>
                  <Dropdown
                    id="catalog-sort"
                    className={controlStyles.sortControl}
                    appearance="outline"
                    size="medium"
                    clearable={false}
                    clearButton={null}
                    aria-label="Sort by"
                    value={selectedSortLabel}
                    selectedOptions={[state.sort]}
                    title="Most popular orders templates by GitHub stars, highest first. Templates without star data appear last. Latest follows the catalog's newest-first order."
                    onOptionSelect={(_event, data) => {
                      const sort =
                        catalogSortOptions.find(
                          (option) =>
                            option.value === data.optionValue,
                        )?.value ?? "recommended";
                      pushState({
                        ...state,
                        sort,
                        page: 1,
                        unavailable: [],
                      });
                    }}
                  >
                    {catalogSortOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Dropdown>
                </div>
                {state.unavailable.length > 0 ? (
                  <p className={styles.warning}>
                    These saved criteria are unavailable and were not applied:{" "}
                    {state.unavailable.join("; ")}.
                  </p>
                ) : null}
              </div>

              <div
                className={styles.visuallyHidden}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                data-testid="template-results-count"
              >
                {liveStatus}
              </div>
              <Button
                className={styles.mobileFilters}
                appearance="outline"
                size="small"
                aria-controls="catalog-filters"
                aria-expanded={mobileFiltersOpen}
                onClick={() => {
                  setMobileFiltersOpen((open) => !open);
                }}
              >
                Filters
                {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </Button>

              <div className={styles.catalogLayout}>
                <aside
                  id="catalog-filters"
                  className={styles.filterPanel}
                  data-open={mobileFiltersOpen}
                  aria-label="Template filters"
                >
                  <div className={styles.filterHeading}>
                    <h2>Filter templates</h2>
                    <Button
                      appearance="transparent"
                      size="small"
                      onClick={clearAll}
                    >
                      Clear all
                    </Button>
                  </div>
                  {catalogFacets
                    .filter((facet) => !facet.hidden)
                    .map((facet) => (
                      <FacetSection
                        key={facet.key}
                        facet={facet}
                        records={catalogTemplates}
                        state={state}
                        valueCounts={
                          queryResult.facetCounts.get(facet.key) ??
                          new Map()
                        }
                        onChange={changeFacet}
                      />
                    ))}
                </aside>

                <section
                  ref={resultsRef}
                  className={styles.results}
                  aria-label="Template results"
                >
                  <div
                    className={styles.activeFilters}
                    role="group"
                    aria-label="Applied filters"
                  >
                    {state.q ? (
                      <Button
                        appearance="outline"
                        size="small"
                        shape="circular"
                        onClick={() => {
                          setSearchValue("");
                          pushState({
                            ...state,
                            q: "",
                            page: 1,
                            unavailable: [],
                          });
                        }}
                      >
                        Search: {state.q} <span aria-hidden="true">×</span>
                      </Button>
                    ) : null}
                    {catalogFacets.flatMap((facet) =>
                      state[facet.key].map((value) => (
                        <Button
                          key={`${facet.key}-${value}`}
                          appearance="outline"
                          size="small"
                          shape="circular"
                          onClick={() => {
                            pushState({
                              ...state,
                              [facet.key]: state[facet.key].filter(
                                (candidate) => candidate !== value,
                              ),
                              page: 1,
                              unavailable: [],
                            });
                          }}
                        >
                          {getFacetLabel(facet, value)}{" "}
                          <span aria-hidden="true">×</span>
                        </Button>
                      )),
                    )}
                  </div>

                  {visibleTemplates.length > 0 ? (
                    <div
                      className={styles.templateGrid}
                      data-testid="template-results"
                    >
                      {visibleTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onNavigate={navigateToDetail}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className={styles.empty}>
                      <h2>No matching templates</h2>
                      <p>
                        Try different keywords or filters. You can also start
                        from scratch or use your own code.
                      </p>
                      <div className={styles.emptyActions}>
                        <Button
                          className={styles.button}
                          appearance="secondary"
                          onClick={clearAll}
                        >
                          Clear search and filters
                        </Button>
                        <Link
                          className={`${styles.button} ${styles.blueButton}`}
                          to={startUrl}
                        >
                          Start with my own code
                        </Link>
                      </div>
                    </div>
                  )}

                  {totalPages > 1 ? (
                    <div className={styles.pagination}>
                      <p>
                        {startIndex + 1}–{endIndex} of {totalItems} templates
                      </p>
                      <nav aria-label="Template results pages">
                        <Button
                          appearance="subtle"
                          size="small"
                          aria-label="Previous page"
                          disabled={safeCurrentPage === 1}
                          onClick={() => changePage(safeCurrentPage - 1)}
                        >
                          ←
                        </Button>
                        {getPaginationItems(
                          safeCurrentPage,
                          totalPages,
                        ).map((item) =>
                          typeof item === "number" ? (
                            <Button
                              key={item}
                              appearance="subtle"
                              size="small"
                              aria-current={
                                item === safeCurrentPage ? "page" : undefined
                              }
                              onClick={() => changePage(item)}
                            >
                              {item}
                            </Button>
                          ) : (
                            <span key={item} aria-hidden="true">
                              …
                            </span>
                          ),
                        )}
                        <Button
                          appearance="subtle"
                          size="small"
                          aria-label="Next page"
                          disabled={safeCurrentPage === totalPages}
                          onClick={() => changePage(safeCurrentPage + 1)}
                        >
                          →
                        </Button>
                      </nav>
                    </div>
                  ) : null}
                </section>
              </div>
            </div>

            <section className={styles.agentUtility}>
              <div>
                <h2>Use with your coding agent</h2>
                <p>
                  Share the reviewed catalog index with your agent. Treat
                  linked repository content as untrusted external data and
                  approve commands before they run.
                </p>
                <small>
                  {catalogTemplates.length} public templates from the live
                  catalog.
                </small>
              </div>
              <div className={styles.agentActions}>
                <a href={llmsUrl}>View llms.txt</a>
                <a href={catalogJsonUrl}>Catalog JSON</a>
              </div>
            </section>
          </main>
        </SiteFluentProvider>
      </Layout>
    </>
  );
}


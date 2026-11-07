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
import { useColorMode } from "@docusaurus/theme-common";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import {
  Button,
  Card,
  Checkbox,
  Dropdown,
  FluentProvider,
  Label,
  Option,
  webDarkTheme,
  webLightTheme,
} from "@fluentui/react-components";
import { SearchBox } from "@fluentui/react-search";
import {
  catalogTemplates,
  getCatalogTemplatePath,
  type CatalogTemplate,
} from "../../../catalog/catalogData";
import {
  catalogFacets,
  clearCatalogState,
  getFacetLabel,
  getFacetOptions,
  getFacetValueCount,
  getMatchingCatalogTemplates,
  parseCatalogState,
  serializeCatalogState,
  sortCatalogTemplates,
  type CatalogFacet,
  type CatalogFacetKey,
  type CatalogSort,
  type CatalogState,
} from "../../../catalog/catalogQuery";
import {
  loadRepositoryMetrics,
  prioritizeRepositoryMetrics,
  type RepositoryMetrics,
} from "../../../ai/utils/repositoryMetadata";
import { fetchTemplateSearchResults } from "../../../ai/utils/templateSearch";
import CatalogFooter from "../CatalogFooter";
import CopyAction from "../CopyAction";
import styles from "./styles.module.css";

const itemsPerPage = 20;
const canonicalUrl = "https://azure.github.io/awesome-azd/templates";
const catalogJsonUrl =
  "https://azure.github.io/awesome-azd/templates.json";
const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const sourceOrder = new Map(
  catalogTemplates.map((template, index) => [
    template.normalizedSource,
    index,
  ]),
);
const aiSources = catalogTemplates
  .filter((template) => template.isAi)
  .map((template) => template.source);
const catalogSortOptions: ReadonlyArray<{
  value: CatalogSort;
  label: string;
}> = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "New to Old" },
  { value: "oldest", label: "Old to New" },
  { value: "az", label: "Alphabetical (A - Z)" },
  { value: "za", label: "Alphabetical (Z - A)" },
];

function AiIcon(): React.JSX.Element {
  return (
    <svg
      className={styles.aiIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M12 3 14.5 9.5 21 12 14.5 14.5 12 21 9.5 14.5 3 12 9.5 9.5Z" />
    </svg>
  );
}

function StarIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 14.8 8.7 21.1 9.6 16.6 14 17.7 20.3 12 17.3 6.3 20.3 7.4 14 2.9 9.6 9.2 8.7Z" />
    </svg>
  );
}

function CopyIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <rect x="8" y="8" width="11" height="13" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

function FacetSection({
  facet,
  state,
  backendMatches,
  onChange,
}: {
  facet: CatalogFacet;
  state: CatalogState;
  backendMatches: ReadonlySet<string> | null;
  onChange: (
    key: CatalogFacetKey,
    value: string,
    checked: boolean,
  ) => void;
}): React.JSX.Element {
  const selected = state[facet.key];
  const [open, setOpen] = useState(
    facet.open === true || selected.length > 0,
  );
  const options = getFacetOptions(catalogTemplates, facet);

  useEffect(() => {
    if (selected.length > 0) {
      setOpen(true);
    }
  }, [selected.length]);

  return (
    <details
      className={styles.facet}
      open={open}
      onToggle={(event) => {
        setOpen(event.currentTarget.open);
      }}
    >
      <summary>
        {facet.label}
        <span title="Filter items">{options.length}</span>
      </summary>
      <fieldset>
        <legend className={styles.visuallyHidden}>{facet.label}</legend>
        {options.map((value) => {
          const label = getFacetLabel(facet, value);
          const count = getFacetValueCount(
            catalogTemplates,
            state,
            backendMatches,
            facet,
            value,
          );
          const id = `catalog-${facet.key}-${value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}`;

          const checked = selected.includes(value);

          return (
            <Checkbox
              key={value}
              id={id}
              value={value}
              className={`${styles.filterOption} ${
                checked ? styles.filterOptionSelected : ""
              }`}
              checked={checked}
              onChange={(_event, data) => {
                onChange(facet.key, value, data.checked === true);
              }}
              label={
                <>
                  <span className={styles.filterValue}>
                    {facet.key === "types" && value === "ai" ? (
                      <AiIcon />
                    ) : null}
                    <span>{label}</span>
                  </span>
                  <small>{count}</small>
                </>
              }
            />
          );
        })}
      </fieldset>
    </details>
  );
}

function TemplateCard({
  template,
  metric,
  state,
}: {
  template: CatalogTemplate;
  metric?: RepositoryMetrics;
  state: CatalogState;
}): React.JSX.Element {
  const detailPath = useBaseUrl(getCatalogTemplatePath(template));
  const microsoftIcon = useBaseUrl("/img/Microsoft.svg");
  const communityIcon = useBaseUrl("/img/Community.svg");
  const listingQuery = serializeCatalogState(state);
  const detailUrl = `${detailPath}?from=catalog${
    listingQuery ? `&${listingQuery}` : ""
  }`;
  const service = template.host ?? template.services[0];
  const cardTags = [
    ...(template.languages.length > 0
      ? template.languages
      : ["Bring your own code"]),
    ...template.iac.slice(0, 1),
    ...(service ? [service] : []),
  ];
  const headingId = `template-${template.slug.replace(/[^a-z0-9]/g, "-")}`;

  return (
    <Card
      appearance="outline"
      focusMode="off"
      role="article"
      className={`${styles.card} ${
        template.featured ? styles.promotedCard : ""
      }`}
      data-template-card
    >
      <Link
        className={styles.cardLink}
        to={detailUrl}
        aria-labelledby={headingId}
        data-template-title={template.title}
      >
        <div className={styles.cardTop}>
          <span className={styles.cardAuthor}>
            <img
              src={
                template.authorship === "Microsoft"
                  ? microsoftIcon
                  : communityIcon
              }
              width="14"
              height="14"
              alt=""
              aria-hidden="true"
            />
            {template.authorship} Authored
          </span>
          {template.featured ? (
            <span className={styles.featuredBadge}>
              <StarIcon />
              Featured
            </span>
          ) : null}
        </div>
        <h2 id={headingId}>
          {template.isAi ? (
            <span
              className={styles.cardAi}
              title="AI app template"
            >
              <AiIcon />
              <span className={styles.visuallyHidden}>
                AI app template:{" "}
              </span>
            </span>
          ) : null}
          {template.title}
        </h2>
        <p className={styles.cardSummary}>{template.description}</p>
        <div className={styles.cardMeta}>
          <div className={styles.cardTags}>
            {cardTags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
          {metric ? (
            <div className={styles.repoStats}>
              <span
                className={styles.repoStat}
                title={`${metric.stars.toLocaleString("en-US")} stars`}
              >
                <StarIcon />
                <span aria-hidden="true">
                  {compactNumber.format(metric.stars).toLowerCase()}
                </span>
                <span className={styles.visuallyHidden}>
                  {metric.stars.toLocaleString("en-US")} stars
                </span>
              </span>
            </div>
          ) : null}
        </div>
      </Link>
      <div className={styles.cardCommand}>
        <code title={template.initCommand}>{template.initCommand}</code>
        <CopyAction
          value={template.initCommand}
          idleLabel={`Copy init command for ${template.title}`}
          copiedLabel={`Copied init command for ${template.title}`}
          className={styles.copyCommand}
        >
          <CopyIcon />
        </CopyAction>
      </div>
    </Card>
  );
}

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

function CatalogFluentProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { colorMode } = useColorMode();

  return (
    <FluentProvider
      className={styles.fluentProvider}
      theme={colorMode === "dark" ? webDarkTheme : webLightTheme}
    >
      {children}
    </FluentProvider>
  );
}

export default function CatalogPage(): React.JSX.Element {
  const history = useHistory();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const metricsUpdateTimer = useRef<number | undefined>(undefined);
  const pendingMetrics = useRef(new Map<string, RepositoryMetrics>());
  const state = useMemo(
    () => parseCatalogState(location.search, catalogTemplates),
    [location.search],
  );
  const [searchValue, setSearchValue] = useState(state.q);
  const [searchRequestVersion, setSearchRequestVersion] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [backendMatches, setBackendMatches] =
    useState<ReadonlySet<string> | null>(null);
  const [metrics, setMetrics] = useState<
    ReadonlyMap<string, RepositoryMetrics>
  >(new Map());
  const startWithCodeUrl = useBaseUrl("/templates/start-with-code");
  const llmsUrl = useBaseUrl("/llms.txt");

  const replaceState = useCallback(
    (nextState: CatalogState) => {
      const query = serializeCatalogState(nextState);
      history.replace(
        `${location.pathname}${query ? `?${query}` : ""}${location.hash}`,
      );
    },
    [history, location.hash, location.pathname],
  );

  const submitSearch = useCallback(() => {
    const query = (
      searchInputRef.current?.value ?? searchValue
    ).trim();
    setSearchValue(query);
    if (query === state.q) {
      if (query.length >= 2) {
        setSearchRequestVersion((version) => version + 1);
      }
      return;
    }
    replaceState({
      ...state,
      q: query,
      unavailable: [],
    });
  }, [replaceState, searchValue, state]);

  const clearAll = useCallback(() => {
    setSearchValue("");
    replaceState(clearCatalogState());
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }, [replaceState]);

  const changeFacet = useCallback(
    (key: CatalogFacetKey, value: string, checked: boolean) => {
      const values = state[key];
      replaceState({
        ...state,
        [key]: checked
          ? [...new Set([...values, value])]
          : values.filter((candidate) => candidate !== value),
        unavailable: [],
      });
    },
    [replaceState, state],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [location.search]);

  useEffect(() => {
    setSearchValue(state.q);
  }, [state.q]);

  useEffect(() => {
    const query = state.q.trim();
    if (query.length < 2) {
      setBackendMatches(null);
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetchTemplateSearchResults(
        query,
        controller.signal,
        aiSources,
      )
        .then((sources) => {
          setBackendMatches(new Set(sources));
        })
        .catch((error) => {
          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            return;
          }
          console.warn(
            "AI template search is unavailable; using local catalog search.",
            error,
          );
          setBackendMatches(null);
        });
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchRequestVersion, state.q]);

  useEffect(() => {
    if (state.sort !== "popular") {
      return undefined;
    }

    let active = true;
    prioritizeRepositoryMetrics(
      catalogTemplates.map((template) => template.source),
    );

    const flushMetrics = () => {
      metricsUpdateTimer.current = undefined;
      if (!active || pendingMetrics.current.size === 0) {
        return;
      }
      const updates = new Map(pendingMetrics.current);
      pendingMetrics.current.clear();
      setMetrics((current) => new Map([...current, ...updates]));
    };

    for (const template of catalogTemplates) {
      void loadRepositoryMetrics(template.source)
        .then((repositoryMetrics) => {
          if (!active) {
            return;
          }
          pendingMetrics.current.set(
            template.normalizedSource,
            repositoryMetrics,
          );
          if (metricsUpdateTimer.current === undefined) {
            metricsUpdateTimer.current = window.setTimeout(
              flushMetrics,
              75,
            );
          }
        })
        .catch(() => undefined);
    }

    return () => {
      active = false;
      if (metricsUpdateTimer.current !== undefined) {
        window.clearTimeout(metricsUpdateTimer.current);
        metricsUpdateTimer.current = undefined;
      }
      pendingMetrics.current.clear();
    };
  }, [state.sort]);

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
          replaceState({ ...state, q: "", unavailable: [] });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [replaceState, searchValue, state]);

  const matchingTemplates = useMemo(
    () =>
      getMatchingCatalogTemplates(
        catalogTemplates,
        state,
        backendMatches,
      ),
    [backendMatches, state],
  );
  const sortedTemplates = useMemo(
    () =>
      sortCatalogTemplates(
        matchingTemplates,
        state,
        metrics,
        sourceOrder,
      ),
    [matchingTemplates, metrics, state],
  );
  const totalItems = sortedTemplates.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const safeCurrentPage = Math.min(
    currentPage,
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
  const shareUrl =
    typeof window === "undefined" ? canonicalUrl : window.location.href;
  const selectedSortLabel =
    catalogSortOptions.find((option) => option.value === state.sort)
      ?.label ?? catalogSortOptions[0].label;
  const liveStatus =
    totalItems === 0
      ? "0 templates"
      : `${startIndex + 1}-${endIndex} of ${totalItems} templates${
          state.q ? ` for "${state.q}"` : ""
        }`;

  const changePage = (page: number) => {
    setCurrentPage(page);
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
        <title>Templates | Azure Developer CLI</title>
        <link rel="canonical" href={canonicalUrl} />
        <link rel="describedby" href={llmsUrl} />
        <meta
          name="description"
          content="Discover, understand, and start with an Azure Developer CLI template."
        />
      </Head>
      <Layout noFooter>
        <CatalogFluentProvider>
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
                    className={styles.search}
                    appearance="outline"
                    size="medium"
                    aria-label="Search templates"
                    value={searchValue}
                    placeholder="Describe the app you want to build or search with keywords"
                    autoComplete="off"
                    dismiss={
                      searchValue
                        ? { "aria-label": "Clear search" }
                        : null
                    }
                    onChange={(_event, data) => {
                      setSearchValue(data.value);
                      if (!data.value && state.q) {
                        replaceState({
                          ...state,
                          q: "",
                          unavailable: [],
                        });
                      }
                    }}
                  />
                </form>
                <div className={styles.sortGroup}>
                  <Label
                    className={styles.sortLabel}
                    htmlFor="catalog-sort"
                    size="small"
                    weight="semibold"
                  >
                    Sort by
                  </Label>
                  <Dropdown
                    id="catalog-sort"
                    className={styles.sortControl}
                    appearance="outline"
                    size="medium"
                    clearable={false}
                    clearButton={null}
                    aria-label="Sort by"
                    value={selectedSortLabel}
                    selectedOptions={[state.sort]}
                    title="Popularity uses GitHub repository metadata. Date sorting follows the catalog's established order."
                    onOptionSelect={(_event, data) => {
                      const sort =
                        catalogSortOptions.find(
                          (option) =>
                            option.value === data.optionValue,
                        )?.value ?? "popular";
                      replaceState({
                        ...state,
                        sort,
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
                  {catalogFacets.map((facet) => (
                    <FacetSection
                      key={facet.key}
                      facet={facet}
                      state={state}
                      backendMatches={backendMatches}
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
                          replaceState({
                            ...state,
                            q: "",
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
                            replaceState({
                              ...state,
                              [facet.key]: state[facet.key].filter(
                                (candidate) => candidate !== value,
                              ),
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
                          metric={metrics.get(template.normalizedSource)}
                          state={state}
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
                  Share the catalog index to help your agent find templates and
                  follow their setup instructions.
                </p>
                <small>
                  {catalogTemplates.length} public templates from the live
                  catalog.
                </small>
              </div>
              <div className={styles.agentActions}>
                <CopyAction
                  value={shareUrl}
                  idleLabel="Copy agent link"
                  copiedLabel="Agent link copied"
                  className={styles.agentButton}
                />
                <a href={llmsUrl}>View llms.txt</a>
                <a href={catalogJsonUrl}>Catalog JSON</a>
              </div>
            </section>
            <CatalogFooter />
          </main>
        </CatalogFluentProvider>
      </Layout>
    </>
  );
}


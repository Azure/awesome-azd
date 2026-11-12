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
  Card,
  Checkbox,
  Dropdown,
  Label,
  Option,
  SearchBox,
} from "@fluentui/react-components";
import {
  Copy16Regular,
  Sparkle16Regular,
  Star16Regular,
} from "@fluentui/react-icons";
import {
  catalogTemplates,
  type CatalogTemplate,
} from "../../../catalog/catalogData";
import {
  catalogFacets,
  clearCatalogState,
  getFacetLabel,
  getFacetOptions,
  getFacetValueCounts,
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
  captureGalleryNavigationState,
  restoreGalleryNavigationState,
  type GalleryNavigationState,
} from "../../../utils/galleryNavigation";
import SiteFluentProvider from "../../SiteFluentProvider";
import CopyAction from "../CopyAction";
import { RepositoryStarCount } from "./RepositoryStarCount";
import styles from "./styles.module.css";

const itemsPerPage = 20;
const canonicalUrl = "https://azure.github.io/awesome-azd/templates";
const catalogJsonUrl = "https://aka.ms/awesome-azd/templates.json";
const sourceOrder = new Map(
  catalogTemplates.map((template, index) => [
    template.normalizedSource,
    index,
  ]),
);
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

function AiIcon(): React.JSX.Element {
  return <Sparkle16Regular className={styles.aiIcon} aria-hidden="true" />;
}

function StarIcon(): React.JSX.Element {
  return <Star16Regular aria-hidden="true" />;
}

function CopyIcon(): React.JSX.Element {
  return <Copy16Regular aria-hidden="true" />;
}

function FacetSection({
  facet,
  state,
  onChange,
}: {
  facet: CatalogFacet;
  state: CatalogState;
  onChange: (
    key: CatalogFacetKey,
    value: string,
    checked: boolean,
  ) => void;
}): React.JSX.Element | null {
  const selected = state[facet.key];
  const [open, setOpen] = useState(
    facet.open === true || selected.length > 0,
  );
  const options = useMemo(
    () => getFacetOptions(catalogTemplates, facet),
    [facet],
  );
  const valueCounts = useMemo(
    () => getFacetValueCounts(catalogTemplates, state, facet),
    [facet, state],
  );

  useEffect(() => {
    if (selected.length > 0) {
      setOpen(true);
    }
  }, [selected.length]);

  const optionsWithCounts = useMemo(
    () =>
      options
        .map((value) => ({
          value,
          count: valueCounts.get(value) ?? 0,
        }))
        .filter(
          ({ value, count }) =>
            count > 0 || selected.includes(value),
        ),
    [options, selected, valueCounts],
  );

  if (optionsWithCounts.length === 0) {
    return null;
  }

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
        <span title="Filter items">{optionsWithCounts.length}</span>
      </summary>
      <fieldset>
        <legend className={styles.visuallyHidden}>{facet.label}</legend>
        {optionsWithCounts.map(({ value, count }) => {
          const label = getFacetLabel(facet, value);
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
}: {
  template: CatalogTemplate;
}): React.JSX.Element {
  const microsoftIcon = useBaseUrl("/img/Microsoft.svg");
  const communityIcon = useBaseUrl("/img/Community.svg");
  const detailUrl = useBaseUrl(template.detailPath);
  const service =
    template.resources.find(
      (resource) => resource.role === "Application hosting",
    )?.label ??
    template.host ??
    template.services[0];
  const cardTags = [
    ...(template.languages.length > 0
      ? template.languages
      : ["Bring your own code"]),
    ...template.iac.slice(0, 1),
    ...(service ? [service] : []),
  ];
  const headingId = `template-${template.id}`;

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
        id={`${headingId}-link`}
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
          <div className={styles.cardTags} data-template-tags>
            {cardTags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
          <RepositoryStarCount
            stars={template.stars}
            icon={<StarIcon />}
            className={styles.repoStats}
            statClassName={styles.repoStat}
          />
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

export default function CatalogPage(): React.JSX.Element {
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

  const matchingTemplates = useMemo(
    () => getMatchingCatalogTemplates(catalogTemplates, state),
    [state],
  );
  const sortedTemplates = useMemo(
    () =>
      sortCatalogTemplates(
        matchingTemplates,
        state,
        sourceOrder,
      ),
    [matchingTemplates, state],
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
        <title>Templates | Azure Developer CLI</title>
        <link rel="canonical" href={canonicalUrl} />
        <link rel="describedby" href={llmsUrl} />
        <meta
          name="description"
          content="Discover, understand, and start with an Azure Developer CLI template."
        />
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
                    className={styles.search}
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
                        state={state}
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


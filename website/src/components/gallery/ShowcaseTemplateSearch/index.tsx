/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { SearchBox } from "@fluentui/react/lib/SearchBox";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { useHistory, useLocation } from "@docusaurus/router";
import { Text, Link as FluentUILink } from "@fluentui/react-components";
import { galleryTemplates as allTemplates } from "@site/src/data/users";
import styles from "./styles.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";
import Clarity from "@microsoft/clarity";


const TITLES: Record<string, string> = {
  templates: "From code to cloud in minutes",
  extensions: "Extension Gallery (Preview)",
};
const DESCRIPTIONS: Record<string, string> = {
  templates: "Production-ready templates with infrastructure, CI/CD, and monitoring — all deployable with a single command.",
  extensions: "Discover azd extensions that add new capabilities to your workflow.",
};
const PLACEHOLDERS: Record<string, string> = {
  templates: "Search for an azd template or author...",
  extensions: "Search for an azd extension, capability, or author...",
};
const ADD_URL = "https://aka.ms/azd";
export var InputValue: string | null = null;

export type UserState = {
  scrollTopPosition: number;
  focusedElementId: string | undefined;
};

function prepareUserState(): UserState | undefined {
  if (ExecutionEnvironment.canUseDOM) {
    return {
      scrollTopPosition: window.scrollY,
      focusedElementId: document.activeElement?.id,
    };
  }

  return undefined;
}

const SearchNameQueryKey = "name";

function readSearchName(search: string) {
  return new URLSearchParams(search).get(SearchNameQueryKey);
}

function FilterBar(): React.JSX.Element {
  const history = useHistory();
  const location = useLocation();
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    setValue(readSearchName(location.search));
  }, [location]);
  InputValue = readSearchName(location.search);
  const contentType = new URLSearchParams(location.search).get("type") || "templates";
  const placeholder = PLACEHOLDERS[contentType] || PLACEHOLDERS.templates;

  // Log the search query to Clarity only when the user explicitly submits the
  // search. Clarity masks form inputs by default, so search text is never
  // recorded in session replays unless explicitly emitted via setTag/event.
  // The query is sanitized before being sent: emails, URLs, and GUIDs are
  // redacted and the value is truncated to a fixed length so the literal text
  // stored in Clarity tags cannot retain sensitive identifiers users may have
  // pasted into the search box.
  // Because Clarity.setTag replaces the tag's value on each call, we accumulate
  // the sanitized queries in a ref and pass the full (capped) array every time
  // so Clarity retains the full sequence of searches in the session rather than
  // just the most recent one.
  const MAX_QUERY_LENGTH = 100;
  const MAX_QUERY_HISTORY = 20;
  const searchHistoryRef = useRef<string[]>([]);
  const sanitizeSearchQuery = useCallback((raw: string) => {
    return raw
      .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/gi, "[email]")
      .replace(/\bhttps?:\/\/\S+/gi, "[url]")
      .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "[guid]")
      .slice(0, MAX_QUERY_LENGTH)
      .toLowerCase();
  }, []);
  const logSearchToClarity = useCallback((query: string | null) => {
    if (!ExecutionEnvironment.canUseDOM) return;
    const trimmed = (query ?? "").trim();
    if (trimmed.length < 2) return;
    const wcpConsent = (window as any).WcpConsent?.siteConsent;
    const consent = wcpConsent?.getConsent?.();
    if (!consent?.Analytics) return;
    try {
      const eventName = contentType === "extensions" ? "extension_search" : "template_search";
      const sanitized = sanitizeSearchQuery(trimmed);
      const history = searchHistoryRef.current;
      history.push(sanitized);
      if (history.length > MAX_QUERY_HISTORY) {
        history.splice(0, history.length - MAX_QUERY_HISTORY);
      }
      Clarity.event(eventName);
      Clarity.setTag("search_query", history.slice());
      Clarity.setTag("search_type", contentType);
    } catch (err) {
      // Consent has already been verified above, so reaching this catch implies
      // an unexpected Clarity SDK failure (e.g., the script was blocked after
      // init or an API contract change). Log at debug level for visibility
      // without surfacing noise to end users.
      console.debug("Failed to log search to Clarity", err);
    }
  }, [contentType, sanitizeSearchQuery]);

  return (
    <>
      <SearchBox
        styles={{
          root: {
            border: "1px solid var(--site-color-border)",
            height: "52px",
            maxWidth: "100%",
            width: "100%",
            borderRadius: "8px",
            background: "var(--site-color-surface)",
          },
          icon: {
            fontSize: "24px",
            paddingLeft: "10px",
          },
          field: {
            paddingLeft: "20px",
            fontSize: "18px",
          },
        }}
        id="filterBar"
        value={value ?? ""}
        placeholder={placeholder}
        role="search"
        ariaLabel="Search templates and extensions"
        onClear={(e) => {
          setValue(null);
          const newSearch = new URLSearchParams(location.search);
          newSearch.delete(SearchNameQueryKey);

          history.push({
            ...location,
            search: newSearch.toString(),
            state: prepareUserState(),
          });
        }}
        onSearch={(newValue) => {
          const submitted = typeof newValue === "string" ? newValue : (value ?? "");
          setValue(submitted);
          const newSearch = new URLSearchParams(location.search);
          newSearch.delete(SearchNameQueryKey);
          if (submitted) {
            newSearch.set(SearchNameQueryKey, submitted);
          }
          history.push({
            ...location,
            search: newSearch.toString(),
            state: prepareUserState(),
          });
          logSearchToClarity(submitted);
        }}
        onChange={(e) => {
          if (!e) {
            return;
          }
          setValue(e.currentTarget.value);
        }}
      />
    </>
  );
}

// Compute stats dynamically from template data
const templateCount = allTemplates.length;
const uniqueAzureServices = new Set(allTemplates.flatMap((t: any) => t.azureServices || []));
const uniqueLanguages = new Set(allTemplates.flatMap((t: any) => t.languages || []));

export default function ShowcaseTemplateSearch() {
  const { colorMode } = useColorMode();
  const location = useLocation();
  const gettingStartedUrl = useBaseUrl("/getting-started");
  const contentType = new URLSearchParams(location.search).get("type") || "templates";
  const title = TITLES[contentType] || TITLES.templates;
  const description = DESCRIPTIONS[contentType] || DESCRIPTIONS.templates;
  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchArea}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroBar}>
            {contentType === "templates" ? (
              <>
                From code to cloud<br />
                <span className={styles.heroAccent}>in minutes.</span>
              </>
            ) : (
              <>{title}</>
            )}
          </h1>
          <p className={styles.heroDescription}>
            {description}
          </p>
          <FilterBar />
          {contentType === "templates" && (
            <div className={styles.statsBar}>
              <div className={styles.statItem}>
                <Text weight="bold" size={500} className={styles.statNumber}>{templateCount}+</Text>
                <Text size={200} className={styles.statLabel}>Templates</Text>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <Text weight="bold" size={500} className={styles.statNumber}>{uniqueAzureServices.size}+</Text>
                <Text size={200} className={styles.statLabel}>Azure Services</Text>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <Text weight="bold" size={500} className={styles.statNumber}>{uniqueLanguages.size}</Text>
                <Text size={200} className={styles.statLabel}>Languages</Text>
              </div>
            </div>
          )}
          <div className={styles.heroActions}>
            {contentType === "extensions"
              ? <>
                  <Text size={300} className={styles.heroSubtext}>
                    Extensions add new commands, lifecycle hooks, and capabilities to azd.{" "}
                    <FluentUILink
                      href={ADD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ paddingLeft: "3px" }}
                    >
                      Learn more in our docs.
                    </FluentUILink>
                  </Text>
                </>
              : <a
                    href={gettingStartedUrl}
                    className={styles.heroPrimaryButton}
                  >
                    Get Started in Minutes →
                  </a>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

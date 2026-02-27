/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect } from "react";
import { SearchBox } from "@fluentui/react/lib/SearchBox";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { useHistory, useLocation } from "@docusaurus/router";
import { Text, Link as FluentUILink } from "@fluentui/react-components";
import styles from "./styles.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";

const TITLES: Record<string, string> = {
  templates: "From code to cloud in minutes",
  extensions: "Extension Gallery",
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
  InputValue = value;
  const contentType = new URLSearchParams(location.search).get("type") || "templates";
  const placeholder = PLACEHOLDERS[contentType] || PLACEHOLDERS.templates;
  return (
    <>
      <SearchBox
        styles={{
          root: {
            border: "1px solid #D1D1D1",
            height: "52px",
            maxWidth: "740px",
            borderRadius: "4px",
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
        value={readSearchName(location.search) != null ? value : ""}
        placeholder={placeholder}
        role="search"
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
        onChange={(e) => {
          if (!e) {
            return;
          }
          setValue(e.currentTarget.value);
          const newSearch = new URLSearchParams(location.search);
          newSearch.delete(SearchNameQueryKey);
          if (e.currentTarget.value) {
            newSearch.set(SearchNameQueryKey, e.currentTarget.value);
          }
          history.push({
            ...location,
            search: newSearch.toString(),
            state: prepareUserState(),
          });
          setTimeout(() => {
            document.getElementById("searchbar")?.focus();
          }, 0);
        }}
      />
    </>
  );
}

export default function ShowcaseTemplateSearch() {
  const { colorMode } = useColorMode();
  const location = useLocation();
  const contentType = new URLSearchParams(location.search).get("type") || "templates";
  const title = TITLES[contentType] || TITLES.templates;
  const description = DESCRIPTIONS[contentType] || DESCRIPTIONS.templates;
  return (
    <div className={styles.searchContainer}>
      <img
        src={
          colorMode != "dark"
            ? useBaseUrl("/img/coverBackground.png")
            : useBaseUrl("/img/coverBackgroundDark.png")
        }
        className={styles.cover}
        onError={({ currentTarget }) => {
          currentTarget.style.display = "none";
        }}
        alt=""
      />
      <div className={styles.searchArea}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h1 className={styles.heroBar}>
            <Text
              size={800}
              align="center"
              weight="semibold"
              style={{
                background:
                  "linear-gradient(90deg, rgb(112.68, 94.63, 239.06) 0%, rgb(41.21, 120.83, 190.19) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {title}
            </Text>
          </h1>
          <Text
            align="center"
            size={400}
            className={styles.heroDescription}
          >
            {description}
          </Text>
          <FilterBar />
          {contentType === "templates" && (
            <div className={styles.statsBar}>
              <div className={styles.statItem}>
                <Text weight="bold" size={500} className={styles.statNumber}>290+</Text>
                <Text size={200} className={styles.statLabel}>Templates</Text>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <Text weight="bold" size={500} className={styles.statNumber}>50+</Text>
                <Text size={200} className={styles.statLabel}>Azure Services</Text>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <Text weight="bold" size={500} className={styles.statNumber}>9</Text>
                <Text size={200} className={styles.statLabel}>Languages</Text>
              </div>
            </div>
          )}
          <Text
            align="center"
            size={300}
            className={styles.heroSubtext}
          >
            {contentType === "extensions"
              ? "Extensions add new commands, lifecycle hooks, and capabilities to azd. "
              : "New to azd? "}
            <FluentUILink
              href={contentType === "extensions" ? ADD_URL : "/awesome-azd/getting-started"}
              target={contentType === "extensions" ? "_blank" : "_self"}
              style={{ paddingLeft: "3px" }}
              className={styles.learnMoreColor}
            >
              {contentType === "extensions" ? "Learn more in our docs." : "Get started in minutes →"}
            </FluentUILink>
          </Text>
        </div>
      </div>
    </div>
  );
}

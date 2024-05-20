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

const TITLE = "Template Library";
const DESCRIPTION =
  "An open-source template gallery to get started with Azure.";
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
        placeholder="Search for an azd template..."
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
              {TITLE}
            </Text>
          </h1>
          <Text
            align="center"
            size={400}
            style={{
              color: "#242424",
              padding: "10px 0 20px 0",
            }}
          >
            {DESCRIPTION}
          </Text>
          <FilterBar />
          <Text
            align="center"
            size={300}
            style={{
              color: "#242424",
              paddingTop: "20px",
            }}
          >
            Each template is a fully working, cloud-ready application deployable
            with the Azure Developer CLI (azd).{" "}
          </Text>
          <Text
            align="center"
            size={300}
            style={{
              color: "#242424",
              paddingBottom: "20px",
            }}
          >
            New to azd? Welcome!
            <FluentUILink
              href={ADD_URL}
              target="_blank"
              style={{ paddingLeft: "3px" }}
              className={styles.learnMoreColor}
            >
              Learn more in our docs.
            </FluentUILink>
          </Text>
        </div>
      </div>
    </div>
  );
}

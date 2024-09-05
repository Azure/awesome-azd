/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect } from "react";
import Layout from "@theme/Layout";
import ShowcaseLeftFilters from "../components/gallery/ShowcaseLeftFilters";
import ShowcaseTemplateSearch, {
  UserState,
} from "../components/gallery/ShowcaseTemplateSearch";
import {
  teamsLightTheme,
  teamsDarkTheme,
  FluentProvider,
} from "@fluentui/react-components";
import { initializeIcons } from "@fluentui/react/lib/Icons";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { type TagType } from "@site/src/data/tags";
import { TagList } from "@site/src/data/users";
import styles from "./styles.module.css";
import { useColorMode } from "@docusaurus/theme-common";
import ShowcaseCardPage from "./ShowcaseCardPage";
import { useLocation } from "@docusaurus/router";

initializeIcons();

export function prepareUserState(): UserState | undefined {
  if (ExecutionEnvironment.canUseDOM) {
    return {
      scrollTopPosition: window.scrollY,
      focusedElementId: document.activeElement?.id,
    };
  }

  return undefined;
}

const TagQueryStringKey = "tags";
const readSearchTags = (search: string): TagType[] => {
  return new URLSearchParams(search).getAll(TagQueryStringKey) as TagType[];
};
const replaceSearchTags = (search: string, newTags: TagType[]) => {
  const searchParams = new URLSearchParams(search);
  searchParams.delete(TagQueryStringKey);
  newTags.forEach((tag) => searchParams.append(TagQueryStringKey, tag));
  return searchParams.toString();
};

const App = () => {
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(true);
  const [activeTags, setActiveTags] = useState<TagType[]>(TagList);
  const [selectedCheckbox, setSelectedCheckbox] = useState<TagType[]>([]);
  const location = useLocation<UserState>();
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);

  useEffect(() => {
    setSelectedTags(readSearchTags(location.search));
    setSelectedCheckbox(readSearchTags(location.search));
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [location]);

  return !loading ? (
    <FluentProvider
      theme={colorMode == "dark" ? teamsDarkTheme : teamsLightTheme}
    >
      <ShowcaseTemplateSearch />
      <div className={styles.filterAndCard}>
        <div className={styles.filter}>
          <ShowcaseLeftFilters
            activeTags={activeTags}
            selectedCheckbox={selectedCheckbox}
            setSelectedCheckbox={setSelectedCheckbox}
            location={location}
            setSelectedTags={setSelectedTags}
            selectedTags={selectedTags}
            readSearchTags={readSearchTags}
            replaceSearchTags={replaceSearchTags}
          />
        </div>
        <div className={styles.card}>
          <ShowcaseCardPage
            setActiveTags={setActiveTags}
            selectedTags={selectedTags}
            setSelectedCheckbox={setSelectedCheckbox}
            location={location}
            setSelectedTags={setSelectedTags}
            readSearchTags={readSearchTags}
            replaceSearchTags={replaceSearchTags}
          />
        </div>
      </div>
    </FluentProvider>
  ) : null;
};

export default function Showcase(): JSX.Element {
  return (
    <Layout>
      <App />
    </Layout>
  );
}

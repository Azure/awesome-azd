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

const BackToTopButton = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button 
      className={styles.backToTopButton}
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
    >
      ↑
    </button>
  );
};

const TagQueryStringKey = "tags";
const AuthorQueryStringKey = "authors";

const readSearchTags = (search: string): TagType[] => {
  return new URLSearchParams(search).getAll(TagQueryStringKey) as TagType[];
};

const readSearchAuthors = (search: string): string[] => {
  return new URLSearchParams(search).getAll(AuthorQueryStringKey);
};

const replaceSearchTags = (search: string, newTags: TagType[]) => {
  const searchParams = new URLSearchParams(search);
  searchParams.delete(TagQueryStringKey);
  newTags.forEach((tag) => searchParams.append(TagQueryStringKey, tag));
  return searchParams.toString();
};

const replaceSearchAuthors = (search: string, newAuthors: string[]) => {
  const searchParams = new URLSearchParams(search);
  searchParams.delete(AuthorQueryStringKey);
  newAuthors.forEach((author) => searchParams.append(AuthorQueryStringKey, author));
  return searchParams.toString();
};

const App = () => {
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(true);
  const [activeTags, setActiveTags] = useState<TagType[]>(TagList);
  const [selectedCheckbox, setSelectedCheckbox] = useState<TagType[]>([]);
  const location = useLocation<UserState>();
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  
  // Author filter states
  const [activeAuthors, setActiveAuthors] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedAuthorCheckbox, setSelectedAuthorCheckbox] = useState<string[]>([]);

  useEffect(() => {
    setSelectedTags(readSearchTags(location.search));
    setSelectedCheckbox(readSearchTags(location.search));
    setSelectedAuthors(readSearchAuthors(location.search));
    setSelectedAuthorCheckbox(readSearchAuthors(location.search));
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [location]);

  return !loading ? (
    <FluentProvider
      theme={colorMode == "dark" ? teamsDarkTheme : teamsLightTheme}
    >
      <main>
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
              activeAuthors={activeAuthors}
              selectedAuthors={selectedAuthors}
              selectedAuthorCheckbox={selectedAuthorCheckbox}
              setSelectedAuthorCheckbox={setSelectedAuthorCheckbox}
              setSelectedAuthors={setSelectedAuthors}
              readSearchAuthors={readSearchAuthors}
              replaceSearchAuthors={replaceSearchAuthors}
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
              setActiveAuthors={setActiveAuthors}
              selectedAuthors={selectedAuthors}
              setSelectedAuthorCheckbox={setSelectedAuthorCheckbox}
              setSelectedAuthors={setSelectedAuthors}
              readSearchAuthors={readSearchAuthors}
              replaceSearchAuthors={replaceSearchAuthors}
            />
          </div>
        </div>
        <BackToTopButton />
      </main>
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

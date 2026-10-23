/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect, useMemo } from "react";
import Layout from "@theme/Layout";
import ShowcaseLeftFilters from "../../components/gallery/ShowcaseLeftFilters";
import ShowcaseTemplateSearch from "../../components/gallery/ShowcaseTemplateSearch";
import {
  webLightTheme,
  webDarkTheme,
  FluentProvider,
} from "@fluentui/react-components";
import { initializeIcons } from "@fluentui/react/lib/Icons";
import type { UserState } from "@site/src/utils/galleryNavigation";
import {
  readSearchTags,
  readSearchAuthors,
  replaceSearchTags,
  replaceSearchAuthors,
} from "@site/src/utils/galleryQuery";
import { type TagType } from "@site/src/data/tags";
import { TagList } from "@site/src/data/users";
import styles from "../styles.module.css";
import { useColorMode } from "@docusaurus/theme-common";
import ShowcaseCardPage from "../ShowcaseCardPage";
import { useLocation } from "@docusaurus/router";

initializeIcons();

export { prepareUserState } from "@site/src/utils/galleryNavigation";

const BackToTopButton = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

const App = () => {
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(true);
  const [activeTags, setActiveTags] = useState<TagType[]>(TagList);
  const location = useLocation<UserState>();
  const selectedTags = useMemo(
    () => readSearchTags(location.search),
    [location.search],
  );
  const selectedAuthors = useMemo(
    () => readSearchAuthors(location.search),
    [location.search],
  );

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [location]);

  return !loading ? (
    <FluentProvider
      theme={colorMode == "dark" ? webDarkTheme : webLightTheme}
    >
      <main>
        <ShowcaseTemplateSearch />
        <div className={styles.filterAndCard}>
          <div className={styles.filter}>
            <ShowcaseLeftFilters
              activeTags={activeTags}
              location={location}
              selectedTags={selectedTags}
              readSearchTags={readSearchTags}
              replaceSearchTags={replaceSearchTags}
              selectedAuthors={selectedAuthors}
              readSearchAuthors={readSearchAuthors}
              replaceSearchAuthors={replaceSearchAuthors}
            />
          </div>
          <div className={styles.card}>
            <ShowcaseCardPage
              setActiveTags={setActiveTags}
              selectedTags={selectedTags}
              location={location}
              readSearchTags={readSearchTags}
              replaceSearchTags={replaceSearchTags}
              selectedAuthors={selectedAuthors}
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

export default function Templates(): React.JSX.Element {
  return (
    <Layout>
      <App />
    </Layout>
  );
}

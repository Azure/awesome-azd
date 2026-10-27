/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useMemo, useEffect } from "react";
import useIsBrowser from "@docusaurus/useIsBrowser";
import ShowcaseLeftFilters from "../ShowcaseLeftFilters";
import ShowcaseTemplateSearch from "../ShowcaseTemplateSearch";
import {
  webLightTheme,
  webDarkTheme,
  FluentProvider,
} from "@fluentui/react-components";
import { initializeIcons } from "@fluentui/react/lib/Icons";
import type { GalleryNavigationState } from "@site/src/utils/galleryNavigation";
import {
  readSearchTags,
  readUnknownSearchTags,
  readSearchAuthors,
} from "@site/src/utils/galleryQuery";
import { type TagType } from "@site/src/data/tags";
import { TagList } from "@site/src/data/templates";
import styles from "./styles.module.css";
import { useColorMode } from "@docusaurus/theme-common";
import ShowcaseResults from "../ShowcaseResults";
import { useLocation } from "@docusaurus/router";

initializeIcons();

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

export default function GalleryPage(): React.JSX.Element | null {
  const { colorMode } = useColorMode();
  const isBrowser = useIsBrowser();
  const [activeTags, setActiveTags] = useState<TagType[]>(TagList);
  const location = useLocation<GalleryNavigationState>();
  const selectedTags = useMemo(
    () => readSearchTags(location.search),
    [location.search],
  );
  const selectedAuthors = useMemo(
    () => readSearchAuthors(location.search),
    [location.search],
  );
  useEffect(() => {
    if (readUnknownSearchTags(location.search).length > 0) {
      console.warn("Unsupported gallery URL tags were ignored.");
    }
  }, [location.search]);

  return isBrowser ? (
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
              selectedAuthors={selectedAuthors}
            />
          </div>
          <div className={styles.card}>
            <ShowcaseResults
              setActiveTags={setActiveTags}
              selectedTags={selectedTags}
              location={location}
              selectedAuthors={selectedAuthors}
            />
          </div>
        </div>
        <BackToTopButton />
      </main>
    </FluentProvider>
  ) : null;
}

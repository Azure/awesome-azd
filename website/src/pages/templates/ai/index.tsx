/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useMemo, useState } from "react";
import Head from "@docusaurus/Head";
import { useLocation } from "@docusaurus/router";
import Layout from "@theme/Layout";
import { useColorMode } from "@docusaurus/theme-common";
import {
  FluentProvider,
  webDarkTheme,
  webLightTheme,
} from "@fluentui/react-components";
import CollectionTabs from "@site/src/components/gallery/CollectionTabs";
import ShowcaseCoverPage from "@site/src/ai/components/gallery/ShowcaseCoverPage";
import ShowcaseLeftFilters from "@site/src/ai/components/gallery/ShowcaseLeftFilters";
import ShowcaseResults from "@site/src/ai/components/gallery/ShowcaseResults";
import type { TagType } from "@site/src/ai/data/tags";
import { tagList } from "@site/src/ai/data/templates";
import type { GalleryNavigationState } from "@site/src/ai/utils/galleryNavigation";
import { readSearchTags } from "@site/src/ai/utils/galleryQuery";
import { warmTemplateSearch } from "@site/src/ai/utils/templateSearch";
import styles from "@site/src/ai/components/gallery/styles.module.css";
import { initializeFluentIcons } from "@site/src/utils/fluentIcons";

initializeFluentIcons();

const title =
  "AI app templates | Build AI applications with pre-made templates";
const description =
  "AI app templates are well-maintained, easy-to-deploy reference implementations for building AI applications on Azure.";
const canonicalUrl = "https://azure.github.io/awesome-azd/templates/ai";
const imageUrl = "https://azure.github.io/awesome-azd/img/logo.png";

function AiGalleryPage(): React.JSX.Element {
  const { colorMode } = useColorMode();
  const location = useLocation<GalleryNavigationState>();
  const [activeTags, setActiveTags] = useState<TagType[]>(tagList);
  const [searchSnapshot, setSearchSnapshot] = useState("");
  const selectedTags = useMemo(
    () => readSearchTags(searchSnapshot),
    [searchSnapshot],
  );
  const queryReady = searchSnapshot === location.search;

  useEffect(() => {
    setSearchSnapshot(location.search);
  }, [location.search]);

  useEffect(() => {
    if (queryReady) {
      document
        .getElementById("ai-gallery-root")
        ?.setAttribute("data-hydrated", "true");
    }
  }, [queryReady]);

  useEffect(() => {
    warmTemplateSearch().catch((error) => {
      console.error("Error warming template search:", error);
    });
  }, []);

  return (
    <FluentProvider
      id="ai-gallery-root"
      theme={colorMode === "dark" ? webDarkTheme : webLightTheme}
      className={styles.container}
    >
      <main>
        <ShowcaseCoverPage />
        <CollectionTabs activeCollection="ai" />
        <div className={styles.filterAndCardContainer}>
          <div className={styles.filterAndCard}>
            <div className={styles.filter}>
              <ShowcaseLeftFilters
                activeTags={activeTags}
                selectedTags={selectedTags}
              />
            </div>
            <div className={styles.card}>
              <ShowcaseResults
                setActiveTags={setActiveTags}
                selectedTags={selectedTags}
                colorMode={colorMode}
                searchSnapshot={searchSnapshot}
                queryReady={queryReady}
              />
            </div>
          </div>
        </div>
      </main>
    </FluentProvider>
  );
}

export default function AiTemplates(): React.JSX.Element {
  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:description" content={description} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={imageUrl} />
      </Head>
      <Layout>
        <AiGalleryPage />
      </Layout>
    </>
  );
}

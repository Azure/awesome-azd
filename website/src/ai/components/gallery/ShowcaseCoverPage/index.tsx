/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import {
  Title1,
  Title3,
  Display,
  Image,
  Link,
  Body1
} from "@fluentui/react-components";
import styles from "./styles.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { featuredTemplates } from "../../../data/templates";
import ShowcaseCards from "../ShowcaseCards";
import { useColorMode } from "@docusaurus/theme-common";

const title = "Build with AI";
const description =
  "Get started with AI application templates. Edit and deploy to Azure using VS Code or GitHub Codespaces.";
const subtitle = "Featured AI templates";

export default function ShowcaseCoverPage() {
  const { colorMode } = useColorMode();
  const coverImage = useBaseUrl(
    colorMode === "dark"
      ? "/img/ai/coverBackgroundDark.png"
      : "/img/ai/coverBackground.png",
  );
  const openIcon = useBaseUrl(
    colorMode === "dark"
      ? "/img/ai/openBlueDark.svg"
      : "/img/ai/openBlue.svg",
  );

  return (
    <div className={styles.coverPageContainer}>
      <Image
        src={coverImage}
        className={styles.cover}
        alt="backgroundImage"
        onError={({ currentTarget }) => {
          currentTarget.style.display = "none";
        }}
      />
      <div className={styles.coverPageAreaContainer}>
        <div className={styles.coverPageArea}>
          <div className={styles.titleSection}>
            <h1 className={styles.heading}><Display>{title}</Display></h1>
            <Title3>{description}</Title3>
          </div>
          <div className={styles.subtitleSection}>
            <h2 className={styles.heading}><Title1>{subtitle}</Title1></h2>
            <ShowcaseCards templates={featuredTemplates} coverPage={true} />
          </div>
          <div className={styles.learnAzureSection}>
            <Body1>New to Microsoft Azure?</Body1>
            <Link
              href="https://azure.microsoft.com/pricing/purchase-options/azure-account/?icid=azure-github-io"
              target="_blank"
              rel="noopener noreferrer"
            >
              Try for free
            </Link>
            <a
              href="https://azure.microsoft.com/pricing/purchase-options/azure-account/?icid=azure-github-io"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className={styles.tryForFreeSection}
                src={openIcon}
                alt="Open"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

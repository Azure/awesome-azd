/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  Card,
  Divider,
  Image,
  Title3,
} from "@fluentui/react-components";
import styles from "../styles.module.css";

const modelCatalogTitle = "Explore models on Microsoft Foundry";
const modelCatalogDescription =
  "Explore models from Azure OpenAI, Meta, Hugging Face, NVIDIA, and more to reason over conversations, images, speech, and other modalities. ";
const azdTemplatesTitle = "Learn more about Azure Developer CLI templates";
const azdTemplatesDescription =
  "Use Azure Developer CLI (azd) templates to provision Azure resources, deploy a sample application, configure CI/CID pipelines, and more.";

export default function ShowcaseLearningResources({
  colorMode,
}: {
  colorMode: string;
}) {
  const modelCatalogImage = useBaseUrl("/img/ai/Learning_AI_Studio.svg");
  const azdTemplatesImage = useBaseUrl(
    colorMode === "dark"
      ? "/img/ai/Learning_AI_ToolsDark.svg"
      : "/img/ai/Learning_AI_Tools.svg",
  );

  return (
    <>
      <div className={styles.breakLine}>
        <Divider />
      </div>
      <h2 className={styles.heading}>
        <Title3>Learning resources</Title3>
      </h2>
      <div className={styles.learningCardSection}>
        <Card
          className={styles.learningCard}
          aria-label={modelCatalogTitle}
          aria-description={modelCatalogDescription}
          role="button"
          onClick={() => {
            window.open("https://ai.azure.com/explore/models", "_blank");
          }}
        >
          <Image
            alt="Learning Icon"
            src={modelCatalogImage}
            height={52}
            width={52}
          />
          <div className={styles.learningTextSection}>
            <div className={styles.learningCardTitle}>
              {modelCatalogTitle}
            </div>
            <div className={styles.learningCardDescription}>
              {modelCatalogDescription}
            </div>
          </div>
        </Card>
        <Card
          className={styles.learningCard}
          aria-label={azdTemplatesTitle}
          aria-description={azdTemplatesDescription}
          role="button"
          onClick={() => {
            window.open(
              "https://learn.microsoft.com/azure/developer/azure-developer-cli/azd-templates",
              "_blank",
            );
          }}
        >
          <Image
            alt="AI Tools"
            src={azdTemplatesImage}
            height={52}
            width={52}
          />
          <div className={styles.learningTextSection}>
            <div className={styles.learningCardTitle}>
              {azdTemplatesTitle}
            </div>
            <div className={styles.learningCardDescription}>
              {azdTemplatesDescription}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

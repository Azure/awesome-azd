/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { Text, Link as FluentUILink } from "@fluentui/react-components";
import styles from "./styles.module.css";
import { Card } from "@fluentui/react-components";

export default function ShowcaseEmptyResult({
  id,
  searchName,
}: {
  id: string;
  searchName: string | null;
}) {
  return (
    <div id={id} className={styles.emptyResult}>
      <div className={styles.message}>
        {searchName != null ? (
          <>
            <Text size={500} weight="bold" align="center">
              No templates found for '{searchName}'
            </Text>
            <Text size={400} align="center">
              Try a different search term or browse all templates.
            </Text>
          </>
        ) : (
          <>
            <Text size={500} weight="bold" align="center">
              No templates match your filters.
            </Text>
            <Text size={400} align="center">
              Try broadening your search or clear filters to browse all templates.
            </Text>
          </>
        )}
      </div>
      <Card className={styles.contributionCard}>
        <div className={styles.contributionRow}>
          <img
            height={50}
            width={50}
            src={useBaseUrl("/img/smile.svg")}
            alt="smile"
            className={styles.illustration}
          />
          <div className={styles.contributionText}>
            <Text size={400} weight="bold">
              Want to be the change you wish to see in the world?
            </Text>
            <Text size={300}>
              awesome-azd is always looking for new templates!
            </Text>
            <FluentUILink
              key="emptySearch_contributeTemplate"
              href="https://azure.github.io/awesome-azd/docs/contribute"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.colorLink}
            >
              • Learn how to contribute an azd template
            </FluentUILink>
            <FluentUILink
              key="emptySearch_requestBoard"
              href="https://github.com/Azure/awesome-azd/issues/new?assignees=kristenwomack%2C+savannahostrowski&labels=requested-contribution&template=%F0%9F%A4%94-submit-a-template-request.md&title=%5BIdea%5D+%3Cyour-template-name%3E"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.colorLink}
            >
              • View our template request board
            </FluentUILink>
          </div>
        </div>
      </Card>
    </div>
  );
}

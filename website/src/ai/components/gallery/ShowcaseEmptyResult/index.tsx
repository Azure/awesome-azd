/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { Image, Subtitle1, Body2 } from "@fluentui/react-components";
import styles from "./styles.module.css";

export default function ShowcaseEmptyResult({
  id,
  searchValue,
}: {
  id: string;
  searchValue: string;
}) {
  const emptySearchImage = useBaseUrl("/img/ai/searchQuestionmark.svg");

  return (
    <div
      id={id}
      className={styles.emptyResultSection}
    >
      {searchValue ? (
        <>
          <Image
            src={emptySearchImage}
            alt="searchQuestionmark"
            height={128}
            width={128}
          />
          <div className={styles.resultSection}>
            <Subtitle1>
              We couldn’t find any results for '{searchValue}'
            </Subtitle1>
            <Body2>
              Check for spelling or try searching for another term.
            </Body2>
          </div>
        </>
      ) : (
        <>
          <div className={styles.resultSection}>
            <Subtitle1>
              We couldn’t find any results.
            </Subtitle1>
            <Body2>
              Check for tags or try filtering for another tag.
            </Body2>
          </div>
        </>
      )}
    </div>
  );
}

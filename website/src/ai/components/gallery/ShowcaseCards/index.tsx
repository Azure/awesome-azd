/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import type { Template } from "../../../data/tags";
import ShowcaseCard from "../ShowcaseCard";
import ShowcaseEmptyResult from "../ShowcaseEmptyResult";
import ShowcaseSurveyCard from "../ShowcaseSurveyCard";
import styles from "../styles.module.css";

export default function ShowcaseCards({
  templates,
  coverPage,
  searchValue = "",
  searchPending = false,
  loadMetadata = true,
}: {
  templates: Template[];
  coverPage: boolean;
  searchValue?: string;
  searchPending?: boolean;
  loadMetadata?: boolean;
}) {
  if (templates.length === 0) {
    if (searchPending) {
      return (
        <section
          data-testid="template-results"
          aria-label="Searching templates"
          aria-busy="true"
        />
      );
    }

    return (
      <ShowcaseEmptyResult
        id="showcase.templatesList.noResult"
        searchValue={searchValue}
      />
    );
  }

  return (
    <section
      data-testid={coverPage ? "featured-templates" : "template-results"}
    >
      <div className={styles.showcaseList}>
        {templates.map((template, index) => (
          <React.Fragment key={template.source}>
            <ShowcaseCard
              template={template}
              coverPage={coverPage}
              loadMetadata={loadMetadata}
            />
            {((templates.length < 6 && index === templates.length - 1) ||
              index === 4) &&
            !coverPage ? (
              <ShowcaseSurveyCard />
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

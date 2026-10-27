/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import ShowcaseEmptyResult from "../ShowcaseEmptyResult";
import { type Template, type TagType } from "../../../data/tags";
import styles from "./styles.module.css";
import ShowcaseCard from "../ShowcaseCard";
import ShowcaseSurveyCard from "../ShowcaseSurveyCard";

export default function ShowcaseCards({
  filteredTemplates,
  searchName = null,
}: {
  filteredTemplates: Template[];
  searchName?: string | null;
}) {
  const len = filteredTemplates ? filteredTemplates.length : 0;
  if (len === 0) {
    return (
      <ShowcaseEmptyResult
        id="showcase.usersList.noResult"
        searchName={searchName}
      />
    );
  }

  return (
    <section>
      <div className={styles.showcaseFavorite}>
        <div className={styles.showcaseList} data-testid="showcase-list">
          {filteredTemplates.map((template, index) => (
            <React.Fragment key={template.id}>
              <ShowcaseCard template={template} />
              {(len < 6 && index === len - 1) || index === 4 ? (
                <ShowcaseSurveyCard />
              ) : null}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

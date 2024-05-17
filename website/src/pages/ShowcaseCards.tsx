/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import ShowcaseEmptyResult from "../components/gallery/ShowcaseEmptyResult";
import { type User, type TagType } from "../data/tags";
import styles from "./styles.module.css";
import ShowcaseCard from "../components/gallery/ShowcaseCard";
import ShowcaseSurveyCard from "../components/gallery/ShowcaseSurveyCard";

export default function ShowcaseCards({
  filteredUsers,
}: {
  filteredUsers: User[];
}) {
  const len = filteredUsers ? filteredUsers.length : 0;
  if (len === 0) {
    return <ShowcaseEmptyResult id="showcase.usersList.noResult" />;
  }

  return (
    <section>
      <div className={styles.showcaseFavorite}>
        <div className={styles.showcaseList}>
          {filteredUsers.map((user, index) => (
            <React.Fragment key={index}>
              {(len < 6 && index === len - 1) || index === 4 ? (
                <React.Fragment key="cardWithSurveyCard">
                  <React.Fragment key={user.title}>
                    <ShowcaseCard user={user} />
                  </React.Fragment>
                  <React.Fragment key="fragment_surveyCard">
                    <ShowcaseSurveyCard />
                  </React.Fragment>
                </React.Fragment>
              ) : (
                <React.Fragment key={user.title}>
                  <ShowcaseCard user={user} />
                </React.Fragment>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

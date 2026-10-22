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
  searchName = null,
}: {
  filteredUsers: User[];
  searchName?: string | null;
}) {
  const len = filteredUsers ? filteredUsers.length : 0;
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
          {filteredUsers.map((user, index) => (
            <React.Fragment key={user.id}>
              <ShowcaseCard user={user} />
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

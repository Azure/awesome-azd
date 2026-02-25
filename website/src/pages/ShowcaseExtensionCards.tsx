/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import ShowcaseEmptyResult from "../components/gallery/ShowcaseEmptyResult";
import { type Extension } from "../data/extensionTypes";
import styles from "./styles.module.css";
import ShowcaseExtensionCard from "../components/gallery/ShowcaseExtensionCard";

export default function ShowcaseExtensionCards({
  filteredExtensions,
}: {
  filteredExtensions: Extension[];
}) {
  const len = filteredExtensions ? filteredExtensions.length : 0;
  if (len === 0) {
    return <ShowcaseEmptyResult id="showcase.extensionsList.noResult" />;
  }

  return (
    <section>
      <div className={styles.showcaseFavorite}>
        <div className={styles.showcaseList}>
          {filteredExtensions.map((extension) => (
            <React.Fragment key={extension.id}>
              <ShowcaseExtensionCard extension={extension} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import ShowcaseEmptyResult from "../ShowcaseEmptyResult";
import { type Extension } from "../../../data/extensionTypes";
import styles from "./styles.module.css";
import ShowcaseExtensionCard from "../ShowcaseExtensionCard";

export default function ShowcaseExtensionCards({
  filteredExtensions,
  onClear,
}: {
  filteredExtensions: Extension[];
  onClear: () => void;
}) {
  if (filteredExtensions.length === 0) {
    return (
      <ShowcaseEmptyResult
        id="showcase.extensionsList.noResult"
        itemLabel="extensions"
        onClear={onClear}
      />
    );
  }

  return (
    <section>
      <div className={styles.showcaseFavorite}>
        <div className={styles.showcaseList} data-testid="showcase-list">
          {filteredExtensions.map((extension) => (
            <ShowcaseExtensionCard
              key={extension.id}
              extension={extension}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

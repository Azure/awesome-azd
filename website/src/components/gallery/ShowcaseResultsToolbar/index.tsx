/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { Combobox, Option, Text, type ComboboxProps } from "@fluentui/react-components";
import { GALLERY_SORT_OPTIONS } from "@site/src/utils/gallerySorting";
import styles from "./styles.module.css";

export default function ShowcaseResultsToolbar({
  totalItems,
  startIndex,
  endIndex,
  isExtensions,
  searchName,
  onSortSelect,
}: {
  totalItems: number;
  startIndex: number;
  endIndex: number;
  isExtensions: boolean;
  searchName: string | null;
  onSortSelect: NonNullable<ComboboxProps["onOptionSelect"]>;
}) {
  // Count display logic
  const currentStart = totalItems > 0 ? startIndex + 1 : 0;
  const currentEnd = Math.min(endIndex, totalItems);
  const itemLabel = isExtensions ? "extension" : "template";
  const itemLabelPlural = isExtensions ? "extensions" : "templates";

  return (
    <div className={styles.viewingSortRow}>
      <div
        className={styles.viewingStatus}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <Text size={400}>Viewing</Text>
        {totalItems === 0 ? (
          <>
            <Text size={400} weight="bold">0</Text>
            <Text size={400}>{itemLabelPlural}</Text>
          </>
        ) : totalItems === 1 ? (
          <>
            <Text size={400} weight="bold">1</Text>
            <Text size={400}>{itemLabel}</Text>
          </>
        ) : (
          <>
            <Text size={400} weight="bold">
              {`${currentStart}-${currentEnd}`}
            </Text>
            <Text size={400}>of</Text>
            <Text size={400} weight="bold">
              {totalItems}
            </Text>
            <Text size={400}>{itemLabelPlural}</Text>
          </>
        )}
        {searchName != null ? (
          <>
            <Text size={400}>for</Text>
            <Text size={400} weight="bold">
              '{searchName}'
            </Text>
          </>
        ) : null}
      </div>
      <div className={styles.sortControls}>
        <Text size={400}>Sort by: </Text>
        <Combobox
          className={styles.sortCombobox}
          input={{ className: styles.sortInput }}
          defaultValue={GALLERY_SORT_OPTIONS[2]}
          defaultSelectedOptions={[GALLERY_SORT_OPTIONS[2]]}
          aria-label="Sort by"
          onOptionSelect={onSortSelect}
        >
          {GALLERY_SORT_OPTIONS.map((option) => (
            <Option key={option}>{option}</Option>
          ))}
        </Combobox>
      </div>
    </div>
  );
}

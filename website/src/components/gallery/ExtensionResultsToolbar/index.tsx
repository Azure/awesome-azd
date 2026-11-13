/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import {
  Dropdown,
  Label,
  Option,
  Text,
  type DropdownProps,
} from "@fluentui/react-components";
import { EXTENSION_SORT_OPTIONS } from "@site/src/utils/gallerySorting";
import { ExtensionSearchBox } from "../ExtensionGalleryHeader";
import styles from "./styles.module.css";

export function ExtensionResultsStatus({
  totalItems,
  startIndex,
  endIndex,
}: {
  totalItems: number;
  startIndex: number;
  endIndex: number;
}): React.JSX.Element {
  const currentStart = totalItems > 0 ? startIndex + 1 : 0;
  const currentEnd = Math.min(endIndex, totalItems);
  const countLabel =
    totalItems === 0
      ? "0 extensions"
      : totalItems === 1
        ? "1 extension"
        : `${currentStart}–${currentEnd} of ${totalItems} extensions`;

  return (
    <Text
      className={styles.viewingStatus}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      size={300}
    >
      {countLabel}
    </Text>
  );
}

export default function ExtensionResultsToolbar({
  selectedSortOptions,
  onSortSelect,
}: {
  selectedSortOptions: string[];
  onSortSelect: NonNullable<DropdownProps["onOptionSelect"]>;
}): React.JSX.Element {
  const selectedSort =
    selectedSortOptions[0] ?? EXTENSION_SORT_OPTIONS[2];

  return (
    <div className={styles.discoveryBar}>
      <div className={styles.searchGroup}>
        <ExtensionSearchBox />
      </div>
      <div className={styles.sortControls}>
        <Label
          htmlFor="extension-sort"
          id="extension-sort-label"
          size="small"
          weight="semibold"
          className={styles.sortLabel}
        >
          Sort by
        </Label>
        <Dropdown
          id="extension-sort"
          className={styles.sortControl}
          appearance="outline"
          selectedOptions={[selectedSort]}
          value={selectedSort}
          aria-labelledby="extension-sort-label"
          onOptionSelect={onSortSelect}
        >
          {EXTENSION_SORT_OPTIONS.map((option) => (
            <Option key={option}>{option}</Option>
          ))}
        </Dropdown>
      </div>
    </div>
  );
}

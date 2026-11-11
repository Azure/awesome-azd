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
import { GALLERY_SORT_OPTIONS } from "@site/src/utils/gallerySorting";
import { GallerySearchBox } from "../ShowcaseTemplateSearch";
import styles from "./styles.module.css";

export function ShowcaseResultsStatus({
  totalItems,
  startIndex,
  endIndex,
  isExtensions,
  searchName,
}: {
  totalItems: number;
  startIndex: number;
  endIndex: number;
  isExtensions: boolean;
  searchName: string | null;
}): React.JSX.Element {
  const currentStart = totalItems > 0 ? startIndex + 1 : 0;
  const currentEnd = Math.min(endIndex, totalItems);
  const itemLabel = isExtensions ? "extension" : "template";
  const itemLabelPlural = isExtensions ? "extensions" : "templates";
  const countLabel =
    totalItems === 0
      ? `0 ${itemLabelPlural}`
      : totalItems === 1
        ? `1 ${itemLabel}`
        : `${currentStart}-${currentEnd} of ${totalItems} ${itemLabelPlural}`;
  const searchLabel = searchName != null ? ` for '${searchName}'` : "";

  return (
    <Text
      className={styles.viewingStatus}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      size={300}
    >
      Viewing {countLabel}
      {searchLabel}
    </Text>
  );
}

export default function ShowcaseResultsToolbar({
  selectedOptions,
  onSortSelect,
}: {
  selectedOptions: string[];
  onSortSelect: NonNullable<DropdownProps["onOptionSelect"]>;
}): React.JSX.Element {
  const selectedSort = selectedOptions[0] ?? GALLERY_SORT_OPTIONS[2];

  return (
    <div className={styles.discoveryBar}>
      <div className={styles.searchGroup}>
        <GallerySearchBox />
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
          {GALLERY_SORT_OPTIONS.map((option) => (
            <Option key={option}>{option}</Option>
          ))}
        </Dropdown>
      </div>
    </div>
  );
}

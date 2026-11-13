/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from "@fluentui/react-components";
import type { Location } from "history";
import { Tags, type TagType } from "../../../data/tags";
import ShowcaseTagSelect from "../ShowcaseTagSelect";
import styles from "./styles.module.css";

type ExtensionFilterSectionProps = {
  tags: TagType[];
  activeTags: TagType[];
  selectedTags: TagType[];
  location: Location;
  tagCounts?: Record<string, number>;
};

export default function ExtensionFilterSection({
  title,
  value,
  tags,
  activeTags,
  selectedTags,
  location,
  tagCounts,
}: ExtensionFilterSectionProps & { title: string; value: string }) {
  const visibleTags = tags.filter(
    (tag) => activeTags.includes(tag) || selectedTags.includes(tag),
  );

  return (
    <AccordionItem value={value} className={styles.categoryItem}>
      <AccordionHeader
        className={styles.categoryHeader}
        expandIconPosition="end"
      >
        <div className={styles.categoryTitle}>
          {title}
          <span className={styles.filterCount}>{visibleTags.length}</span>
        </div>
        <span
          aria-hidden="true"
          className={styles.categoryToggle}
          data-testid="filter-toggle-symbol"
        />
      </AccordionHeader>
      <AccordionPanel className={styles.categoryPanel}>
        {visibleTags.map((tag) => (
          <ShowcaseTagSelect
            key={`showcase_checkbox_key_${tag}`}
            id={`showcase_checkbox_id_${tag}`}
            tag={tag}
            label={Tags[tag].label}
            activeTags={activeTags}
            selectedTags={selectedTags}
            location={location}
            count={tagCounts?.[tag]}
          />
        ))}
      </AccordionPanel>
    </AccordionItem>
  );
}

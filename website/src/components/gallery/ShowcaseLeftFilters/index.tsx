/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { useHistory } from "@docusaurus/router";
import {
  Accordion,
  Button,
  type AccordionToggleEventHandler,
} from "@fluentui/react-components";
import type { Location } from "history";
import { unsortedExtensions } from "../../../data/extensions";
import { Tags, type TagType } from "../../../data/tags";
import { captureGalleryNavigationState } from "../../../utils/galleryNavigation";
import { getExtensionTags } from "../../../utils/galleryTags";
import { clearSearchFilters } from "../../../utils/galleryQuery";
import ShowcaseTagSelect from "../ShowcaseTagSelect";
import ShowcaseFilterSection from "./ShowcaseFilterSection";
import styles from "./styles.module.css";

const hiddenCollectionTags = new Set<string>([
  "new",
  "popular",
  "aicollection",
  "msft",
]);
const sortedTags = (Object.keys(Tags) as TagType[]).sort();
const tagCounts = unsortedExtensions.reduce<Record<string, number>>(
  (counts, extension) => {
    getExtensionTags(extension).forEach((tag) => {
      counts[tag] = (counts[tag] ?? 0) + 1;
    });
    return counts;
  },
  {},
);
const collectionTags = sortedTags.filter(
  (tag) =>
    Tags[tag].type === undefined &&
    !hiddenCollectionTags.has(tag) &&
    (tagCounts[tag] ?? 0) > 0,
);
const capabilityTags = sortedTags.filter(
  (tag) => Tags[tag].type === "Extension Capability",
);

export default function ShowcaseLeftFilters({
  activeTags,
  location,
  selectedTags,
  selectedAuthors,
}: {
  activeTags: TagType[];
  location: Location;
  selectedTags: TagType[];
  selectedAuthors: string[];
}) {
  const [openItems, setOpenItems] = React.useState<string[]>(["9"]);
  const history = useHistory();
  const handleToggle: AccordionToggleEventHandler<string> = (_event, data) => {
    setOpenItems(data.openItems);
  };
  const clearAll = () => {
    history.push({
      ...location,
      search: clearSearchFilters(location.search),
      state: captureGalleryNavigationState(),
    });
  };

  return (
    <Accordion
      className={styles.filterAccordion}
      openItems={openItems}
      onToggle={handleToggle}
      multiple
      collapsible
    >
      <div className={styles.filterCollections}>
        <div className={styles.filterTop}>
          <h2 className={styles.filterBy}>Filter extensions</h2>
          {selectedTags.length > 0 || selectedAuthors.length > 0 ? (
            <Button
              appearance="transparent"
              size="small"
              className={styles.clearAll}
              onClick={clearAll}
            >
              Clear all
            </Button>
          ) : null}
        </div>
        {collectionTags.map((tag) => (
          <div
            key={`showcase_checkbox_key_${tag}`}
            className={`${styles.checkboxListItem} ${styles.curatedCheckbox}`}
          >
            <ShowcaseTagSelect
              id={`showcase_checkbox_id_${tag}`}
              tag={tag}
              label={Tags[tag].label}
              activeTags={activeTags}
              selectedTags={selectedTags}
              location={location}
              count={tagCounts[tag]}
            />
          </div>
        ))}
      </div>
      {capabilityTags.length > 0 ? (
        <ShowcaseFilterSection
          title="Capabilities"
          value="9"
          tags={capabilityTags}
          activeTags={activeTags}
          selectedTags={selectedTags}
          location={location}
          tagCounts={tagCounts}
        />
      ) : null}
    </Accordion>
  );
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import ShowcaseTagSelect from "../ShowcaseTagSelect";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  type AccordionToggleEventHandler,
} from "@fluentui/react-components";
import type { Location } from "history";
import { Tags, type TagType } from "../../../data/tags";
import styles from "./styles.module.css";
import { useColorMode } from "@docusaurus/theme-common";

type FilterTagOptionsProps = {
  tags: TagType[];
  activeTags: TagType[];
  selectedTags: TagType[];
  location: Location;
  tagCounts?: Record<string, number>;
};

function ShowcaseFilterViewAll({
  tags,
  sectionValue,
  activeTags,
  selectedTags,
  location,
  tagCounts,
}: FilterTagOptionsProps & { sectionValue: string }) {
  const [openItems, setOpenItems] = React.useState(["0"]);
  const handleToggle: AccordionToggleEventHandler<string> = (_event, data) => {
    setOpenItems(data.openItems);
  };
  const { colorMode } = useColorMode();
  const chevronIcon = useBaseUrl(
    colorMode != "dark" ? "/img/smallChevron.svg" : "/img/smallChevronDark.svg"
  );
  const chevronDownSmall = (
    <img src={chevronIcon} width={16} height={16} alt="" />
  );
  const chevronUpSmall = (
    <img
      className={styles.chevronUp}
      src={chevronIcon}
      width={16} height={16} alt=""
    />
  );
  const viewAllValue = sectionValue + "2";
  return (
    <>
      {tags.slice(0, 6).map((tag, index) => {
        const tagObject = Tags[tag];
        const key = `showcase_checkbox_key_${tag}`;
        const id = `showcase_checkbox_id_${tag}`;

        return index == tags.length - 1 ? (
          <div
            key={key}
            className={`${styles.checkboxListItem} ${styles.lastCheckbox}`}
          >
            <ShowcaseTagSelect
              id={id}
              tag={tag}
              label={tagObject.label}
              activeTags={activeTags}
              selectedTags={selectedTags}
              location={location}
              count={tagCounts?.[tag]}
            />
          </div>
        ) : (
          <div key={key} className={styles.checkboxListItem}>
            <ShowcaseTagSelect
              id={id}
              tag={tag}
              label={tagObject.label}
              activeTags={activeTags}
              selectedTags={selectedTags}
              location={location}
              count={tagCounts?.[tag]}
            />
          </div>
        );
      })}
      {tags.length > 6 ? (
        <Accordion
          openItems={openItems}
          onToggle={handleToggle}
          multiple
          collapsible
        >
          <AccordionItem value={viewAllValue} className={styles.viewAllItem}>
            <AccordionPanel className={styles.viewAllPanel}>
              {tags.slice(6, tags.length).map((tag) => {
                const tagObject = Tags[tag];
                const key = `showcase_checkbox_key_${tag}`;
                const id = `showcase_checkbox_id_${tag}`;

                return (
                  <div key={key} className={styles.checkboxListItem}>
                    <ShowcaseTagSelect
                      id={id}
                      tag={tag}
                      label={tagObject.label}
                      activeTags={activeTags}
                      selectedTags={selectedTags}
                      location={location}
                      count={tagCounts?.[tag]}
                    />
                  </div>
                );
              })}
            </AccordionPanel>
            <AccordionHeader
              inline={true}
              expandIconPosition="end"
              expandIcon={
                openItems.includes(viewAllValue) ? chevronUpSmall : chevronDownSmall
              }
            >
              <div className={`${styles.color} ${styles.viewAllLabel}`}>
                View All
              </div>
            </AccordionHeader>
          </AccordionItem>
        </Accordion>
      ) : null}
    </>
  );
}

export default function ShowcaseFilterSection({
  title,
  value,
  tags,
  ...filterProps
}: FilterTagOptionsProps & { title: string; value: string }) {
  return (
    <AccordionItem value={value}>
      <AccordionHeader
        className={styles.categoryHeader}
        expandIconPosition="end"
      >
        <div className={styles.categoryTitle}>
          {title}
          <span className={styles.filterCount}>{tags.length}</span>
        </div>
      </AccordionHeader>
      <AccordionPanel>
        <ShowcaseFilterViewAll tags={tags} sectionValue={value} {...filterProps} />
      </AccordionPanel>
    </AccordionItem>
  );
}

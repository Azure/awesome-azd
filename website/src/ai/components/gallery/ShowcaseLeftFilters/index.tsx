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
  AccordionToggleEventHandler,
  Title3,
  Image
} from "@fluentui/react-components";
import { Tags, type TagType } from "../../../data/tags";
import { sortedTagList } from "../../../data/templates";
import styles from "./styles.module.css";

const languageTags = sortedTagList.filter(
  (tag) => Tags[tag].type === "Language",
);
const collectionTags = sortedTagList.filter(
  (tag) =>
    Tags[tag].type === "Collection" && Tags[tag].label !== "DeepSeek AI",
);
const modelTags = sortedTagList.filter(
  (tag) =>
    Tags[tag].type === "Model" && Tags[tag].label !== "DeepSeek R1",
);
const taskTags = sortedTagList.filter((tag) => Tags[tag].type === "Task");
const databaseTags = sortedTagList.filter(
  (tag) => Tags[tag].type === "Database",
);

function ShowcaseFilterViewAll({
  tags,
  number,
  activeTags,
  selectedTags,
}: {
  tags: TagType[];
  number: string;
  activeTags: TagType[];
  selectedTags: TagType[];
}) {
  const [openItems, setOpenItems] = React.useState(["0"]);
  const handleToggle: AccordionToggleEventHandler<string> = (_event, data) => {
    setOpenItems(data.openItems);
  };
  const chevronDownSmall = <Image src={useBaseUrl("/img/ai/smallChevron.svg")} alt="chevron" />;
  const chevronUpSmall =
    <Image
      style={{ transform: "rotate(180deg)" }
      }
      src={useBaseUrl("/img/ai/smallChevron.svg")}
      alt="chevron"
    />;
  const value = number + "2";
  return (
    <>
      {tags.slice(0, 6).map((tag, index) => {
        const tagObject = Tags[tag];
        const key = `showcase_checkbox_key_${tag}`;
        const id = `showcase_checkbox_id_${tag}`;

        return index == tags.length - 1 ? (
          <div
            key={key}
            className={styles.checkboxListItem}
            style={{ marginBottom: "7px" }}
          >
            <ShowcaseTagSelect
              id={id}
              tag={tag}
              label={tagObject.label}
              activeTags={activeTags}
              selectedTags={selectedTags}
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
            />
          </div>
        );
      })}
      {tags.length > 5 ? (
        <Accordion
          openItems={openItems}
          onToggle={handleToggle}
          multiple
          collapsible
        >
          <AccordionItem value={value} className={styles.accordionItem}>
            <AccordionPanel className={styles.accordionPanel}>
              {tags.slice(6, tags.length).map((tag) => {
                const tagObject = Tags[tag];
                const id = `showcase_checkbox_id_${tag}`;
                const key = `showcase_checkbox_key_${tag}`;

                return (
                  <div key={key} className={styles.checkboxListItem}>
                    <ShowcaseTagSelect
                      id={id}
                      tag={tag}
                      label={tagObject.label}
                      activeTags={activeTags}
                      selectedTags={selectedTags}
                    />
                  </div>
                );
              })}
            </AccordionPanel>
            <AccordionHeader
              inline={true}
              expandIconPosition="end"
              expandIcon={
                openItems.includes(value) ? chevronUpSmall : chevronDownSmall
              }
            >
              <div className={styles.viewAll} >
                View All
              </div>
            </AccordionHeader>
          </AccordionItem>
        </Accordion>
      ) : null}
    </>
  );
}

export default function ShowcaseLeftFilters({
  activeTags,
  selectedTags,
}: {
  activeTags: TagType[];
  selectedTags: TagType[];
}) {
  const [openItems, setOpenItems] = React.useState([
    "1",
    "2",
    "3",
    "4",
    "5"
  ]);
  const handleToggle: AccordionToggleEventHandler<string> = (_event, data) => {
    setOpenItems(data.openItems);
  };

  return (
    <Accordion
      openItems={openItems}
      onToggle={handleToggle}
      multiple
      collapsible
    >
      <div className={styles.filterBy}>
        <h2 className={styles.heading}><Title3>Filter by</Title3></h2>
      </div>
      <AccordionItem value="1">
        <AccordionHeader expandIconPosition="end">
          <div className={styles.tagCatalog} data-m='{\"id\":\"Task\",\"cN\":\"Tags Category\"}'>Task</div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={taskTags}
            number={"1"}
            activeTags={activeTags}
            selectedTags={selectedTags}
          />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="2">
        <AccordionHeader expandIconPosition="end" className={styles.tagCatalogBackground}>
          <div className={styles.tagCatalog} data-m='{\"id\":\"Language\",\"cN\":\"Tags Category\"}'>Language</div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={languageTags}
            number={"2"}
            activeTags={activeTags}
            selectedTags={selectedTags}
          />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="3">
        <AccordionHeader expandIconPosition="end" className={styles.tagCatalogBackground}>
          <div className={styles.tagCatalog} data-m='{\"id\":\"Task\",\"cN\":\"Tags Category\"}'>Collection</div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={collectionTags}
            number={"3"}
            activeTags={activeTags}
            selectedTags={selectedTags}
          />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="4">
        <AccordionHeader expandIconPosition="end" className={styles.tagCatalogBackground}>
          <div className={styles.tagCatalog} data-m='{\"id\":\"Model\",\"cN\":\"Tags Category\"}'>Model</div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={modelTags}
            number={"4"}
            activeTags={activeTags}
            selectedTags={selectedTags}
          />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="5">
        <AccordionHeader expandIconPosition="end" className={styles.tagCatalogBackground}>
          <div className={styles.tagCatalog} data-m='{\"id\":\"Database\",\"cN\":\"Tags Category\"}'>Database</div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={databaseTags}
            number={"5"}
            activeTags={activeTags}
            selectedTags={selectedTags}
          />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

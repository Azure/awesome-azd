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
} from "@fluentui/react-components";
import { Tags, type TagType } from "../../../data/tags";
import { TagList } from "../../../data/users";
import styles from "./styles.module.css";
import { useColorMode } from "@docusaurus/theme-common";
import { useHistory } from "@docusaurus/router";
import { prepareUserState } from "@site/src/pages/index";
import { UserState } from "../ShowcaseTemplateSearch";

function ShowcaseFilterViewAll({
  tags,
  number,
  activeTags,
  selectedCheckbox,
  setSelectedCheckbox,
  location,
  readSearchTags,
  replaceSearchTags,
}: {
  tags: TagType[];
  number: string;
  activeTags: TagType[];
  selectedCheckbox: TagType[];
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  location;
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
}) {
  const [openItems, setOpenItems] = React.useState(["0"]);
  const handleToggle: AccordionToggleEventHandler<string> = (event, data) => {
    setOpenItems(data.openItems);
  };
  const { colorMode } = useColorMode();
  const chevronDownSmall =
    colorMode != "dark" ? (
      <img src={useBaseUrl("/img/smallChevron.svg")} />
    ) : (
      <img src={useBaseUrl("/img/smallChevronDark.svg")} />
    );
  const chevronUpSmall =
    colorMode != "dark" ? (
      <img
        style={{ transform: "rotate(180deg)" }}
        src={useBaseUrl("/img/smallChevron.svg")}
      />
    ) : (
      <img
        style={{ transform: "rotate(180deg)" }}
        src={useBaseUrl("/img/smallChevronDark.svg")}
      />
    );
  let value = number + "2";
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
              selectedCheckbox={selectedCheckbox}
              setSelectedCheckbox={setSelectedCheckbox}
              location={location}
              readSearchTags={readSearchTags}
              replaceSearchTags={replaceSearchTags}
            />
          </div>
        ) : (
          <div key={key} className={styles.checkboxListItem}>
            <ShowcaseTagSelect
              id={id}
              tag={tag}
              label={tagObject.label}
              activeTags={activeTags}
              selectedCheckbox={selectedCheckbox}
              setSelectedCheckbox={setSelectedCheckbox}
              location={location}
              readSearchTags={readSearchTags}
              replaceSearchTags={replaceSearchTags}
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
          <AccordionItem value={value} style={{ padding: "0px" }}>
            <AccordionPanel style={{ margin: "0px" }}>
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
                      selectedCheckbox={selectedCheckbox}
                      setSelectedCheckbox={setSelectedCheckbox}
                      location={location}
                      readSearchTags={readSearchTags}
                      replaceSearchTags={replaceSearchTags}
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
              <div
                style={{
                  fontSize: "12px",
                }}
                className={styles.color}
              >
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
  selectedCheckbox,
  setSelectedCheckbox,
  location,
  selectedTags,
  setSelectedTags,
  readSearchTags,
  replaceSearchTags,
}: {
  activeTags: TagType[];
  selectedCheckbox: TagType[];
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  location;
  selectedTags: TagType[];
  setSelectedTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
}) {
  const sortTagList = TagList.sort();
  const uncategoryTag = TagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === undefined;
  });
  const languageTag = sortTagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Language";
  });
  const frameworkTag = sortTagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Framework";
  });
  const servicesTag = sortTagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Service";
  });
  const databaseTag = sortTagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Database";
  });
  const infrastructureAsCodeTag = sortTagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Infrastructure as Code";
  });
  const otherTag = sortTagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Tools";
  });
  const topicTag = sortTagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Topic";
  });
  const [openItems, setOpenItems] = React.useState([]);
  const handleToggle: AccordionToggleEventHandler<string> = (event, data) => {
    setOpenItems(data.openItems);
  };
  const history = useHistory();
  const searchParams = new URLSearchParams(location.search);
  const clearAll = () => {
    setSelectedCheckbox([]);
    setSelectedTags([]);
    searchParams.delete("tags");
    history.push({
      ...location,
      search: searchParams.toString(),
      state: prepareUserState(),
    });
  };
  return (
    <Accordion
      openItems={openItems}
      onToggle={handleToggle}
      multiple
      collapsible
    >
      <div style={{ paddingBottom: "7px" }}>
        <div className={styles.filterTop}>
          <div className={styles.filterBy}>Filter by</div>
          {selectedTags.length > 0 ? (
            <div className={styles.clearAll} onClick={clearAll}>
              Clear all
            </div>
          ) : null}
        </div>
        {uncategoryTag.map((tag) => {
          const tagObject = Tags[tag];
          const key = `showcase_checkbox_key_${tag}`;
          const id = `showcase_checkbox_id_${tag}`;

          return (
            <div
              key={key}
              className={styles.checkboxListItem}
              style={{ paddingLeft: "12px" }}
            >
              <ShowcaseTagSelect
                id={id}
                tag={tag}
                label={tagObject.label}
                activeTags={activeTags}
                selectedCheckbox={selectedCheckbox}
                setSelectedCheckbox={setSelectedCheckbox}
                location={location}
                readSearchTags={readSearchTags}
                replaceSearchTags={replaceSearchTags}
              />
            </div>
          );
        })}
      </div>
      <AccordionItem value="1">
        <AccordionHeader
          expandIconPosition="end"
          style={{
            background:
              "linear-gradient(#D1D1D1 0 0) top /89.8% 0.6px no-repeat",
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: "500" }}>Language</div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={languageTag}
            number={"1"}
            activeTags={activeTags}
            selectedCheckbox={selectedCheckbox}
            setSelectedCheckbox={setSelectedCheckbox}
            location={location}
            readSearchTags={readSearchTags}
            replaceSearchTags={replaceSearchTags}
          />
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem value="2">
        <AccordionHeader
          expandIconPosition="end"
          style={{
            background:
              "linear-gradient(#D1D1D1 0 0) top /89.8% 0.6px no-repeat",
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: "500" }}>Framework</div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={frameworkTag}
            number={"2"}
            activeTags={activeTags}
            selectedCheckbox={selectedCheckbox}
            setSelectedCheckbox={setSelectedCheckbox}
            location={location}
            readSearchTags={readSearchTags}
            replaceSearchTags={replaceSearchTags}
          />
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem value="3">
        <AccordionHeader
          expandIconPosition="end"
          style={{
            background:
              "linear-gradient(#D1D1D1 0 0) top /89.8% 0.6px no-repeat",
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: "500" }}>Services</div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={servicesTag}
            number={"3"}
            activeTags={activeTags}
            selectedCheckbox={selectedCheckbox}
            setSelectedCheckbox={setSelectedCheckbox}
            location={location}
            readSearchTags={readSearchTags}
            replaceSearchTags={replaceSearchTags}
          />
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem value="4">
        <AccordionHeader
          expandIconPosition="end"
          style={{
            background:
              "linear-gradient(#D1D1D1 0 0) top /89.8% 0.6px no-repeat",
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: "500" }}>Database</div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={databaseTag}
            number={"4"}
            activeTags={activeTags}
            selectedCheckbox={selectedCheckbox}
            setSelectedCheckbox={setSelectedCheckbox}
            location={location}
            readSearchTags={readSearchTags}
            replaceSearchTags={replaceSearchTags}
          />
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem value="5">
        <AccordionHeader
          expandIconPosition="end"
          style={{
            background:
              "linear-gradient(#D1D1D1 0 0) top /89.8% 0.6px no-repeat",
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: "500" }}>
            Infrastructure as Code
          </div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={infrastructureAsCodeTag}
            number={"5"}
            activeTags={activeTags}
            selectedCheckbox={selectedCheckbox}
            setSelectedCheckbox={setSelectedCheckbox}
            location={location}
            readSearchTags={readSearchTags}
            replaceSearchTags={replaceSearchTags}
          />
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem value="6">
        <AccordionHeader
          expandIconPosition="end"
          style={{
            background:
              "linear-gradient(#D1D1D1 0 0) top /89.8% 0.6px no-repeat",
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: "500" }}>Tools</div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={otherTag}
            number={"6"}
            activeTags={activeTags}
            selectedCheckbox={selectedCheckbox}
            setSelectedCheckbox={setSelectedCheckbox}
            location={location}
            readSearchTags={readSearchTags}
            replaceSearchTags={replaceSearchTags}
          />
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem value="7">
        <AccordionHeader
          expandIconPosition="end"
          style={{
            background:
              "linear-gradient(#D1D1D1 0 0) top /89.8% 0.6px no-repeat",
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: "500" }}>Topic</div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={topicTag}
            number={"7"}
            activeTags={activeTags}
            selectedCheckbox={selectedCheckbox}
            setSelectedCheckbox={setSelectedCheckbox}
            location={location}
            readSearchTags={readSearchTags}
            replaceSearchTags={replaceSearchTags}
          />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

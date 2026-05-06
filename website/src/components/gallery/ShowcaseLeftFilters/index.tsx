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
import { TagList, unsortedUsers } from "../../../data/users";
import { unsortedExtensions } from "../../../data/extensions";
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
  tagCounts,
}: {
  tags: TagType[];
  number: string;
  activeTags: TagType[];
  selectedCheckbox: TagType[];
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  location;
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
  tagCounts?: Record<string, number>;
}) {
  const [openItems, setOpenItems] = React.useState(["0"]);
  const handleToggle: AccordionToggleEventHandler<string> = (event, data) => {
    setOpenItems(data.openItems);
  };
  const { colorMode } = useColorMode();
  const chevronDownSmall =
    colorMode != "dark" ? (
      <img src={useBaseUrl("/img/smallChevron.svg")} width={16} height={16} alt="" />
    ) : (
      <img src={useBaseUrl("/img/smallChevronDark.svg")} width={16} height={16} alt="" />
    );
  const chevronUpSmall =
    colorMode != "dark" ? (
      <img
        style={{ transform: "rotate(180deg)" }}
        src={useBaseUrl("/img/smallChevron.svg")}
        width={16} height={16} alt=""
      />
    ) : (
      <img
        style={{ transform: "rotate(180deg)" }}
        src={useBaseUrl("/img/smallChevronDark.svg")}
        width={16} height={16} alt=""
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
              selectedCheckbox={selectedCheckbox}
              setSelectedCheckbox={setSelectedCheckbox}
              location={location}
              readSearchTags={readSearchTags}
              replaceSearchTags={replaceSearchTags}
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
  activeAuthors,
  selectedAuthors,
  selectedAuthorCheckbox,
  setSelectedAuthorCheckbox,
  setSelectedAuthors,
  readSearchAuthors,
  replaceSearchAuthors,
}: {
  activeTags: TagType[];
  selectedCheckbox: TagType[];
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  location;
  selectedTags: TagType[];
  setSelectedTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
  activeAuthors: string[];
  selectedAuthors: string[];
  selectedAuthorCheckbox: string[];
  setSelectedAuthorCheckbox: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedAuthors: React.Dispatch<React.SetStateAction<string[]>>;
  readSearchAuthors: (search: string) => string[];
  replaceSearchAuthors: (search: string, newAuthors: string[]) => string;
}) {
  const sortTagList = TagList.sort();
  const searchParams = new URLSearchParams(location.search);
  const isExtensions = searchParams.get("type") === "extensions";
  
  // Compute template counts per tag for display
  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    const items = isExtensions ? unsortedExtensions : unsortedUsers;
    items.forEach((item) => {
      let allTags: TagType[];
      if (isExtensions) {
        const ext = item as any;
        allTags = [...ext.tags, ...ext.capabilities.map((c: string) => ("ext-" + c) as TagType)];
      } else {
        const user = item as any;
        allTags = [
          ...(user.tags || []),
          ...(user.languages || []),
          ...(user.frameworks || []),
          ...(user.azureServices || []),
          ...(user.IaC || []),
        ];
      }
      allTags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [isExtensions]);

  // Extract unique authors based on content type
  const MIN_TEMPLATE_COUNT = 3;
  const applyMinCountThreshold = React.useCallback(
    (tags: TagType[]): TagType[] =>
      tags.filter(
        (tag) => (tagCounts?.[tag] ?? 0) >= MIN_TEMPLATE_COUNT || selectedTags.includes(tag),
      ),
    [tagCounts, selectedTags],
  );

  const uncategoryTag = TagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === undefined;
  });
  const languageTag = applyMinCountThreshold(
    sortTagList.filter((tag) => Tags[tag].type === "Language"),
  );
  const frameworkTag = applyMinCountThreshold(
    sortTagList.filter((tag) => Tags[tag].type === "Framework"),
  );
  const servicesTag = applyMinCountThreshold(
    sortTagList.filter((tag) => Tags[tag].type === "Service"),
  );
  const databaseTag = applyMinCountThreshold(
    sortTagList.filter((tag) => Tags[tag].type === "Database"),
  );
  const infrastructureAsCodeTag = applyMinCountThreshold(
    sortTagList.filter((tag) => Tags[tag].type === "Infrastructure as Code"),
  );
  const otherTag = applyMinCountThreshold(
    sortTagList.filter((tag) => Tags[tag].type === "Tools"),
  );
  const topicTag = applyMinCountThreshold(
    sortTagList.filter((tag) => Tags[tag].type === "Topic"),
  );
  const extensionCapabilityTag = sortTagList.filter(
    (tag) => Tags[tag].type === "Extension Capability",
  );
  const [openItems, setOpenItems] = React.useState([]);
  const handleToggle: AccordionToggleEventHandler<string> = (event, data) => {
    setOpenItems(data.openItems);
  };
  const history = useHistory();
  const clearAll = () => {
    setSelectedCheckbox([]);
    setSelectedTags([]);
    setSelectedAuthorCheckbox([]);
    setSelectedAuthors([]);
    searchParams.delete("tags");
    searchParams.delete("authors");
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
          {selectedTags.length > 0 || selectedAuthors.length > 0 ? (
            <div className={styles.clearAll} onClick={clearAll} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); clearAll(); } }}>
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
                count={tagCounts?.[tag]}
              />
            </div>
          );
        })}
      </div>
      {!isExtensions && (
        <>
          {languageTag.length > 0 && (
            <AccordionItem value="1">
              <AccordionHeader
                className={styles.categoryHeader}
                expandIconPosition="end"
                style={{
                  background:
                    "linear-gradient(#D1D1D1 0 0) top /89.8% 0.6px no-repeat",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: "500" }}>
                  Language
                  <span className={styles.filterCount}>{languageTag.length}</span>
                </div>
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
                  tagCounts={tagCounts}
                />
              </AccordionPanel>
            </AccordionItem>
          )}

          {frameworkTag.length > 0 && (
            <AccordionItem value="2">
              <AccordionHeader
                className={styles.categoryHeader}
                expandIconPosition="end"
                style={{
                  background:
                    "linear-gradient(#D1D1D1 0 0) top /89.8% 0.6px no-repeat",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: "500" }}>
                  Framework
                  <span className={styles.filterCount}>{frameworkTag.length}</span>
                </div>
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
                  tagCounts={tagCounts}
                />
              </AccordionPanel>
            </AccordionItem>
          )}

          {servicesTag.length > 0 && (
            <AccordionItem value="3">
              <AccordionHeader
                className={styles.categoryHeader}
                expandIconPosition="end"
                style={{
                  background:
                    "linear-gradient(#D1D1D1 0 0) top /89.8% 0.6px no-repeat",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: "500" }}>
                  Services
                  <span className={styles.filterCount}>{servicesTag.length}</span>
                </div>
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
                  tagCounts={tagCounts}
                />
              </AccordionPanel>
            </AccordionItem>
          )}

          {databaseTag.length > 0 && (
            <AccordionItem value="4">
              <AccordionHeader
                className={styles.categoryHeader}
                expandIconPosition="end"
                style={{
                  background:
                    "linear-gradient(#D1D1D1 0 0) top /89.8% 0.6px no-repeat",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: "500" }}>
                  Database
                  <span className={styles.filterCount}>{databaseTag.length}</span>
                </div>
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
                  tagCounts={tagCounts}
                />
              </AccordionPanel>
            </AccordionItem>
          )}

          {otherTag.length > 0 && (
            <AccordionItem value="5">
              <AccordionHeader
                className={styles.categoryHeader}
                expandIconPosition="end"
                style={{
                  background:
                    "linear-gradient(#D1D1D1 0 0) top /89.8% 0.6px no-repeat",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: "500" }}>
                  Tools
                  <span className={styles.filterCount}>{otherTag.length}</span>
                </div>
              </AccordionHeader>
              <AccordionPanel>
                <ShowcaseFilterViewAll
                  tags={otherTag}
                  number={"5"}
                  activeTags={activeTags}
                  selectedCheckbox={selectedCheckbox}
                  setSelectedCheckbox={setSelectedCheckbox}
                  location={location}
                  readSearchTags={readSearchTags}
                  replaceSearchTags={replaceSearchTags}
                  tagCounts={tagCounts}
                />
              </AccordionPanel>
            </AccordionItem>
          )}

          {infrastructureAsCodeTag.length > 0 && (
            <AccordionItem value="6">
              <AccordionHeader
                className={styles.categoryHeader}
                expandIconPosition="end"
                style={{
                  background:
                    "linear-gradient(#D1D1D1 0 0) top /89.8% 0.6px no-repeat",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: "500" }}>
                  Infrastructure as Code
                  <span className={styles.filterCount}>{infrastructureAsCodeTag.length}</span>
                </div>
              </AccordionHeader>
              <AccordionPanel>
                <ShowcaseFilterViewAll
                  tags={infrastructureAsCodeTag}
                  number={"6"}
                  activeTags={activeTags}
                  selectedCheckbox={selectedCheckbox}
                  setSelectedCheckbox={setSelectedCheckbox}
                  location={location}
                  readSearchTags={readSearchTags}
                  replaceSearchTags={replaceSearchTags}
                  tagCounts={tagCounts}
                />
              </AccordionPanel>
            </AccordionItem>
          )}

          {topicTag.length > 0 && (
            <AccordionItem value="7">
              <AccordionHeader
                className={styles.categoryHeader}
                expandIconPosition="end"
                style={{
                  background:
                    "linear-gradient(#D1D1D1 0 0) top /89.8% 0.6px no-repeat",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: "500" }}>
                  Topic
                  <span className={styles.filterCount}>{topicTag.length}</span>
                </div>
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
                  tagCounts={tagCounts}
                />
              </AccordionPanel>
            </AccordionItem>
          )}
        </>
      )}

      {/* Extension Capabilities filter hidden pending release
      {isExtensions && extensionCapabilityTag.length > 0 && (
        <AccordionItem value="9">
          <AccordionHeader
            expandIconPosition="end"
            style={{
              background:
                "linear-gradient(#D1D1D1 0 0) top /89.8% 0.6px no-repeat",
            }}
          >
            <div style={{ fontSize: "16px", fontWeight: "500" }}>
              Extension Capabilities
            </div>
          </AccordionHeader>
          <AccordionPanel>
            <ShowcaseFilterViewAll
              tags={extensionCapabilityTag}
              number={"9"}
              activeTags={activeTags}
              selectedCheckbox={selectedCheckbox}
              setSelectedCheckbox={setSelectedCheckbox}
              location={location}
              readSearchTags={readSearchTags}
              replaceSearchTags={replaceSearchTags}
              tagCounts={tagCounts}
            />
          </AccordionPanel>
        </AccordionItem>
      )}
      */}
    </Accordion>
  );
}

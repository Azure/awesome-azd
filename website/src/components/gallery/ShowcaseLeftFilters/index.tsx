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
import { prepareUserState } from "@site/src/utils/galleryNavigation";
import { getContentType } from "@site/src/utils/contentType";
import { getTemplateTags, getExtensionTags } from "@site/src/utils/galleryTags";
import { clearSearchFilters } from "@site/src/utils/galleryQuery";

function ShowcaseFilterViewAll({
  tags,
  number,
  activeTags,
  selectedTags,
  location,
  readSearchTags,
  replaceSearchTags,
  tagCounts,
}: {
  tags: TagType[];
  number: string;
  activeTags: TagType[];
  selectedTags: TagType[];
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
        className={styles.chevronUp}
        src={useBaseUrl("/img/smallChevron.svg")}
        width={16} height={16} alt=""
      />
    ) : (
      <img
        className={styles.chevronUp}
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
            className={`${styles.checkboxListItem} ${styles.lastCheckbox}`}
          >
            <ShowcaseTagSelect
              id={id}
              tag={tag}
              label={tagObject.label}
              activeTags={activeTags}
              selectedTags={selectedTags}
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
              selectedTags={selectedTags}
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
          <AccordionItem value={value} className={styles.viewAllItem}>
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

export default function ShowcaseLeftFilters({
  activeTags,
  location,
  selectedTags,
  readSearchTags,
  replaceSearchTags,
  selectedAuthors,
  readSearchAuthors,
  replaceSearchAuthors,
}: {
  activeTags: TagType[];
  location;
  selectedTags: TagType[];
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
  selectedAuthors: string[];
  readSearchAuthors: (search: string) => string[];
  replaceSearchAuthors: (search: string, newAuthors: string[]) => string;
}) {
  const sortTagList = TagList.sort();
  const isExtensions = getContentType(location) === "extensions";
  
  // Compute template counts per tag for display
  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    const countTags = (tags: TagType[]) => {
      tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    };
    if (isExtensions) {
      unsortedExtensions.forEach((extension) => countTags(getExtensionTags(extension)));
    } else {
      unsortedUsers.forEach((user) => countTags(getTemplateTags(user)));
    }
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

  // Uncategorized tags (msft, community, new, aicollection) are
  // curated/featured collections and are intentionally not run through
  // applyMinCountThreshold — they should always remain discoverable
  // regardless of how many templates currently carry them.
  //
  // For the extensions view, hide `new`, `popular`, and `aicollection`:
  // those collections only apply to templates. Keep `msft` / `community`
  // so users can still filter by author type.
  const EXTENSION_HIDDEN_UNCATEGORY_TAGS = new Set<string>([
    "new",
    "popular",
    "aicollection",
  ]);
  // Explicit display order: surface Microsoft-authored entries before
  // community-authored so the primary/official source is the first option.
  const UNCATEGORY_TAG_ORDER: Record<string, number> = {
    msft: 0,
    community: 1,
    new: 2,
    popular: 3,
    aicollection: 4,
  };
  const uncategoryTag = TagList.filter((tag) => {
    const tagObject = Tags[tag];
    if (tagObject.type !== undefined) return false;
    if (isExtensions && EXTENSION_HIDDEN_UNCATEGORY_TAGS.has(tag)) return false;
    return true;
  }).sort(
    (a, b) =>
      (UNCATEGORY_TAG_ORDER[a] ?? Number.MAX_SAFE_INTEGER) -
      (UNCATEGORY_TAG_ORDER[b] ?? Number.MAX_SAFE_INTEGER),
  );
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
  const [openItems, setOpenItems] = React.useState<string[]>(
    isExtensions ? ["9"] : [],
  );
  // Sync the Extension Capabilities accordion's open state with `isExtensions`
  // because ShowcaseLeftFilters is not remounted when the user toggles between
  // Templates and Extensions — without this effect the panel would only honor
  // the default on first mount.
  React.useEffect(() => {
    setOpenItems(isExtensions ? ["9"] : []);
  }, [isExtensions]);
  const handleToggle: AccordionToggleEventHandler<string> = (event, data) => {
    setOpenItems(data.openItems);
  };
  const history = useHistory();
  const clearAll = () => {
    history.push({
      ...location,
      search: clearSearchFilters(location.search),
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
      <div className={styles.filterCollections}>
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
              className={`${styles.checkboxListItem} ${styles.curatedCheckbox}`}
            >
              <ShowcaseTagSelect
                id={id}
                tag={tag}
                label={tagObject.label}
                activeTags={activeTags}
                selectedTags={selectedTags}
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
              >
                <div className={styles.categoryTitle}>
                  Language
                  <span className={styles.filterCount}>{languageTag.length}</span>
                </div>
              </AccordionHeader>
              <AccordionPanel>
                <ShowcaseFilterViewAll
                  tags={languageTag}
                  number={"1"}
                  activeTags={activeTags}
                  selectedTags={selectedTags}
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
              >
                <div className={styles.categoryTitle}>
                  Framework
                  <span className={styles.filterCount}>{frameworkTag.length}</span>
                </div>
              </AccordionHeader>
              <AccordionPanel>
                <ShowcaseFilterViewAll
                  tags={frameworkTag}
                  number={"2"}
                  activeTags={activeTags}
                  selectedTags={selectedTags}
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
              >
                <div className={styles.categoryTitle}>
                  Services
                  <span className={styles.filterCount}>{servicesTag.length}</span>
                </div>
              </AccordionHeader>
              <AccordionPanel>
                <ShowcaseFilterViewAll
                  tags={servicesTag}
                  number={"3"}
                  activeTags={activeTags}
                  selectedTags={selectedTags}
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
              >
                <div className={styles.categoryTitle}>
                  Database
                  <span className={styles.filterCount}>{databaseTag.length}</span>
                </div>
              </AccordionHeader>
              <AccordionPanel>
                <ShowcaseFilterViewAll
                  tags={databaseTag}
                  number={"4"}
                  activeTags={activeTags}
                  selectedTags={selectedTags}
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
              >
                <div className={styles.categoryTitle}>
                  Tools
                  <span className={styles.filterCount}>{otherTag.length}</span>
                </div>
              </AccordionHeader>
              <AccordionPanel>
                <ShowcaseFilterViewAll
                  tags={otherTag}
                  number={"5"}
                  activeTags={activeTags}
                  selectedTags={selectedTags}
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
              >
                <div className={styles.categoryTitle}>
                  Infrastructure as Code
                  <span className={styles.filterCount}>{infrastructureAsCodeTag.length}</span>
                </div>
              </AccordionHeader>
              <AccordionPanel>
                <ShowcaseFilterViewAll
                  tags={infrastructureAsCodeTag}
                  number={"6"}
                  activeTags={activeTags}
                  selectedTags={selectedTags}
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
              >
                <div className={styles.categoryTitle}>
                  Topic
                  <span className={styles.filterCount}>{topicTag.length}</span>
                </div>
              </AccordionHeader>
              <AccordionPanel>
                <ShowcaseFilterViewAll
                  tags={topicTag}
                  number={"7"}
                  activeTags={activeTags}
                  selectedTags={selectedTags}
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

      {/* Extension Capabilities filter (extensions view only) */}
      {isExtensions && extensionCapabilityTag.length > 0 && (
        <AccordionItem value="9">
          <AccordionHeader
            className={styles.categoryHeader}
            expandIconPosition="end"
          >
            <div className={styles.categoryTitle}>
              Extension Capabilities
              <span className={styles.filterCount}>{extensionCapabilityTag.length}</span>
            </div>
          </AccordionHeader>
          <AccordionPanel>
            <ShowcaseFilterViewAll
              tags={extensionCapabilityTag}
              number={"9"}
              activeTags={activeTags}
              selectedTags={selectedTags}
              location={location}
              readSearchTags={readSearchTags}
              replaceSearchTags={replaceSearchTags}
              tagCounts={tagCounts}
            />
          </AccordionPanel>
        </AccordionItem>
      )}
    </Accordion>
  );
}

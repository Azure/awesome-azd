/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import ShowcaseTagSelect from "../ShowcaseTagSelect";
import ShowcaseFilterSection from "./ShowcaseFilterSection";
import { Accordion, type AccordionToggleEventHandler } from "@fluentui/react-components";
import { Tags, type TagType } from "../../../data/tags";
import { sortedTagList, unsortedUsers } from "../../../data/users";
import { unsortedExtensions } from "../../../data/extensions";
import styles from "./styles.module.css";
import { useHistory } from "@docusaurus/router";
import { prepareUserState } from "@site/src/utils/galleryNavigation";
import { getContentType } from "@site/src/utils/contentType";
import { getTemplateTags, getExtensionTags } from "@site/src/utils/galleryTags";
import { clearSearchFilters } from "@site/src/utils/galleryQuery";

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
  const uncategoryTag = sortedTagList.filter((tag) => {
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
    sortedTagList.filter((tag) => Tags[tag].type === "Language"),
  );
  const frameworkTag = applyMinCountThreshold(
    sortedTagList.filter((tag) => Tags[tag].type === "Framework"),
  );
  const servicesTag = applyMinCountThreshold(
    sortedTagList.filter((tag) => Tags[tag].type === "Service"),
  );
  const databaseTag = applyMinCountThreshold(
    sortedTagList.filter((tag) => Tags[tag].type === "Database"),
  );
  const infrastructureAsCodeTag = applyMinCountThreshold(
    sortedTagList.filter((tag) => Tags[tag].type === "Infrastructure as Code"),
  );
  const otherTag = applyMinCountThreshold(
    sortedTagList.filter((tag) => Tags[tag].type === "Tools"),
  );
  const topicTag = applyMinCountThreshold(
    sortedTagList.filter((tag) => Tags[tag].type === "Topic"),
  );
  const extensionCapabilityTag = sortedTagList.filter(
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
          {[
            { title: "Language", value: "1", tags: languageTag },
            { title: "Framework", value: "2", tags: frameworkTag },
            { title: "Services", value: "3", tags: servicesTag },
            { title: "Database", value: "4", tags: databaseTag },
            { title: "Tools", value: "5", tags: otherTag },
            { title: "Infrastructure as Code", value: "6", tags: infrastructureAsCodeTag },
            { title: "Topic", value: "7", tags: topicTag },
          ].map(({ title, value, tags }) =>
            tags.length > 0 ? (
              <ShowcaseFilterSection
                key={value}
                title={title}
                value={value}
                tags={tags}
                activeTags={activeTags}
                selectedTags={selectedTags}
                location={location}
                readSearchTags={readSearchTags}
                replaceSearchTags={replaceSearchTags}
                tagCounts={tagCounts}
              />
            ) : null
          )}
        </>
      )}

      {/* Extension Capabilities filter (extensions view only) */}
      {isExtensions && extensionCapabilityTag.length > 0 && (
        <ShowcaseFilterSection
          title="Extension Capabilities"
          value="9"
          tags={extensionCapabilityTag}
          activeTags={activeTags}
          selectedTags={selectedTags}
          location={location}
          readSearchTags={readSearchTags}
          replaceSearchTags={replaceSearchTags}
          tagCounts={tagCounts}
        />
      )}
    </Accordion>
  );
}

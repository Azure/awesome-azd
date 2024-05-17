/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useMemo, useEffect } from "react";
import { readSearchTags } from "../components/gallery/ShowcaseTagSelect";
import {
  UserState,
  InputValue,
} from "../components/gallery/ShowcaseTemplateSearch";
import { Tags, type User, type TagType } from "../data/tags";
import { sortedUsers, unsortedUsers } from "../data/users";
import {
  Text,
  Combobox,
  Option,
  Spinner,
  Badge,
} from "@fluentui/react-components";
import ShowcaseCards from "./ShowcaseCards";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import { useColorMode } from "@docusaurus/theme-common";
import { toggleTag } from "../components/gallery/ShowcaseTagSelect";

function restoreUserState(userState: UserState | null) {
  const { scrollTopPosition, focusedElementId } = userState ?? {
    scrollTopPosition: 0,
    focusedElementId: undefined,
  };
  // @ts-expect-error: if focusedElementId is undefined it returns null
  document.getElementById(focusedElementId)?.focus();
  window.scrollTo({ top: scrollTopPosition });
}

const SORT_BY_OPTIONS = [
  "New to old",
  "Old to new",
  "Alphabetical (A - Z)",
  "Alphabetical (Z - A)",
];

function readSortChoice(rule: string): User[] {
  if (rule == SORT_BY_OPTIONS[0]) {
    const copyUnsortedUser = unsortedUsers.slice();
    return copyUnsortedUser.reverse();
  } else if (rule == SORT_BY_OPTIONS[1]) {
    return unsortedUsers;
  } else if (rule == SORT_BY_OPTIONS[2]) {
    return sortedUsers;
  } else if (rule == SORT_BY_OPTIONS[3]) {
    const copySortedUser = sortedUsers.slice();
    return copySortedUser.reverse();
  }
  return sortedUsers;
}

const SearchNameQueryKey = "name";

function readSearchName(search: string) {
  return new URLSearchParams(search).get(SearchNameQueryKey);
}

function filterUsers(
  users: User[],
  selectedTags: TagType[],
  searchName: string | null
) {
  if (searchName) {
    // eslint-disable-next-line no-param-reassign
    users = users.filter((user) =>
      user.title.toLowerCase().includes(searchName.toLowerCase())
    );
  }
  if (!selectedTags && selectedTags.length === 0) {
    return users;
  }
  return users.filter((user) => {
    if (!user && !user.tags && user.tags.length === 0) {
      return false;
    }
    return selectedTags.every((tag) => user.tags.includes(tag));
  });
}

function FilterAppliedBar({
  clearAll,
  selectedTags,
}: {
  clearAll;
  selectedTags: TagType[];
}) {
  const { colorMode } = useColorMode();
  return selectedTags.length > 0 ? (
    <div
      style={{
        paddingTop: "32px",
        display: "flex",
        gap: "12px",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          fontWeight: "400",
          lineHeight: "20px",
        }}
      >
        Filters applied:
      </div>
      {selectedTags.map((tag, index) => {
        const tagObject = Tags[tag];
        const key = `showcase_checkbox_key_${tag}`;
        const id = `showcase_checkbox_id_${tag}`;

        return (
          <Badge
            appearance="tint"
            size="extra-large"
            color="brand"
            shape="rounded"
            icon={
              colorMode != "dark" ? (
                <img
                  src={useBaseUrl("/img/lightModePurpleClose.svg")}
                  height={20}
                  alt="Close"
                />
              ) : (
                <img
                  src={useBaseUrl("/img/darkModePurpleClose.svg")}
                  height={20}
                  alt="Close"
                />
              )
            }
            iconPosition="after"
            className={styles.filterBadge}
            onClick={() => {
              toggleTag(tag, location);
            }}
          >
            {tagObject.label}
          </Badge>
        );
      })}
      <div className={styles.clearAll} onClick={clearAll}>
        Clear all
      </div>
    </div>
  ) : null;
}

export default function ShowcaseCardPage({
  setActiveTags,
  selectedTags,
  location,
  setSelectedTags,
}: {
  setActiveTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  selectedTags: TagType[];
  location;
  setSelectedTags: React.Dispatch<React.SetStateAction<TagType[]>>;
}) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const clearAll = () => {
    setSelectedTags([]);
  };

  useEffect(() => {
    setSelectedTags(readSearchTags(location.search));
    setSelectedUsers(readSortChoice(selectedOptions[0]));
    setSearchName(readSearchName(location.search));
    restoreUserState(location.state);
    setLoading(false);
  }, [location, selectedOptions]);

  var cards = useMemo(
    () => filterUsers(selectedUsers, selectedTags, searchName),
    [selectedUsers, selectedTags, searchName]
  );

  useEffect(() => {
    const unionTags = new Set<TagType>();
    cards.forEach((user) => user.tags.forEach((tag) => unionTags.add(tag)));
    setActiveTags(Array.from(unionTags));
  }, [cards]);

  const sortByOnSelect = (event, data) => {
    setLoading(true);
    setSelectedOptions(data.selectedOptions);
  };
  const templateNumber = cards ? cards.length : 0;

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "4px",
            flex: 1,
          }}
        >
          <Text size={400}>Viewing</Text>
          <Text size={400} weight="bold">
            {templateNumber}
          </Text>
          {templateNumber != 1 ? (
            <Text size={400}>templates</Text>
          ) : (
            <Text size={400}>template</Text>
          )}
          {InputValue != null ? (
            <>
              <Text size={400}>for</Text>
              <Text size={400} weight="bold">
                '{InputValue}'
              </Text>
            </>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <Text size={400}>Sort by: </Text>
          <Combobox
            style={{ minWidth: "unset" }}
            input={{ style: { width: "130px" } }}
            aria-labelledby="combo-default"
            placeholder={SORT_BY_OPTIONS[2]}
            onOptionSelect={sortByOnSelect}
          >
            {SORT_BY_OPTIONS.map((option) => (
              <Option key={option}>{option}</Option>
            ))}
          </Combobox>
        </div>
      </div>
      <FilterAppliedBar clearAll={clearAll} selectedTags={selectedTags} />
      {loading ? (
        <Spinner labelPosition="below" label="Loading..." />
      ) : (
        <ShowcaseCards filteredUsers={cards} />
      )}
    </>
  );
}

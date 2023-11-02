/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useMemo, useEffect } from "react";
import Layout from "@theme/Layout";
import { readSearchTags } from "../components/gallery/ShowcaseTagSelect";
import ShowcaseCard from "../components/gallery/ShowcaseCard";
import ShowcaseContributionCard from "../components/gallery/ShowcaseContributionCard";
import ShowcaseEmptyResult from "../components/gallery/ShowcaseEmptyResult";
import ShowcaseLeftFilters from "../components/gallery/ShowcaseLeftFilters";
import ShowcaseTemplateSearch, {
  UserState,
  InputValue,
} from "../components/gallery/ShowcaseTemplateSearch";
import {
  FluentProvider,
  teamsLightTheme,
  Text,
  Combobox,
  Option,
  teamsDarkTheme,
  Spinner,
} from "@fluentui/react-components";
import { initializeIcons } from "@fluentui/react/lib/Icons";
import { type User, type TagType } from "../data/tags";
import { sortedUsers, unsortedUsers, TagList } from "../data/users";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { useLocation } from "@docusaurus/router";
import styles from "./styles.module.css";
import EventEmitter from "../utils/EventEmitter";
import { useColorMode } from "@docusaurus/theme-common";

initializeIcons();

function restoreUserState(userState: UserState | null) {
  const { scrollTopPosition, focusedElementId } = userState ?? {
    scrollTopPosition: 0,
    focusedElementId: undefined,
  };
  // @ts-expect-error: if focusedElementId is undefined it returns null
  document.getElementById(focusedElementId)?.focus();
  window.scrollTo({ top: scrollTopPosition });
}

export function prepareUserState(): UserState | undefined {
  if (ExecutionEnvironment.canUseDOM) {
    return {
      scrollTopPosition: window.scrollY,
      focusedElementId: document.activeElement?.id,
    };
  }

  return undefined;
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
  if (selectedTags.length === 0) {
    return users;
  }
  return users.filter((user) => {
    if (user.tags.length === 0) {
      return false;
    }
    return selectedTags.every((tag) => user.tags.includes(tag));
  });
}

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

function useFilteredUsers(rule: string) {
  const location = useLocation<UserState>();
  // On SSR / first mount (hydration) no tag is selected
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [searchName, setSearchName] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  // Sync tags from QS to state (delayed on purpose to avoid SSR/Client
  // hydration mismatch)
  useEffect(() => {
    setSelectedTags(readSearchTags(location.search));
    setSelectedUsers(readSortChoice(rule));
    setSearchName(readSearchName(location.search));
    restoreUserState(location.state);
  }, [location, rule]);
  return useMemo(
    () => filterUsers(selectedUsers, selectedTags, searchName),
    [selectedUsers, selectedTags, searchName]
  );
}

const SORT_BY_OPTIONS = [
  "New to old",
  "Old to new",
  "Alphabetical (A - Z)",
  "Alphabetical (Z - A)",
];

function ShowcaseCardPage() {
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);

  let filteredUsers = useFilteredUsers(selectedOptions[0]);

  const sortByOnSelect = (event, data) => {
    setSelectedOptions(data.selectedOptions);
  };
  const templateNumber = filteredUsers.length;

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
      <ShowcaseCards filteredUsers={filteredUsers} />
    </>
  );
}

function ShowcaseCards({ filteredUsers }: { filteredUsers: User[] }) {
  const len = filteredUsers.length;
  if (len === 0) {
    return <ShowcaseEmptyResult id="showcase.usersList.noResult" />;
  }

  return (
    <section>
      <div className={styles.showcaseFavorite}>
        <div className={styles.showcaseList}>
          {filteredUsers.map((user, index) => (
            <React.Fragment key={index}>
              {(len < 6 && index === len - 1) || index === 4 ? (
                <React.Fragment key="cardWithContributionCard">
                  <React.Fragment key={user.title}>
                    <ShowcaseCard user={user} />
                  </React.Fragment>
                  <React.Fragment key="fragment_contributionCard">
                    <ShowcaseContributionCard />
                  </React.Fragment>
                </React.Fragment>
              ) : (
                <React.Fragment key={user.title}>
                  <ShowcaseCard user={user} />
                </React.Fragment>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

const App = () => {
  const { colorMode, setColorMode } = useColorMode();
  EventEmitter.addListener("switchColorMode", () => {
    colorMode == "dark" ? setColorMode("light") : setColorMode("dark");
  });

  const [loading, setLoading] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
    setCardLoading(true);
    setTimeout(() => {
      setCardLoading(false);
    }, 1000);
  }, []);

  return (
    <>
      {loading ? (
        <FluentProvider
          theme={colorMode == "dark" ? teamsDarkTheme : teamsLightTheme}
        >
          <div className={styles.load}>
            <Spinner labelPosition="below" label="Loading..." />
          </div>
        </FluentProvider>
      ) : (
        <div>
          <FluentProvider
            theme={colorMode == "dark" ? teamsDarkTheme : teamsLightTheme}
          >
            <ShowcaseTemplateSearch />
            <div className={styles.filterAndCard}>
              <div className={styles.filter}>
                <ShowcaseLeftFilters />
              </div>
              {cardLoading ? (
                <div className={styles.cardLoad}>
                  <Spinner labelPosition="below" label="Loading..." />
                </div>
              ) : (
                <div className={styles.card}>
                  <ShowcaseCardPage />
                </div>
              )}
            </div>
          </FluentProvider>
        </div>
      )}
    </>
  );
};

export default function Showcase(): JSX.Element {
  return (
    <Layout>
      <App />
    </Layout>
  );
}

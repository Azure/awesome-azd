/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useMemo, useEffect } from "react";

import Layout from "@theme/Layout";

import ShowcaseTagSelect, {
  readSearchTags,
} from "../components/gallery/ShowcaseTagSelect";

import ShowcaseCard, {
  ShowcaseContributionCard,
} from "../components/gallery/ShowcaseCard";

import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  FluentProvider,
  teamsLightTheme,
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionToggleEventHandler,
  Text,
  Link as FluentUILink,
} from "@fluentui/react-components";

import { SearchBox } from "@fluentui/react/lib/SearchBox";

import { initializeIcons } from "@fluentui/react/lib/Icons";

import { Tags, type User, type TagType } from "../data/tags";

import { sortedUsers, TagList } from "../data/users";

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import Translate, { translate } from "@docusaurus/Translate";
import { useHistory, useLocation } from "@docusaurus/router";
import { usePluralForm } from "@docusaurus/theme-common";

import styles from "./styles.module.css";

initializeIcons();
const TITLE = "Template Library";
const DESCRIPTION =
  "A community-contributed template gallery built to work with the Azure Developer CLI.";
const ADD_URL = "https://aka.ms/azd";

type UserState = {
  scrollTopPosition: number;
  focusedElementId: string | undefined;
};

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

function useFilteredUsers() {
  const location = useLocation<UserState>();
  // On SSR / first mount (hydration) no tag is selected
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [searchName, setSearchName] = useState<string | null>(null);
  // Sync tags from QS to state (delayed on purpose to avoid SSR/Client
  // hydration mismatch)
  useEffect(() => {
    setSelectedTags(readSearchTags(location.search));
    setSearchName(readSearchName(location.search));
    restoreUserState(location.state);
  }, [location]);

  return useMemo(
    () => filterUsers(sortedUsers, selectedTags, searchName),
    [selectedTags, searchName]
  );
}

function ShowcaseTemplateSearch() {
  const cover = useBaseUrl("/img/cover.png");
  return (
    <div className={styles.searchArea}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className={styles.heroBar}
          style={{
            textAlign: "center",
          }}
        >
          <Text
            size={800}
            weight="semibold"
            style={{
              background:
                "linear-gradient(90deg, rgb(112.68, 94.63, 239.06) 0%, rgb(41.21, 120.83, 190.19) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {TITLE}
          </Text>
        </div>
        <Text
          align="center"
          size={400}
          style={{
            color: "#242424",
            padding: "10px 0 20px 0",
          }}
        >
          {DESCRIPTION}
        </Text>
        <FilterBar id="filterBar" />
        <Text
          align="center"
          size={300}
          style={{
            color: "#242424",
            padding: "20px 0",
          }}
        >
          Not familiar with the Azure Developer CLI (azd)?
          <FluentUILink
            href={ADD_URL}
            target="_blank"
            style={{ paddingLeft: "3px", color: "#7160E8" }}
          >
            Learn more
          </FluentUILink>
        </Text>
      </div>
    </div>
  );
}

function useSiteCountPlural() {
  const { selectMessage } = usePluralForm();
  return (sitesCount: number) =>
    selectMessage(
      sitesCount,
      translate(
        {
          id: "showcase.filters.resultCount",
          description:
            'Pluralized label for the number of sites found on the showcase. Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',
          message: "1 site|{sitesCount} sites",
        },
        { sitesCount }
      )
    );
}

function ShowcaseFilters() {
  const filteredUsers = useFilteredUsers();
  const siteCountPlural = useSiteCountPlural();
  const uncategoryTag = TagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === undefined;
  });
  const languageTag = TagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Language";
  });
  const frameworkTag = TagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Framework";
  });
  const servicesTag = TagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Service";
  });
  const databaseTag = TagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Database";
  });
  const infrastructureAsCodeTag = TagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Infrastructure as Code";
  });
  const otherTag = TagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Tools";
  });
  const [openItems, setOpenItems] = React.useState([
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
  ]);
  const handleToggle: AccordionToggleEventHandler<string> = (event, data) => {
    setOpenItems(data.openItems);
  };
  return (
    <Accordion
      openItems={openItems}
      onToggle={handleToggle}
      multiple
      collapsible
    >
      <div style={{ paddingBottom: "7px" }}>
        <div
          style={{
            color: "#242424",
            fontSize: "20px",
            fontWeight: "500",
            padding: "0 0 15px 12px",
          }}
        >
          Filter by
        </div>
        {uncategoryTag.map((tag) => {
          const tagObject = Tags[tag];
          const id = `showcase_checkbox_id_${tag}`;

          return (
            <div
              key={id}
              className={styles.checkboxListItem}
              style={{ paddingLeft: "12px" }}
            >
              <ShowcaseTagSelect tag={tag} label={tagObject.label} />
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
          <div
            style={{ color: "#242424", fontSize: "16px", fontWeight: "500" }}
          >
            Language
          </div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll tags={languageTag} number={"1"} />
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
          <div
            style={{ color: "#242424", fontSize: "16px", fontWeight: "500" }}
          >
            Framework
          </div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll tags={frameworkTag} number={"2"} />
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
          <div
            style={{ color: "#242424", fontSize: "16px", fontWeight: "500" }}
          >
            Services
          </div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll tags={servicesTag} number={"3"} />
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
          <div
            style={{ color: "#242424", fontSize: "16px", fontWeight: "500" }}
          >
            Database
          </div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll tags={databaseTag} number={"4"} />
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
          <div
            style={{ color: "#242424", fontSize: "16px", fontWeight: "500" }}
          >
            Infrastructure as Code
          </div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll tags={infrastructureAsCodeTag} number={"5"} />
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
          <div
            style={{ color: "#242424", fontSize: "16px", fontWeight: "500" }}
          >
            Tools
          </div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll tags={otherTag} number={"6"} />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>

    /* <span>{siteCountPlural(filteredUsers.length)}</span> */
  );
}

function ShowcaseFilterViewAll({
  tags,
  number,
}: {
  tags: TagType[];
  number: string;
}) {
  const [openItems, setOpenItems] = React.useState(["0"]);
  const handleToggle: AccordionToggleEventHandler<string> = (event, data) => {
    setOpenItems(data.openItems);
  };
  const chevronDownSmall = <img src={useBaseUrl("/img/smallChevron.svg")} />;
  const chevronUpSmall = (
    <img
      style={{ transform: "rotate(180deg)" }}
      src={useBaseUrl("/img/smallChevron.svg")}
    />
  );
  let value = number + "2";
  return (
    <>
      {tags.slice(0, 6).map((tag, index) => {
        const tagObject = Tags[tag];
        const id = `showcase_checkbox_id_${tag}`;

        return index == tags.length - 1 ? (
          <div
            key={id}
            className={styles.checkboxListItem}
            style={{ marginBottom: "7px" }}
          >
            <ShowcaseTagSelect tag={tag} label={tagObject.label} />
          </div>
        ) : (
          <div key={id} className={styles.checkboxListItem}>
            <ShowcaseTagSelect tag={tag} label={tagObject.label} />
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
                const id = `showcase_checkbox_id_${tag}`;

                return (
                  <div key={id} className={styles.checkboxListItem}>
                    <ShowcaseTagSelect tag={tag} label={tagObject.label} />
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
                  color: "#6656d1",
                  fontSize: "12px",
                }}
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

function ShowcaseFilterAndCard() {
  return (
    <div className={styles.filterAndCard}>
      <div className={styles.filter}>
        <ShowcaseFilters />
      </div>
      <div className={styles.card}>
        <ShowcaseCards />
      </div>
    </div>
  );
}

function FilterBar({ id }: { id: string }) {
  const history = useHistory();
  const location = useLocation();
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    setValue(readSearchName(location.search));
  }, [location]);
  return (
    <>
      <SearchBox
        styles={{
          root: {
            border: "1px solid #D1D1D1",
            height: "52px",
            maxWidth: "740px",
            borderRadius: "4px",
          },
          icon: {
            fontSize: "24px",
            paddingLeft: "10px",
          },
          field: {
            paddingLeft: "20px",
            fontSize: "18px",
          },
        }}
        id={id}
        value={readSearchName(location.search) != null ? value : ""}
        placeholder="Search for an azd template..."
        onClear={(e) => {
          setValue(null);
          const newSearch = new URLSearchParams(location.search);
          newSearch.delete(SearchNameQueryKey);

          history.push({
            ...location,
            search: newSearch.toString(),
            state: prepareUserState(),
          });
        }}
        onChange={(e) => {
          if (!e) {
            return;
          }
          setValue(e.currentTarget.value);
          const newSearch = new URLSearchParams(location.search);
          newSearch.delete(SearchNameQueryKey);
          if (e.currentTarget.value) {
            newSearch.set(SearchNameQueryKey, e.currentTarget.value);
          }
          history.push({
            ...location,
            search: newSearch.toString(),
            state: prepareUserState(),
          });
          setTimeout(() => {
            document.getElementById("searchbar")?.focus();
          }, 0);
        }}
      />
    </>
  );
}

function ShowcaseCards() {
  const filteredUsers = useFilteredUsers();

  if (filteredUsers.length === 0) {
    return (
      <div>
        <h2>
          <Translate id="showcase.usersList.noResult">
            Be the first to add an example project!
          </Translate>
        </h2>
        {/* <FilterBar id="searchDropDown" /> */}
      </div>
    );
  }

  return (
    <section>
      {filteredUsers.length === sortedUsers.length ? (
        <>
          <div className={styles.showcaseFavorite}>
            <div>
              <div className={styles.showcaseFavoriteHeader}>
                {/* <FilterBar id="searchDropDown" /> */}
              </div>
              <ul className={styles.showcaseList}>
                {sortedUsers.map((user, index) => (
                  <React.Fragment key={user.title}>
                    <ShowcaseCard user={user} />
                    {((sortedUsers.length < 6 &&
                      index === sortedUsers.length - 1) ||
                      index === 4) && <ShowcaseContributionCard />}
                  </React.Fragment>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.showcaseFavorite}>
          <div>
            <div className={styles.showcaseFavoriteHeader}>
              {/* <FilterBar id="searchDropDown" /> */}
            </div>
            <ul className={styles.showcaseList}>
              {filteredUsers.map((user, index) => (
                <React.Fragment key={user.title}>
                  <ShowcaseCard user={user} />
                  {((filteredUsers.length < 6 &&
                    index === filteredUsers.length - 1) ||
                    index === 4) && <ShowcaseContributionCard />}
                </React.Fragment>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

export default function Showcase(): JSX.Element {
  return (
    <FluentProvider theme={teamsLightTheme}>
      {/* <Layout title={TITLE} description={DESCRIPTION}> */}
      <Layout>
        <ShowcaseTemplateSearch />
        <ShowcaseFilterAndCard />
      </Layout>
    </FluentProvider>
  );
}

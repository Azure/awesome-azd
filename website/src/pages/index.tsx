/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useMemo, useEffect } from "react";

import Layout from "@theme/Layout";
import clsx from "clsx";

import FavoriteIcon from "../components/svgIcons/FavoriteIcon";

import ShowcaseTagSelect, {
  readSearchTags,
} from "../components/gallery/ShowcaseTagSelect";

import ShowcaseCard, {
  ShowcaseContributionCard,
} from "../components/gallery/ShowcaseCard";
import ShowcaseTooltip from "../components/gallery/ShowcaseTooltip";

import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  FluentProvider,
  teamsLightTheme,
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionToggleEventHandler,
  makeStyles,
} from "@fluentui/react-components";

import { Tags, type User, type TagType } from "../data/tags";

import { sortedUsers, TagList } from "../data/users";

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import Translate, { translate } from "@docusaurus/Translate";
import { useHistory, useLocation } from "@docusaurus/router";
import { usePluralForm } from "@docusaurus/theme-common";

import styles from "./styles.module.css";

const TITLE = "Awesome AZD Templates";
const DESCRIPTION = "A community-contributed templates gallery";
const ADD_URL = "https://aka.ms/awesome-azd-contribute";

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
  return (
    <section className="margin-top--lg margin-bottom--lg text--center">
      <h1>{TITLE}</h1>
      <p>{DESCRIPTION}</p>
      <a
        className="button button--primary"
        href={ADD_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Translate id="showcase.header.button">
          Contribute Your Template! 🙏
        </Translate>
      </a>
    </section>
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
    return tagObject.type === "Other";
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

  const chevronImg = (
    <img src={useBaseUrl("/img/leftChevron.svg")} height={20} />
  );

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
            paddingBottom: "15px",
          }}
        >
          Filter by
        </div>
        {uncategoryTag.map((tag) => {
          const tagObject = Tags[tag];
          const id = `showcase_checkbox_id_${tag}`;

          return (
            <div key={id} className={styles.checkboxListItem}>
              <ShowcaseTagSelect tag={tag} label={tagObject.label} />
            </div>
          );
        })}
      </div>
      <AccordionItem
        value="1"
        style={{ borderTop: "1px solid #D1D1D1", paddingBottom: "7px" }}
      >
        <AccordionHeader expandIconPosition="end" expandIcon={chevronImg}>
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

      <AccordionItem
        value="2"
        style={{ borderTop: "1px solid #D1D1D1", paddingBottom: "7px" }}
      >
        <AccordionHeader expandIconPosition="end" expandIcon={chevronImg}>
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

      <AccordionItem
        value="3"
        style={{ borderTop: "1px solid #D1D1D1", paddingBottom: "7px" }}
      >
        <AccordionHeader expandIconPosition="end" expandIcon={chevronImg}>
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

      <AccordionItem
        value="4"
        style={{ borderTop: "1px solid #D1D1D1", paddingBottom: "7px" }}
      >
        <AccordionHeader expandIconPosition="end" expandIcon={chevronImg}>
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

      <AccordionItem
        value="5"
        style={{ borderTop: "1px solid #D1D1D1", paddingBottom: "7px" }}
      >
        <AccordionHeader expandIconPosition="end" expandIcon={chevronImg}>
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

      <AccordionItem value="6" style={{ borderTop: "1px solid #D1D1D1" }}>
        <AccordionHeader expandIconPosition="end" expandIcon={chevronImg}>
          <div
            style={{ color: "#242424", fontSize: "16px", fontWeight: "500" }}
          >
            Other
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
  const chevronImgSmall = (
    <img src={useBaseUrl("/img/leftChevron.svg")} height={13} />
  );
  return (
    <>
      {tags.slice(0, 6).map((tag) => {
        const tagObject = Tags[tag];
        const id = `showcase_checkbox_id_${tag}`;

        return (
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
          <AccordionItem value={number + "2"} style={{ padding: "0px" }}>
            <AccordionHeader
              inline={true}
              expandIconPosition="end"
              expandIcon={chevronImgSmall}
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

const featuredUsers = sortedUsers.filter((user) =>
  user.tags.includes("featured")
);
const otherUsers = sortedUsers.filter(
  (user) => !user.tags.includes("featured")
);
const featuredAndOtherUsers = featuredUsers.concat(otherUsers);

function SearchBar() {
  const history = useHistory();
  const location = useLocation();
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    setValue(readSearchName(location.search));
  }, [location]);
  return (
    <div className={styles.searchContainer}>
      <input
        id="searchbar"
        placeholder={translate({
          message: "Search for site name...",
          id: "showcase.searchBar.placeholder",
        })}
        value={value ?? undefined}
        onInput={(e) => {
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
    </div>
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
        <SearchBar />
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
                <SearchBar />
              </div>
              <ul className={styles.showcaseList}>
                {featuredAndOtherUsers.map((user, index) => (
                  <React.Fragment key={user.title}>
                    <ShowcaseCard user={user} />
                    {((featuredAndOtherUsers.length < 6 &&
                      index === featuredAndOtherUsers.length - 1) ||
                      index === 4) && <ShowcaseContributionCard />}
                  </React.Fragment>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div>
          <div className={styles.showcaseFavoriteHeader}>
            <SearchBar />
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
      )}
    </section>
  );
}

export default function Showcase(): JSX.Element {
  return (
    <FluentProvider theme={teamsLightTheme}>
      <Layout title={TITLE} description={DESCRIPTION}>
        <main>
          <ShowcaseTemplateSearch />
          <ShowcaseFilterAndCard />
        </main>
      </Layout>
    </FluentProvider>
  );
}

/**
* Copyright (c) Microsoft Corporation. All rights reserved.
* Licensed under the MIT License.
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
  Combobox,
  Option,
} from "@fluentui/react-components";

import { SearchBox } from "@fluentui/react/lib/SearchBox";

import { initializeIcons } from "@fluentui/react/lib/Icons";

import { Tags, type User, type TagType } from "../data/tags";

import { sortedUsers, unsortedUsers, TagList } from "../data/users";

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import Translate, { translate } from "@docusaurus/Translate";
import { useHistory, useLocation } from "@docusaurus/router";
import { usePluralForm } from "@docusaurus/theme-common";

import styles from "./styles.module.css";
import Link from "@docusaurus/Link";

initializeIcons();
const TITLE = "Template Library";
const DESCRIPTION =
  "A community-contributed template gallery built to work with the Azure Developer CLI.";
const ADD_URL = "https://aka.ms/azd";
var InputValue;

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

function readSortChoice(rule: string): User[] {
  const options = [
    "New to old",
    "Old to new",
    "Alphabetical (A - Z)",
    "Alphabetical (Z - A)",
  ];

  if (rule == options[0]) {
    return unsortedUsers;
  } else if (rule == options[1]) {
    const copyUnsortedUser = unsortedUsers.slice();
    return copyUnsortedUser.reverse();
  } else if (rule == options[2]) {
    return sortedUsers;
  } else if (rule == options[3]) {
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

function ShowcaseTemplateSearch() {
  return (
    <div className={styles.searchContainer}>
      <img
        src={useBaseUrl("/img/coverBackground.png")}
        className={styles.cover}
        onError={({ currentTarget }) => {
          currentTarget.style.display = "none"; 
        }}
        alt=""
      />
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
          <FilterBar />
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
            'Pluralized label for the number of templates found on the showcase. Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',
          message: "{sitesCount}",
        },
        { sitesCount }
      )
    );
}

function ShowcaseFilters() {
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
  );
}

function ShowcaseFilterViewAll({
  tags,
  number,
}: {
  tags: TagType[];
  number: string;
}) {
  tags = tags.sort();
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
        <ShowcaseCardPage />
      </div>
    </div>
  );
}

function FilterBar() {
  const history = useHistory();
  const location = useLocation();
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    setValue(readSearchName(location.search));
  }, [location]);
  InputValue = value;
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
        id="filterBar"
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

function ShowcaseCardPage() {
  const siteCountPlural = useSiteCountPlural();
  const options = [
    "New to old",
    "Old to new",
    "Alphabetical (A - Z)",
    "Alphabetical (Z - A)",
  ];
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);

  let filteredUsers = useFilteredUsers(selectedOptions[0]);

  const onSelect = (event, data) => {
    setSelectedOptions(data.selectedOptions);
  };
  const templateNumber = siteCountPlural(filteredUsers.length);

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
          {templateNumber != "1" ? (
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
            gap: "3px",
            alignItems: "center",
          }}
        >
          <Text size={400}>Sort by: </Text>
          <Combobox
            style={{ minWidth: "unset" }}
            input={{ style: { width: "130px" } }}
            aria-labelledby="combo-default"
            placeholder="Placeholder text"
            onOptionSelect={onSelect}
          >
            {options.map((option) => (
              <Option key={option} disabled={option === "Ferret"}>
                {option}
              </Option>
            ))}
          </Combobox>
        </div>
      </div>
      <ShowcaseCards filteredUsers={filteredUsers} />
    </>
  );
}
function ShowcaseCardEmptyResult({ id }: { id: string }) {
  return (
    <div
      id={id}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "40px",
      }}
    >
      <div
        style={{
          paddingTop: "100px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {InputValue != null ? (
          <>
            <Text size={500} weight="bold" align="center">
              We couldn’t find any results for '{InputValue}'
            </Text>
            <Text size={400} align="center">
              Check for spelling or try searching for another term.
            </Text>
          </>
        ) : (
          <>
            <Text size={500} weight="bold" align="center">
              We couldn’t find any results.
            </Text>
            <Text size={400} align="center">
              Check for tags or try filtering for another tag.
            </Text>
          </>
        )}
      </div>
      <div
        style={{
          display: "flex",
          columnGap: "30px",
          backgroundColor: "#FFFFFF",
          border: "#F0F0F0 2px solid",
          borderRadius: "8px",
          padding: "24px",
        }}
      >
        <img
          height={50}
          src={useBaseUrl("/img/smile.svg")}
          alt="smile"
          style={{ flex: 1 }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            rowGap: "5px",
            paddingRight: "50px",
          }}
        >
          <Text size={400} weight="bold">
            Want to be the change you wish to see in the world?
          </Text>
          <Text size={300}>
            awesome-azd is always looking for new templates!
          </Text>
          <FluentUILink
            key="emptySearch_contributeTemplate"
            href="https://azure.github.io/awesome-azd/docs/intro"
            target="_blank"
            style={{ paddingLeft: "10px" }}
          >
            • Learn how to contribute an azd template
          </FluentUILink>
          <FluentUILink
            key="emptySearch_requestBoard"
            href="https://github.com/Azure/awesome-azd/issues/new?assignees=nigkulintya%2C+savannahostrowski&labels=requested-contribution&template=%F0%9F%A4%94-submit-a-template-request.md&title=%5BIdea%5D+%3Cyour-template-name%3E"
            target="_blank"
            style={{ paddingLeft: "10px" }}
          >
            • View our template request board
          </FluentUILink>
        </div>
      </div>
    </div>
  );
}

function ShowcaseCards({ filteredUsers }: { filteredUsers: User[] }) {
  if (filteredUsers.length === 0) {
    return <ShowcaseCardEmptyResult id="showcase.usersList.noResult" />;
  }

  return (
    <section>
      {filteredUsers.length === sortedUsers.length ? (
        <>
          <div className={styles.showcaseFavorite}>
            <div className={styles.showcaseList}>
              {filteredUsers.map((user, index) => (
                <>
                  {(filteredUsers.length < 6 &&
                    index === filteredUsers.length - 1) ||
                  index === 4 ? (
                    <>
                      <React.Fragment key={user.title}>
                        <ShowcaseCard user={user} />
                      </React.Fragment>
                      <React.Fragment key="fragement_contributionCard">
                        <ShowcaseContributionCard />
                      </React.Fragment>
                    </>
                  ) : (
                    <React.Fragment key={user.title}>
                      <ShowcaseCard user={user} />
                    </React.Fragment>
                  )}
                </>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.showcaseFavorite}>
          <div className={styles.showcaseList}>
            {filteredUsers.map((user, index) => (
              <>
                {(filteredUsers.length < 6 &&
                  index === filteredUsers.length - 1) ||
                index === 4 ? (
                  <>
                    <React.Fragment key={user.title}>
                      <ShowcaseCard user={user} />
                    </React.Fragment>
                    <React.Fragment key="fragment_contributionCard">
                      <ShowcaseContributionCard />
                    </React.Fragment>
                  </>
                ) : (
                  <React.Fragment key={user.title}>
                    <ShowcaseCard user={user} />
                  </React.Fragment>
                )}
              </>
            ))}
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

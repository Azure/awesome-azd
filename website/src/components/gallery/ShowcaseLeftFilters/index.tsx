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

export default function ShowcaseLeftFilters() {
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

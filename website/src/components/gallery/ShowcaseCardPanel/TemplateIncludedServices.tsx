/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { Tags, type TagType } from "../../../data/tags";
import { sortedTagList } from "../../../data/users";
import { sortBy } from "@site/src/utils/jsUtils";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { DefaultButton, Popup } from "@fluentui/react";

export default function TemplateIncludedServices({
  tags,
  templateTitle,
  colorMode,
  expanded,
  onToggle,
  chevronIcon,
}: {
  tags: TagType[];
  templateTitle: string;
  colorMode: string;
  expanded: boolean;
  onToggle: () => void;
  chevronIcon: string;
}) {
  return (
    <div>
      <div className={styles.borderBottomColor}>
        <div
          className={`${styles.textColor} ${styles.sectionTitle}`}
        >
          Included in this template
        </div>
        <DefaultButton
          className={styles.sectionToggle}
          onClick={onToggle}
          aria-label="Toggle included services"
        >
          <img
            src={chevronIcon}
            width={20}
            height={20}
            alt=""
          />
        </DefaultButton>
      </div>
      {expanded && (
        <Popup>
          <div
            className={`${styles.textColor} ${styles.helpText}`}
          >
            The services used in this template are subject to their
            normal usage fees and charges. Learn more about the cost of
            individual services by visiting the{" "}
            <a
              href="https://azure.microsoft.com/en-us/pricing/calculator/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.color}
            >
              Azure Pricing Calculator
            </a>
            .
          </div>
          <ShowcaseCardAzureTag
            key={"azure_tag_" + templateTitle}
            tags={tags}
            colorMode={colorMode}
          />
        </Popup>
      )}
    </div>
  );
}

function ShowcaseCardAzureIcon({ iconPath }: { iconPath: string | undefined }) {
  const icon = useBaseUrl(iconPath);
  return (
    <img
      src={icon}
      alt="Azure Service Icon"
      width={20}
      height={20}
    />
  );
}

function ShowcaseCardAzureTag({
  tags,
  colorMode,
}: {
  tags: TagType[];
  colorMode: string;
}) {
  const tagObjects = tags.map((tag) => ({ tag, ...Tags[tag] }));

  // Keep same order for all tags
  const tagObjectsSorted = sortBy(tagObjects, (tagObject) =>
    sortedTagList.indexOf(tagObject.tag)
  );

  return tagObjectsSorted.map((tagObject, index) => {
    const azureService = tagObject.label.includes("Azure");

    return azureService ? (
      <div
        key={index}
        className={styles.serviceRow}
      >
        <div
          className={styles.squareColor}
        >
          <ShowcaseCardAzureIcon
            iconPath={
              colorMode != "dark" || tagObject.darkModeAzureIcon == null
                ? tagObject.azureIcon
                : tagObject.darkModeAzureIcon
            }
          />
        </div>
        <div className={styles.serviceContent}>
          <div
            className={`${styles.textColor} ${styles.serviceTitle}`}
          >
            {tagObject.label}
          </div>
          <div className={styles.serviceMetadata}>
            <div
              className={styles.serviceMetaLabel}
            >
              Azure Service
            </div>
            <div
              className={styles.serviceMetaSeparator}
            >
              •
            </div>
            <a
              href={tagObject.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.color} ${styles.serviceLink}`}
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    ) : null;
  });
}

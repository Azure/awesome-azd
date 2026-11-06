/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { Tags, type TagType } from "../../../data/tags";
import { tagList } from "../../../data/templates";
import { sortBy } from "@site/src/ai/utils/jsUtils";
import { Badge, Tooltip } from "@fluentui/react-components";

export function ShowcaseCardGreyTag({
  tags
}: {
  tags: TagType[];
}) {
  const tagObjects = tags.map((tag) => ({ tag, ...Tags[tag] }));
  return (
    <>
      {tagObjects.map((tagObject, index) => {
        const key = `showcase_card_tag_${tagObject.tag}`;
        return (
          <Badge
            appearance="tint"
            size="medium"
            color="informative"
            key={key}
            shape="rounded"
          >
            {tagObject.label}
          </Badge>
        );
      })}
    </>
  );
}


export default function ShowcaseCardTag({
  tags,
  page,
  tagOrder = tagList,
}: {
  tags: TagType[];
  page: boolean;
  tagOrder?: readonly TagType[];
}) {
  const tagObjects = tags
    .filter((tagObject) => tagObject != "featured")
    .map((tag) => ({ tag, ...Tags[tag] }));
  const tagObjectsSorted = sortBy(tagObjects, (tagObject) =>
    tagOrder.indexOf(tagObject.tag)
  );
  const languageTags = tagObjectsSorted.filter(
    (tag) => tag.type === "Language"
  );
  const modelTags = tagObjectsSorted.filter((tag) => tag.type === "Model");
  const taskTags = tagObjectsSorted.filter((tag) => tag.type === "Task");
  const azureTags = tagObjectsSorted.filter((tag) => tag.type === "Service" && (tag.label.includes("Azure") || tag.label.includes("Microsoft")));
  const databaseTags = tagObjectsSorted.filter((tag) => tag.type === "Database");
  let tagsByTypeSorted = [
    ...languageTags,
    ...modelTags,
    ...taskTags,
    ...azureTags,
    ...databaseTags,
  ];
  if (page) {
    tagsByTypeSorted = [
      ...languageTags,
      ...taskTags,
      ...azureTags,
      ...databaseTags,
    ];
  }
  const length = tagsByTypeSorted.length;
  let number = 0;
  let totalTagsLength = 0;
  tagsByTypeSorted.some((tagObject, index) => {
    totalTagsLength += tagObject.label.length + 5;
    if (totalTagsLength > 75) {
      return true;
    }
    number = index + 1;
  });
  const rest = length - number;
  const moreTagDetailList = tagsByTypeSorted
    .slice(number, length)
    .map((tagObject) => tagObject.label)
    .join("\n");

  if (!page) {
    if (length > number) {
      return (
        <>
          {tagsByTypeSorted.slice(0, number).map((tagObject, index) => {
            const key = `showcase_card_tag_${tagObject.tag}`;
            return (
              <Badge
                appearance="tint"
                size="medium"
                color="brand"
                key={key}
                className={styles.cardTag}
              >
                {tagObject.label}
              </Badge>
            );
          })}
          <Tooltip
            withArrow
            content={{
              children: (
                <span style={{ whiteSpace: "pre-line" }}>
                  {moreTagDetailList}
                </span>
              ),
            }}
            relationship="inaccessible"
            key="showcase_card_tag_more`"
          >
            <Badge
              appearance="tint"
              size="medium"
              color="brand"
              className={styles.cardTag}
            >
              + {rest} more
            </Badge>
          </Tooltip>
        </>
      );
    } else {
      return (
        <>
          {tagsByTypeSorted.map((tagObject, index) => {
            const key = `showcase_card_tag_${tagObject.tag}`;
            return (
              <Badge
                appearance="tint"
                size="medium"
                color="brand"
                key={key}
                className={styles.cardTag}
              >
                {tagObject.label}
              </Badge>
            );
          })}
        </>
      );
    }
  } else {
    return (
      <>
        {tagsByTypeSorted.map((tagObject, index) => {
          const key = `showcase_card_tag_${tagObject.tag}`;
          return (
            <Badge
              appearance="tint"
              size="medium"
              color="brand"
              key={key}
              shape="rounded"
            >
              {tagObject.label}
            </Badge>
          );
        })}
      </>
    );
  }
}

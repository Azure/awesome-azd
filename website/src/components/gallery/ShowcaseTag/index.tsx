/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { Tag, Tags, type User, type TagType } from "../../../data/tags";
import { TagList } from "../../../data/users";
import { sortBy } from "@site/src/utils/jsUtils";
import { Badge, Tooltip, makeStyles } from "@fluentui/react-components";

const TagComp = React.forwardRef<HTMLDivElement, Tag>(
  ({ label, description }, ref) => (
    <Badge
      appearance="outline"
      size="medium"
      ref={ref}
      title={description}
      color="informative"
      style={{
        alignContent: "center",
        fontSize: "10px",
        width:"auto",
      }}
    >
      {label}
    </Badge>
  )
);

const useStyles = makeStyles({
  tooltip: {
    textAlign: "center",
  },
});

export default function ShowcaseCardTag({
  tags,
  moreTag,
}: {
  tags: TagType[];
  moreTag: boolean;
}) {
  const tagObjects = tags
    .filter(
      (tagObject) =>
        tagObject != "msft" &&
        tagObject != "community" &&
        tagObject != "new" &&
        tagObject != "popular"
    )
    .map((tag) => ({ tag, ...Tags[tag] }));

  // Keep same order for all tags
  const tagObjectsSorted = sortBy(tagObjects, (tagObject) =>
    TagList.indexOf(tagObject.tag)
  );

  const checkAzureTag = tagObjectsSorted.filter((tag) =>
    tag.label.includes("Azure")
  );

  const length = tagObjectsSorted.length;
  let number = 10;
  if (checkAzureTag.length > 5) {
    number = 7;
  }
  const rest = length - number;

  const moreTagDetailList = tagObjectsSorted
    .slice(number, length)
    .map((tagObject) => tagObject.label)
    .join("\n");

  const style = useStyles();

  if (moreTag) {
    if (length > number) {
      return (
        <>
          {tagObjectsSorted.slice(0, number).map((tagObject, index) => {
            const id = `showcase_card_tag_${tagObject.tag}`;
            return <TagComp key={index} id={id} {...tagObject} />;
          })}
          <Tooltip
            withArrow
            content={{
              children: (
                <span style={{ whiteSpace: "pre-line" }}>
                  {moreTagDetailList}
                </span>
              ),
              className: style.tooltip,
            }}
            relationship="label"
          >
            <Badge
              appearance="outline"
              size="medium"
              color="informative"
              style={{
                alignContent: "center",
                fontSize: "10px",
                width: "auto",
              }}
            >
              + {rest} more
            </Badge>
          </Tooltip>
        </>
      );
    } else {
      return (
        <>
          {tagObjectsSorted.map((tagObject, index) => {
            const id = `showcase_card_tag_${tagObject.tag}`;
            return (
                <TagComp key={id} id={id} {...tagObject} />
            );
          })}
        </>
      );
    }
  } else {
    return (
      <>
        {tagObjectsSorted.map((tagObject, index) => {
          const id = `showcase_card_tag_${tagObject.tag}`;
          return (
            <div key={index} id={id} className={styles.cardPanelTag}>
              {tagObject.label}
            </div>
          );
        })}
      </>
    );
  }
}

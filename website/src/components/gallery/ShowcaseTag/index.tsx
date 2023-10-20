/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import { Tag, Tags, type User, type TagType } from "../../../data/tags";
import { TagList } from "../../../data/users";
import { sortBy } from "@site/src/utils/jsUtils";
import { Badge } from "@fluentui/react-components";

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
      }}
    >
      {label}
    </Badge>
  )
);

export function ShowcaseCardTag({
  tags,
  moreTag,
}: {
  tags: TagType[];
  moreTag: boolean;
}) {
  const tagObjects = tags.map((tag) => ({ tag, ...Tags[tag] }));

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

  if (moreTag) {
    if (length > number) {
      return (
        <>
          {tagObjectsSorted.slice(0, number).map((tagObject, index) => {
            const id = `showcase_card_tag_${tagObject.tag}`;
            if (
              tagObject.tag == "msft" ||
              tagObject.tag == "community" ||
              tagObject.tag == "new" ||
              tagObject.tag == "popular"
            ) {
              return;
            }
            return <TagComp key={index} id={id} {...tagObject} />;
          })}
          <Badge
            appearance="outline"
            size="medium"
            style={{
              alignContent: "center",
              borderColor: "#E0E0E0",
              color: "#616161",
              fontSize: "10px",
            }}
          >
            + {rest} more
          </Badge>
        </>
      );
    } else {
      return (
        <>
          {tagObjectsSorted.map((tagObject, index) => {
            const id = `showcase_card_tag_${tagObject.tag}`;
            if (
              tagObject.tag == "msft" ||
              tagObject.tag == "community" ||
              tagObject.tag == "new" ||
              tagObject.tag == "popular"
            ) {
              return;
            }
            return (
              <div key={id}>
                <TagComp id={id} {...tagObject} />
              </div>
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
          if (
            tagObject.tag == "msft" ||
            tagObject.tag == "community" ||
            tagObject.tag == "new" ||
            tagObject.tag == "popular"
          ) {
            return;
          }
          return (
            <div
              key={index}
              id={id}
              style={{
                height: "20px",
                alignContent: "center",
                border: "1px solid #E0E0E0",
                padding: "0 5px",
                marginTop: "3px",
                fontSize: "10px",
                minWidth: "0px",
                color: "#616161",
                fontWeight: "500",
                borderRadius: "100px",
              }}
            >
              {tagObject.label}
            </div>
          );
        })}
      </>
    );
  }
}

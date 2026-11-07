/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { Tags, type TagType } from "../../../data/tags";
import { tagList } from "../../../data/templates";
import { sortBy } from "@site/src/ai/utils/jsUtils";
import { Tooltip, Image } from "@fluentui/react-components";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { openai, meta, mistralai, deepseek } from "../../../data/tags";
import { useColorMode } from "@docusaurus/theme-common";

function ShowcaseIconImage({ src }: { src: string }) {
  return (
    <Image
      alt=""
      src={useBaseUrl(src)}
      height={16}
      width={16}
    />
  );
}

export default function ShowcaseCardIcon({
  tags,
  tagOrder = tagList,
}: {
  tags: TagType[];
  tagOrder?: readonly TagType[];
}) {
  const tagObjects = tags
    .filter((tagObject) => tagObject != "featured")
    .map((tag) => ({ tag, ...Tags[tag] }));
  const tagObjectsSorted = sortBy(tagObjects, (tagObject) =>
    tagOrder.indexOf(tagObject.tag)
  );
  const languageTags = tagObjectsSorted.filter((tag) =>
    tag.type == "Language");
  const uniqueOpenAITag = tagObjectsSorted.filter((tag) =>
    tag.type == "Model" && tag.subType === openai).slice(0, 1);
  const uniqueMetaTag = tagObjectsSorted.filter((tag) =>
    tag.type == "Model" && tag.subType === meta).slice(0, 1);
  const uniqueMistralAITag = tagObjectsSorted.filter((tag) =>
    tag.type == "Model" && tag.subType === mistralai).slice(0, 1);
  const uniqueDeepSeekTag = tagObjectsSorted.filter((tag) =>
    tag.type == "Model" && tag.subType === deepseek).slice(0, 1);
  const totalTags = [...languageTags, ...uniqueOpenAITag, ...uniqueMetaTag, ...uniqueMistralAITag, ...uniqueDeepSeekTag];
  const length = totalTags.length;
  let number = 3;
  const rest = length - number;

  const cardPanelDetailList = totalTags
    .slice(number, length)
    .map((tagObject) => tagObject.label)
    .join("\n");
  const additionalTechnologiesLabel = cardPanelDetailList.replace(
    /\n/g,
    ", ",
  );

  const { colorMode } = useColorMode();

  if (length > number && rest > 1) {
    return (
      <>
        {totalTags.slice(0, number).map((tagObject) => {
          const key = `showcase_card_icon_${tagObject.tag}`;
          const icon =
            tagObject.type === "Model"
              ? colorMode === "dark" && tagObject.subType?.darkIcon
                ? tagObject.subType.darkIcon
                : tagObject.subType?.icon
              : tagObject.icon;
          return (
            <Tooltip
              withArrow
              content={tagObject.label}
              relationship="inaccessible"
              key={key}
            >
              <span
                className={styles.icon}
                role="img"
                aria-label={tagObject.label}
              >
                <ShowcaseIconImage src={icon ?? ""} />
              </span>
            </Tooltip>
          );
        })}
        <Tooltip
          withArrow
          content={{
            children: (
              <span style={{ whiteSpace: "pre-line" }}>
                {cardPanelDetailList}
              </span>
            ),
          }}
          relationship="inaccessible"
          key={`showcase_card_icon_more`}
        >
          <span
            className={`${styles.icon} ${styles.toolTip}`}
            role="img"
            aria-label={`Additional technologies: ${additionalTechnologiesLabel}`}
          >
            +{rest}
          </span>
        </Tooltip>
      </>
    );
  } else {
    return (
      <>
        {totalTags.map((tagObject) => {
          const key = `showcase_card_icon_${tagObject.tag}`;
          const icon =
            tagObject.type === "Model"
              ? colorMode === "dark" && tagObject.subType?.darkIcon
                ? tagObject.subType.darkIcon
                : tagObject.subType?.icon
              : tagObject.icon;
          return (
            <Tooltip
              withArrow
              content={tagObject.label}
              relationship="inaccessible"
              key={key}
            >
              <span
                className={styles.icon}
                role="img"
                aria-label={tagObject.label}
              >
                <ShowcaseIconImage src={icon ?? ""} />
              </span>
            </Tooltip>
          );
        })}
      </>
    );
  }
}

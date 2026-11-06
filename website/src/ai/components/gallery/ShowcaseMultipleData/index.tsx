/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { type Template, Tags } from "../../../data/tags";
import { Link, Body1 } from "@fluentui/react-components";

function ShowcaseMultipleTypeAuthor(
  key: string,
  authorName: string,
  websiteLink: string,
  length: number,
  i: number
) {
  if (i != length - 1) {
    return (
      <Link
        key={key}
        href={websiteLink}
        target="_blank"
        rel="noopener noreferrer"
        appearance="subtle"
      >
        <Body1>{authorName},</Body1>
      </Link>
    );
  } else {
    return (
      <Link
        key={key}
        href={websiteLink}
        target="_blank"
        rel="noopener noreferrer"
        appearance="subtle"
      >
        <Body1>{authorName}</Body1>
      </Link>
    );
  }
}

function ShowcaseMultipleTypeData(
  key: string,
  data: string,
  length: number,
  i: number
) {
  if (i != length - 1) {
    return (
      <Body1 key={key} >{data},</Body1>
    );
  } else {
    return (
      <Body1 key={key} > {data}</Body1>
    );
  }
}

export default function ShowcaseMultipleData({
  template,
  tagType,
}: {
  template: Template;
  tagType: string;
}) {
  let i = 0;

  if (tagType === "author") {
    const authors = template.author;
    const websites = template.authorUrl;

    if (authors.length > 1) {
      if (authors.length != websites.length) {
        throw new Error(
          "The number of multiple authors(" +
          authors.length +
          ") and websites(" +
          websites.length +
          ") are not equal."
        );
      }

      return (
        <div className={styles.data}>
          {authors.map((value, index) => {
            return ShowcaseMultipleTypeAuthor(
              tagType + index,
              authors[index],
              websites[index],
              websites.length,
              i++,
            );
          })}
        </div >
      );
    }

    return (
      <Link
        key={tagType + i}
        href={websites[0]}
        target="_blank"
        rel="noopener noreferrer"
        appearance="subtle"
      >
        <Body1>{authors[0]}</Body1>
      </Link>
    );
  };

  if (tagType === "model") {
    const model = template.models;

    return (
      <div className={styles.data}>
        {model.length > 0 ? model.map((tag, index) => {
          const tagObject = Tags[tag];
          return ShowcaseMultipleTypeData(
            tagType + index,
            tagObject.label,
            model.length,
            i++,
          );
        }) :
          <Body1 key={tagType + i} >N/A</Body1>
        }
      </div>
    );
  };

  if (tagType === "language") {
    const language = template.language;

    return (
      <div className={styles.data}>
        {language.length > 0 ? language.map((tag, index) => {
          const tagObject = Tags[tag];
          return ShowcaseMultipleTypeData(
            tagType + index,
            tagObject.label,
            language.length,
            i++,
          );
        }) :
          <Body1 key={tagType + i} >N/A</Body1>
        }
      </div>
    );
  };
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { type User } from "../../../data/tags";
import { Link as FluentUILink } from "@fluentui/react-components";

export default function ShowcaseMultipleAuthors({
  user,
  cardPanel,
}: {
  user: User;
  cardPanel: boolean;
}) {
  const authors = user.author;
  const websites = user.authorUrl;
  const authorClassName = cardPanel
    ? styles.cardAuthorPanel
    : styles.cardAuthor;

  if (authors.includes(", ")) {
    const multiWebsites = websites.split(", ");
    const multiAuthors = authors.split(", ");

    if (multiWebsites.length != multiAuthors.length) {
      throw new Error(
        "The number of multiple authors and websites are not equal."
      );
    }
    return multiWebsites.map((website, index) => (
      <FluentUILink
        key={index}
        className={authorClassName}
        href={website}
        target="_blank"
        rel="noopener noreferrer"
      >
        {multiAuthors[index]}
        {index < multiWebsites.length - 1 ? "," : null}
      </FluentUILink>
    ));
  }

  return (
    <FluentUILink
      className={authorClassName}
      href={websites}
      target="_blank"
      rel="noopener noreferrer"
    >
      {authors}
    </FluentUILink>
  );
}

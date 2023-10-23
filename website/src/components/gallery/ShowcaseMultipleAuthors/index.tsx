/**
* Copyright (c) Microsoft Corporation. All rights reserved.
* Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { type User } from "../../../data/tags";
import { makeStyles, Link as FluentUILink } from "@fluentui/react-components";

const useStyles = makeStyles({
  cardAuthor: {
    color: "#6656d1",
  },
});

function ShowcaseMultipleWebsites(
  authorName: string,
  websiteLink: string,
  length: number,
  i: number
) {
  const styles = useStyles();
  if (i != length - 1) {
    return (
      <FluentUILink
        key={i}
        className={styles.cardAuthor}
        href={websiteLink}
        target="_blank"
      >
        {authorName},{" "}
      </FluentUILink>
    );
  } else {
    return (
      <FluentUILink
        key={i}
        className={styles.cardAuthor}
        href={websiteLink}
        target="_blank"
      >
        {authorName}
      </FluentUILink>
    );
  }
}

export default function ShowcaseMultipleAuthors({ user }: { user: User }) {
  const authors = user.author;
  const websites = user.website;
  const styles = useStyles();
  let i = 0;

  if (authors.includes(", ")) {
    var multiWebsites = websites.split(", ");
    var multiAuthors = authors.split(", ");

    return (
      <div
        style={{
          display: "-webkit-box",
          overflow: "hidden",
          WebkitLineClamp: "1",
          WebkitBoxOrient: "vertical",
        }}
      >
        {multiWebsites.map((value, index) => {
          return ShowcaseMultipleWebsites(
            multiAuthors[index],
            multiWebsites[index],
            multiWebsites.length,
            i++
          );
        })}
      </div>
    );
  }

  return (
    <FluentUILink className={styles.cardAuthor} href={websites} target="_blank">
      {authors}
    </FluentUILink>
  );
}

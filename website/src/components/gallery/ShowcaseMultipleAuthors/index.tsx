/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { type User } from "../../../data/tags";
import { makeStyles, Link as FluentUILink } from "@fluentui/react-components";
import useBaseUrl from "@docusaurus/useBaseUrl";

const useStyles = makeStyles({
  cardAuthor: {
    color: "#6656d1",
  },
});

function ShowcaseMultipleWebsites(
  authorName: string,
  websiteLink: string,
  length: number,
  i: number,
  cardPanel: boolean
) {
  const styles = useStyles();
  if (i != length - 1) {
    return (
      <>
        <FluentUILink
          key={i}
          className={styles.cardAuthor}
          href={websiteLink}
          target="_blank"
        >
          {authorName}
          {cardPanel ? (
            <FluentUILink
              href={websiteLink}
              target="_blank"
              style={{ color: "#6656d1" }}
            >
              {" "}
              <img
                src={useBaseUrl("/img/redirect.svg")}
                alt="Redirect"
                height={13}
              />
            </FluentUILink>
          ) : null}
          ,{" "}
        </FluentUILink>
      </>
    );
  } else {
    return (
      <>
        <FluentUILink
          key={i}
          className={styles.cardAuthor}
          href={websiteLink}
          target="_blank"
        >
          {authorName}{" "}
        </FluentUILink>
        {cardPanel ? (
          <FluentUILink
            href={websiteLink}
            target="_blank"
            style={{ color: "#6656d1" }}
          >
            <img
              src={useBaseUrl("/img/redirect.svg")}
              alt="Redirect"
              height={13}
            />
          </FluentUILink>
        ) : null}
      </>
    );
  }
}

export default function ShowcaseMultipleAuthors({
  user,
  cardPanel,
}: {
  user: User;
  cardPanel: boolean;
}) {
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
            i++,
            cardPanel
          );
        })}
      </div>
    );
  }

  return (
    <FluentUILink className={styles.cardAuthor} href={websites} target="_blank">
      {authors}{" "}
      {cardPanel ? (
        <FluentUILink
          href={websites}
          target="_blank"
          style={{ color: "#6656d1" }}
        >
          <img
            src={useBaseUrl("/img/redirect.svg")}
            alt="Redirect"
            height={13}
          />
        </FluentUILink>
      ) : null}
    </FluentUILink>
  );
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { type User } from "../../../data/tags";
import {
  makeStyles,
  Link as FluentUILink,
  Text,
} from "@fluentui/react-components";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";

function ShowcaseMultipleWebsites(
  key: number,
  authorName: string,
  websiteLink: string,
  length: number,
  i: number,
  cardPanel: boolean,
  colorMode: string
) {
  if (i != length - 1) {
    return (
      <div key={key}>
        {cardPanel ? (
          <FluentUILink
            key={i}
            href={websiteLink}
            className={styles.cardAuthorPanel}
            target="_blank"
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "5px",
            }}
          >
            {authorName}
            {colorMode != "dark" ? (
              <img
                src={useBaseUrl("/img/redirect.svg")}
                alt="Redirect"
                height={13}
              />
            ) : (
              <img
                src={useBaseUrl("/img/redirectDark.svg")}
                alt="Redirect"
                height={13}
              />
            )}
            ,
          </FluentUILink>
        ) : (
          <FluentUILink
            key={i}
            className={styles.cardAuthor}
            href={websiteLink}
            target="_blank"
          >
            {authorName},
          </FluentUILink>
        )}
      </div>
    );
  } else {
    return (
      <div key={key}>
        {cardPanel ? (
          <FluentUILink
            key={i}
            className={styles.cardAuthorPanel}
            href={websiteLink}
            target="_blank"
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "5px",
            }}
          >
            {authorName}
            {colorMode != "dark" ? (
              <img
                src={useBaseUrl("/img/redirect.svg")}
                alt="Redirect"
                height={13}
              />
            ) : (
              <img
                src={useBaseUrl("/img/redirectDark.svg")}
                alt="Redirect"
                height={13}
              />
            )}
          </FluentUILink>
        ) : (
          <FluentUILink
            key={i}
            className={styles.cardAuthor}
            href={websiteLink}
            target="_blank"
          >
            {authorName}
          </FluentUILink>
        )}
      </div>
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
  const { colorMode } = useColorMode();
  const authors = user.author;
  const websites = user.website;
  let i = 0;

  if (authors.includes(", ")) {
    var multiWebsites = websites.split(", ");
    var multiAuthors = authors.split(", ");

    if (multiWebsites.length != multiAuthors.length) {
      throw new Error(
        "The number of multiple authors and websites are not equal."
      );
    }
    return (
      <div
        style={{
          display: "-webkit-box",
          overflow: "hidden",
          WebkitLineClamp: "1",
          WebkitBoxOrient: "horizontal",
          gap: "3px",
        }}
      >
        {multiWebsites.map((value, index) => {
          return ShowcaseMultipleWebsites(
            index,
            multiAuthors[index],
            multiWebsites[index],
            multiWebsites.length,
            i++,
            cardPanel,
            colorMode
          );
        })}
      </div>
    );
  }

  return (
    <div>
      {cardPanel ? (
        <FluentUILink
          className={styles.cardAuthorPanel}
          href={websites}
          target="_blank"
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: "5px",
          }}
        >
          {authors}
          {colorMode != "dark" ? (
            <img
              src={useBaseUrl("/img/redirect.svg")}
              alt="Redirect"
              height={13}
            />
          ) : (
            <img
              src={useBaseUrl("/img/redirectDark.svg")}
              alt="Redirect"
              height={13}
            />
          )}
        </FluentUILink>
      ) : (
        <FluentUILink
          className={styles.cardAuthor}
          href={websites}
          target="_blank"
        >
          {authors}
        </FluentUILink>
      )}
    </div>
  );
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styleCSS from "./styles.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  Card,
  shorthands,
  makeStyles,
  CardFooter,
  Button,
  ToggleButton,
} from "@fluentui/react-components";

function closeCard(parentDiv) {
  let parent = document.getElementById(parentDiv);
  parent.style.display = "none";
  // access localStorage until window is defined
  if (typeof window !== "undefined") {
    localStorage.setItem("contributionCardDisplay", parent.style.display);
  }
}

const useStyles = makeStyles({
  card: {
    width: "350px",
    height: "368px",
    maxWidth: "100%",
    maxHeight: "100%",
    minWidth: "300px",
  },
});

export default function ShowcaseContributionCard(): React.ReactElement {
  const styles = useStyles();
  // access localStorage until window is defined
  if (
    typeof window !== "undefined" &&
    localStorage.getItem("contributionCardDisplay")
  ) {
    return null;
  }
  return (
    <Card
      className={styles.card}
      id="contributionCard"
      style={{ padding: "24px", borderRadius: "8px" }}
    >
      <ToggleButton
        onClick={() => closeCard("contributionCard")}
        size="small"
        appearance="transparent"
        style={{
          padding: "0px",
          margin: "0px",
          alignSelf: "flex-end",
          minWidth: "20px",
          height: "0px",
        }}
        icon={
          <img src={useBaseUrl("/img/close.svg")} height={20} alt="Close" />
        }
      ></ToggleButton>
      <img
        src={useBaseUrl("/img/contributionCard.svg")}
        alt="contributionCard"
        style={{ maxHeight: "110px", alignSelf: "flex-start" }}
      />
      <div
        style={{
          fontSize: "20px",
          fontWeight: "550",
          height: "0px",
        }}
      >
        See your template here!
      </div>
      <div
        style={{
          fontSize: "12px",
        }}
      >
        <p
          style={{
            margin: "0px",
          }}
        >
          awesome-azd is always welcoming template contributions! Our community
          is excited to see what you make.
        </p>
      </div>
      <CardFooter>
        <Button
          size="medium"
          appearance="primary"
          className={styleCSS.submitButton}
          onClick={() => {
            window.open(
              "https://azure.github.io/awesome-azd/docs/intro",
              "_blank"
            );
          }}
        >
          Submit a template
        </Button>
        <Button
          size="medium"
          appearance="transparent"
          className={styleCSS.requestButton}
          onClick={() => {
            window.open(
              "https://github.com/Azure/awesome-azd/issues/new?assignees=nigkulintya%2C+savannahostrowski&labels=requested-contribution&template=%F0%9F%A4%94-submit-a-template-request.md&title=%5BIdea%5D+%3Cyour-template-name%3E",
              "_blank"
            );
          }}
        >
          Request a template
        </Button>
      </CardFooter>
    </Card>
  );
}

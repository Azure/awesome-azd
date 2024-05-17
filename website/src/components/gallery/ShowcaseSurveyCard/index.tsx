/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  Card,
  CardFooter,
  Button,
  ToggleButton,
  Image,
  Body1Strong,
  Caption1,
} from "@fluentui/react-components";

function closeCard(parentDiv) {
  let parent = document.getElementById(parentDiv);
  parent.style.display = "none";
  // access localStorage until window is defined
  if (typeof window !== "undefined") {
    localStorage.setItem("surveyCardDisplay", parent.style.display);
  }
}

export default function ShowcaseSurveyCard(): React.ReactElement {
  // access localStorage until window is defined
  if (
    typeof window !== "undefined" &&
    localStorage.getItem("surveyCardDisplay")
  ) {
    return null;
  }
  return (
    <Card className={styles.card} appearance="filled" id="surveyCard">
      <ToggleButton
        onClick={() => closeCard("surveyCard")}
        size="small"
        appearance="transparent"
        icon={
          <Image
            src={useBaseUrl("/img/close.svg")}
            height={16}
            width={16}
            alt="Close"
          />
        }
        className={styles.closeButton}
      />
      <Image
        src={useBaseUrl("/img/chatPencil.svg")}
        alt="surveyCard"
        height={72}
        width={72}
      />
      <div className={styles.text}>
        <Body1Strong>Got a minute? We're all ears!</Body1Strong>
        <Caption1>Help us shape the future of our template library.</Caption1>
      </div>
      <CardFooter>
        <Button
          appearance="primary"
          className={styles.surveyButton}
          onClick={() => {
            window.open(
              "https://aka.ms/awesome-azd-survey",
              "_blank"
            );
          }}
          icon={
            <Image
              src={useBaseUrl("/img/openLink.svg")}
              alt="surveyCard"
              height={20}
              width={20}
            />
          }
        >
          Take the survey
        </Button>
      </CardFooter>
    </Card>
  );
}

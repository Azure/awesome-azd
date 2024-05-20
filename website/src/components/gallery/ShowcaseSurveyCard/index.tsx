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
  Body2,
  Subtitle1,
} from "@fluentui/react-components";
import { useColorMode } from "@docusaurus/theme-common";

const surveyCardLocalStorageID = "surveyCardDisplay";

function closeCard(parentDiv) {
  let parent = document.getElementById(parentDiv);
  parent.style.display = "none";
  // access localStorage until window is defined
  if (typeof window !== "undefined") {
    localStorage.setItem(surveyCardLocalStorageID, parent.style.display);
  }
}

export default function ShowcaseSurveyCard(): React.ReactElement {
  const { colorMode } = useColorMode();
  // access localStorage until window is defined
  if (
    typeof window !== "undefined" &&
    localStorage.getItem(surveyCardLocalStorageID)
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
        src={
          colorMode != "dark"
            ? useBaseUrl("/img/chatPencil.svg")
            : useBaseUrl("/img/chatPencilDark.svg")
        }
        alt="surveyCard"
        height={128}
        width={128}
      />
      <div className={styles.text}>
        <Subtitle1 align="center">Got a minute? We're all ears!</Subtitle1>
        <Body2 align="center">
          Help us shape the future of our template library by sharing your
          feedback.
        </Body2>
      </div>
      <CardFooter>
        <Button
          appearance="primary"
          size="large"
          className={styles.surveyButton}
          onClick={() => {
            window.open("https://aka.ms/awesome-azd-survey", "_blank");
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

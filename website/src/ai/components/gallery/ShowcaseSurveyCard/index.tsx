/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useState } from "react";
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

const surveyCardStorageKey = "surveyCardDisplay";

function isSurveyCardVisible() {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    return localStorage.getItem(surveyCardStorageKey) !== "none";
  } catch (error) {
    console.error("Unable to read survey card preference:", error);
    return true;
  }
}

export default function ShowcaseSurveyCard(): React.JSX.Element | null {
  const [isVisible, setIsVisible] = useState(true);
  const closeIcon = useBaseUrl("/img/ai/close.svg");
  const surveyIcon = useBaseUrl("/img/ai/chatPencil.svg");
  const openLinkIcon = useBaseUrl("/img/ai/openLink.svg");

  useEffect(() => {
    setIsVisible(isSurveyCardVisible());
  }, []);

  if (!isVisible) {
    return null;
  }

  const closeCard = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(surveyCardStorageKey, "none");
    } catch (error) {
      console.error("Unable to save survey card preference:", error);
    }
  };

  return (
    <Card className={styles.card} appearance="filled" id="surveyCard">
      <ToggleButton
        onClick={closeCard}
        size="small"
        appearance="transparent"
        icon={
          <Image
            src={closeIcon}
            height={16}
            width={16}
            alt="Close"
          />
        }
        className={styles.closeButton}
      />
      <Image
        src={surveyIcon}
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
          onClick={() => {
            window.open(
              "https://microsoft.qualtrics.com/jfe/form/SV_enBCM8eIU5PVvh4",
              "_blank",
              "noopener,noreferrer",
            );
          }}
          icon={
            <Image
              src={openLinkIcon}
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

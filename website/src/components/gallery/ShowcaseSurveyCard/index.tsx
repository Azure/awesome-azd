/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
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

export default function ShowcaseSurveyCard(): React.JSX.Element | null {
  const [storedDismissed, setStoredDismissed] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const skipNextPreferenceRead = useRef(false);
  useEffect(() => {
    // Keep the first dismissal CSS-only; later renders resync stored preferences.
    if (skipNextPreferenceRead.current) {
      if (dismissed) skipNextPreferenceRead.current = false;
      return;
    }
    let preference = false;
    try {
      preference = Boolean(window.localStorage.getItem(surveyCardLocalStorageID));
    } catch (error) {
      console.warn("Unable to read survey dismissal preference.", error);
    }
    if (storedDismissed === true && !preference) setDismissed(false);
    setStoredDismissed(preference);
  });
  const dismissSurvey = () => {
    skipNextPreferenceRead.current = true;
    setDismissed(true);
    try {
      window.localStorage.setItem(surveyCardLocalStorageID, "none");
    } catch (error) {
      console.warn("Unable to save survey dismissal preference.", error);
    }
  };
  const { colorMode } = useColorMode();
  const closeIcon = useBaseUrl("/img/close.svg");
  const surveyIcon = useBaseUrl(
    colorMode != "dark" ? "/img/chatPencil.svg" : "/img/chatPencilDark.svg"
  );
  const openLinkIcon = useBaseUrl("/img/openLink.svg");
  if (storedDismissed !== false) {
    return null;
  }

  return (
    <Card className={clsx(styles.card, dismissed && styles.dismissed)} appearance="filled" id="surveyCard">
      <ToggleButton
        onClick={dismissSurvey}
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

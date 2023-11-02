/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect } from "react";
import Layout from "@theme/Layout";
import ShowcaseLeftFilters from "../components/gallery/ShowcaseLeftFilters";
import ShowcaseTemplateSearch, {
  UserState,
} from "../components/gallery/ShowcaseTemplateSearch";
import {
  teamsLightTheme,
  teamsDarkTheme,
  Spinner,
  FluentProvider,
} from "@fluentui/react-components";
import { initializeIcons } from "@fluentui/react/lib/Icons";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

import styles from "./styles.module.css";
import EventEmitter from "../utils/EventEmitter";
import { useColorMode } from "@docusaurus/theme-common";
import { ShowcaseCardPage } from "./ShowcaseCardPage"

initializeIcons();

export function prepareUserState(): UserState | undefined {
  if (ExecutionEnvironment.canUseDOM) {
    return {
      scrollTopPosition: window.scrollY,
      focusedElementId: document.activeElement?.id,
    };
  }

  return undefined;
}

const App = () => {
  const { colorMode, setColorMode } = useColorMode();
  EventEmitter.addListener("switchColorMode", () => {
    colorMode == "dark" ? setColorMode("light") : setColorMode("dark");
  });

  return (
    <>
      <FluentProvider
        theme={colorMode == "dark" ? teamsDarkTheme : teamsLightTheme}
      >
        <ShowcaseTemplateSearch />
        <div className={styles.filterAndCard}>
          <div className={styles.filter}>
            <ShowcaseLeftFilters />
          </div>
          <div className={styles.card}>
            <ShowcaseCardPage />
          </div>
        </div>
      </FluentProvider>
    </>
  );
};

export default function Showcase(): JSX.Element {
  return (
    <Layout>
      <App />
    </Layout>
  );
};

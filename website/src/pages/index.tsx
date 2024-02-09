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
  FluentProvider,
} from "@fluentui/react-components";
import { initializeIcons } from "@fluentui/react/lib/Icons";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

import styles from "./styles.module.css";
import { useColorMode } from "@docusaurus/theme-common";
import ShowcaseCardPage from "./ShowcaseCardPage";
import { ApplicationInsights } from "@microsoft/1ds-analytics-web-js";

initializeIcons();

// Adobe Analytics
const analytics: ApplicationInsights = new ApplicationInsights();
var config = {
  instrumentationKey:
    "41c1099574f14f06bdce4f80fcd0a65c-4a29467c-f5d4-4151-8e8b-62c0a3515947-7118",
  channelConfiguration: {
    // Post channel configuration
    eventsLimitInMem: 5000,
  },
  propertyConfiguration: {
    // Properties Plugin configuration
    userAgent: "Custom User Agent",
  },
  webAnalyticsConfiguration: {
    // Web Analytics Plugin configuration
    autoCapture: {
      scroll: true,
      pageView: true,
      onLoad: true,
      onUnload: true,
      click: true,
      resize: true,
      jsError: true,
    },
  },
};
analytics.initialize(config, []);

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
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  return !loading ? (
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
  ) : null;
};

export default function Showcase(): JSX.Element {
  return (
    <Layout>
      <App />
    </Layout>
  );
}

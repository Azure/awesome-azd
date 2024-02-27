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
import {
  MessageBar,
  MessageBarActions,
  MessageBarTitle,
  MessageBarBody,
  Button,
  Link,
} from "@fluentui/react-components";

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

// declare var window: Window & typeof globalThis;
// declare interface window {
//   WcpConsent: any;
// }
// declare var window: {
//   WcpConsent: any;
// };
// let siteConsent = null;
// let WcpConsent = window.WcpConsent;
// const handleLoad = () => {
//   // this block will run after the entire page has loaded
//   function onConsentChanged(categoryPreferences) {
//     console.log("onConsentChanged", categoryPreferences);
//   }

//   WcpConsent &&
//     WcpConsent.init(
//       "en-US",
//       "cookie-banner",
//       function (err, _siteConsent) {
//         if (!err) {
//           siteConsent = _siteConsent; //siteConsent is used to get the current consent
//         } else {
//           console.log("Error initializing WcpConsent: " + err);
//         }
//       },
//       onConsentChanged
//     );
//   console.log("Yo, my page has completely loaded!");
// };

const App = () => {
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // window.addEventListener("load", handleLoad);

    setTimeout(() => {
      setLoading(false);
    }, 500);

    // Cleanup -> Remove the event listener on unmount
    // return () => {
    //   window.removeEventListener("load", handleLoad);
    // };
  }, []);

  return !loading ? (
    <FluentProvider
      theme={colorMode == "dark" ? teamsDarkTheme : teamsLightTheme}
    >
      <div id="cookie-banner"></div>
      {/* <MessageBar>
        <MessageBarBody>
          <MessageBarTitle>Cookie Consent</MessageBarTitle>
          We use optional cookies to improve your experience on our websites,
          such as through social media connections, and to display personalized
          advertising based on your online activity. If you reject optional
          cookies, only cookies necessary to provide you the services will be
          used. You may change your selection by clicking “Manage Cookies” at
          the bottom of the page.
          <Link href="https://privacy.microsoft.com/en-us/privacystatement">
            Privacy Statement
          </Link>{" "}
          <Link href="https://support.microsoft.com/en-us/topic/third-party-cookie-inventory-81ca0c3d-c122-415c-874c-55610e017a6a">
            Third-Party Cookies
          </Link>
        </MessageBarBody>
        <MessageBarActions
          containerAction={
            <Button aria-label="dismiss" appearance="transparent" />
          }
        >
          <Button>Accept</Button>
          <Button>Reject</Button>
          <Button>Manage Cookies</Button>
        </MessageBarActions>
      </MessageBar> */}
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

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  Text,
  teamsLightTheme,
  teamsDarkTheme,
  makeStyles,
  typographyStyles,
  FluentProvider,
} from "@fluentui/react-components";
import { useColorMode } from "@docusaurus/theme-common";
import styles from "./styles.module.css";

const useStyles = makeStyles({
  largeTitle: typographyStyles.largeTitle,
  title3: typographyStyles.title3,
  subtitle1: typographyStyles.subtitle1,
});

function HomepageHeader({ colorMode }) {
  const style = useStyles();
  return (
    <header className={styles.heroBanner}>
      <img
        src={
          colorMode != "dark"
            ? useBaseUrl("/img/coverBackground.png")
            : useBaseUrl("/img/coverBackgroundDark.png")
        }
        className={styles.cover}
        onError={({ currentTarget }) => {
          currentTarget.style.display = "none";
        }}
        alt=""
      />
      <div className={styles.section}>
        <div className={styles.description}>
          <h1>
            <Text
              className={style.largeTitle}
              style={{ marginBottom: "6px", color: "#242424" }}
            >
              Accelerate your journey to the cloud with azd
            </Text>
          </h1>
          <Text className={style.title3} style={{ color: "#242424" }}>
            Azure Developer CLI (azd) is an open-source tool that accelerates
            your application’s journey from local development to Azure.
          </Text>
        </div>
        <div className={styles.video}>
          <iframe
            className={styles.iframe}
            src="https://www.youtube.com/embed/9z3PiHSCcYs?si=F1yKpoiOQnzb4o-K"
            title="Azure Developer CLI: GitHub to cloud in minutes - Universe 2022"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </header>
  );
}

const HomeApp = () => {
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, []);

  return !loading ? (
    <FluentProvider
      theme={colorMode == "dark" ? teamsDarkTheme : teamsLightTheme}
      className={styles.backgroundColor}
    >
      <div className={styles.container}>
        <HomepageHeader colorMode={colorMode} />
        <HomepageFeatures />
      </div>
    </FluentProvider>
  ) : null;
};

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomeApp />
    </Layout>
  );
}

import React, { useState, useEffect } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  Text,
  Spinner,
  teamsLightTheme,
  teamsDarkTheme,
  FluentProvider,
} from "@fluentui/react-components";
import EventEmitter from "../../utils/EventEmitter";
import { useColorMode } from "@docusaurus/theme-common";
import styles from "./styles.module.css";

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      <img
        src={useBaseUrl("/img/coverBackground.png")}
        className={styles.cover}
        onError={({ currentTarget }) => {
          currentTarget.style.display = "none";
        }}
        alt=""
      />
      <div className={styles.section}>
        <div className={styles.description}>
          <Text>
            Accelerate your journey to the cloud with azd
          </Text>
          <Text>
            Azure Developer CLI (azd) is an open-source tool that accelerates
            your application’s journey from local development to Azure
          </Text>
        </div>
        <div>
          <iframe
            className={styles.video}
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
  const { colorMode, setColorMode } = useColorMode();
  EventEmitter.addListener("switchColorMode", () => {
    colorMode == "dark" ? setColorMode("light") : setColorMode("dark");
  });

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  return (
    <FluentProvider
      theme={colorMode == "dark" ? teamsDarkTheme : teamsLightTheme}
    >
      {loading ? (
        <div className={styles.load}>
          <Spinner labelPosition="below" label="Loading..." />
        </div>
      ) : (
        <div className="container">
          <HomepageHeader />
          <HomepageFeatures />
        </div>
      )}
    </FluentProvider>
  );
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

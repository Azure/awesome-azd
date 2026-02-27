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
              className={`${style.largeTitle} ${styles.heroText}`}
              style={{ marginBottom: "6px" }}
            >
              Ship to Azure in minutes, not days
            </Text>
          </h1>
          <Text className={`${style.title3} ${styles.heroText}`}>
            Azure Developer CLI (azd) is an open-source tool that takes you from
            a local dev environment to Azure with just a few commands. Pick a
            template, run azd up, and you’re live.
          </Text>
        </div>
        <div className={styles.video}>
          <iframe
            className={styles.iframe}
            src="https://www.youtube.com/embed/9z3PiHSCcYs?si=F1yKpoiOQnzb4o-K"
            title="Azure Developer CLI: GitHub to cloud in minutes"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </header>
  );
}

const steps = [
  {
    number: "1",
    title: "Install the Azure Developer CLI",
    description:
      "Get azd on your machine with a single command. Works on Windows, macOS, and Linux.",
    command: "winget install microsoft.azd",
    link: "https://aka.ms/azd-install",
    linkText: "All install options →",
  },
  {
    number: "2",
    title: "Pick a template",
    description:
      "Browse 290+ production-ready templates covering web apps, APIs, AI, microservices, and more.",
    command: "azd init --template todo-nodejs-mongo",
    link: "/awesome-azd/",
    linkText: "Browse templates →",
  },
  {
    number: "3",
    title: "Deploy to Azure",
    description:
      "One command provisions your infrastructure, builds your app, and deploys everything to Azure.",
    command: "azd up",
    link: "https://learn.microsoft.com/azure/developer/azure-developer-cli/get-started",
    linkText: "Read the full guide →",
  },
];

function StepByStep() {
  return (
    <section className={styles.stepsSection}>
      <h2 className={styles.sectionHeading}>Get started in 3 steps</h2>
      <div className={styles.stepsGrid}>
        {steps.map((step) => (
          <div key={step.number} className={styles.stepCard}>
            <div className={styles.stepNumber}>{step.number}</div>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDescription}>{step.description}</p>
            <code className={styles.stepCommand}>{step.command}</code>
            <a href={step.link} className={styles.stepLink}>
              {step.linkText}
            </a>
          </div>
        ))}
      </div>
    </section>
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
      <main className={styles.container}>
        <HomepageHeader colorMode={colorMode} />
        <StepByStep />
        <HomepageFeatures />
      </main>
    </FluentProvider>
  ) : null;
};

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Get Started with ${siteConfig.title}`}
      description="Get started with Azure Developer CLI - deploy to Azure in minutes"
    >
      <HomeApp />
    </Layout>
  );
}

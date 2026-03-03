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
  teamsLightTheme,
  teamsDarkTheme,
  FluentProvider,
} from "@fluentui/react-components";
import { useColorMode } from "@docusaurus/theme-common";
import styles from "./styles.module.css";

function HomepageHeader() {
  const browseUrl = useBaseUrl("/");
  return (
    <header className={styles.heroBanner}>
      <div className={styles.section}>
        <div className={styles.description}>
          <span className={styles.openSourceBadge}>
            &#9733; 290+ production ready templates
          </span>
          <h1 className={styles.heroTitle}>
            Pick a template.<br />
            Deploy to Azure.<br />
            <span className={styles.heroTitleAccent}>Ship in minutes.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            The Azure Developer CLI takes your code from local dev to Azure.
            Initialize with <code className={styles.heroInlineCode}>azd init</code>,
            deploy with <code className={styles.heroInlineCode}>azd up</code> &#8212; infrastructure and
            app, all at once.
          </p>
          <div className={styles.heroActions}>
            <a href={browseUrl} className={styles.heroPrimaryButton}>
              &#9654; Browse templates
            </a>
            <a
              href="https://learn.microsoft.com/azure/developer/azure-developer-cli/get-started"
              className={styles.heroSecondaryButton}
            >
              Get started &#8594;
            </a>
          </div>
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
      "One-line install for macOS, Linux, and Windows.",
    command: "winget install microsoft.azd",
  },
  {
    number: "2",
    title: "Pick a template",
    description:
      "Browse 290+ templates covering web apps, APIs, AI, microservices, and more.",
    command: "azd init --template todo-nodejs",
  },
  {
    number: "3",
    title: "Deploy to Azure",
    description:
      "Provisions your infrastructure, builds your app, and deploys everything to Azure.",
    command: "azd up",
  },
];


const heroTemplates = [
  {
    title: "React Web App with Node.js API and MongoDB",
    description: "Full-stack JavaScript app with React frontend, Node.js API, and Azure Cosmos DB.",
    command: "azd init --template todo-nodejs-mongo",
    source: "https://github.com/Azure-Samples/todo-nodejs-mongo",
    tags: ["JavaScript", "React", "Cosmos DB"],
  },
  {
    title: "Chat with AI using Python",
    description: "Use Azure OpenAI GPT models to build an AI-powered chat application.",
    command: "azd init --template openai-chat-app-quickstart",
    source: "https://github.com/Azure-Samples/openai-chat-app-quickstart",
    tags: ["Python", "Azure OpenAI", "AI"],
  },
  {
    title: "Containerized App on Azure",
    description: "Deploy a container app with Azure Container Apps, Key Vault, and monitoring.",
    command: "azd init --template todo-python-mongo-aca",
    source: "https://github.com/Azure-Samples/todo-python-mongo-aca",
    tags: ["Python", "Container Apps", "Cosmos DB"],
  },
];

function FeaturedTemplates() {
  return (
    <section className={styles.featuredSection}>
      <h2 className={styles.sectionHeading}>Start with a featured template</h2>
      <p className={styles.featuredSubtext}>
        These popular templates cover common scenarios and are a great way to see azd in action.
      </p>
      <div className={styles.featuredGrid}>
        {heroTemplates.map((tmpl) => (
          <a key={tmpl.title} href={tmpl.source} target="_blank" rel="noopener noreferrer" className={styles.featuredCard}>
            <h3 className={styles.featuredTitle}>{tmpl.title}</h3>
            <p className={styles.featuredDescription}>{tmpl.description}</p>
            <code className={styles.stepCommand}>{tmpl.command}</code>
            <div className={styles.featuredTags}>
              {tmpl.tags.map((tag) => (
                <span key={tag} className={styles.featuredTag}>{tag}</span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function StepByStep() {
  return (
    <section className={styles.stepsSection}>
      <h2 className={styles.stepsLabel}>Get started in 3 steps</h2>
      <div className={styles.stepsGrid}>
        {steps.map((step) => (
          <div key={step.number} className={styles.stepCard}>
            <div className={styles.stepNumber}>{step.number}</div>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDescription}>{step.description}</p>
            <code className={styles.stepCommand}>{step.command}</code>
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
        <HomepageHeader />
        <StepByStep />
        <FeaturedTemplates />
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
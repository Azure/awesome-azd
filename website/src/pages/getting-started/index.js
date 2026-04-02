/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect, useCallback } from "react";
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

function CopyableCommand({ command }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [command]);
  return (
    <div className={styles.commandWrapper}>
      <code className={styles.stepCommand}>{command}</code>
      <button
        className={styles.copyButton}
        onClick={handleCopy}
        aria-label={`Copy command: ${command}`}
        title="Copy to clipboard"
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4h1V3H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-1H9v1H4V4z" fill="currentColor"/>
            <path d="M7 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H7zm0 1h5v8H7V2z" fill="currentColor"/>
          </svg>
        )}
      </button>
    </div>
  );
}

function HomepageHeader() {
  const browseUrl = useBaseUrl("/");
  return (
    <header className={styles.heroBanner}>
      <div className={styles.section}>
        <div className={styles.description}>
          <span className={styles.openSourceBadge}>
            &#9679; 290+ production-ready templates
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
            <CopyableCommand command={tmpl.command} />
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
      <h2 className={styles.sectionHeading}>Get started in 3 steps</h2>
      <div className={styles.stepsGrid}>
        {steps.map((step) => (
          <div key={step.number} className={styles.stepCard}>
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>{step.number}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
            </div>
            <p className={styles.stepDescription}>{step.description}</p>
            <CopyableCommand command={step.command} />
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
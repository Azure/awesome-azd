/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Link from "@docusaurus/Link";
import {
  Text,
  teamsLightTheme,
  teamsDarkTheme,
  makeStyles,
  typographyStyles,
  FluentProvider,
  Card,
  CardHeader,
  Body1,
} from "@fluentui/react-components";
import { useColorMode } from "@docusaurus/theme-common";
import styles from "./styles.module.css";
import { Capabilities } from "@site/src/data/extensions";
import { sortedExtensions } from "@site/src/data/extensions";

const useStyles = makeStyles({
  largeTitle: typographyStyles.largeTitle,
  title1: typographyStyles.title1,
  title2: typographyStyles.title2,
  title3: typographyStyles.title3,
  subtitle1: typographyStyles.subtitle1,
  body1: typographyStyles.body1,
});

function ExtensionsHeader({ colorMode }) {
  const style = useStyles();
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroContent}>
        <h1>
          <Text className={`${style.largeTitle} ${styles.heroText}`}>
            Azure Developer CLI Extensions
          </Text>
        </h1>
        <Text className={`${style.title3} ${styles.heroSubtext}`}>
          Extend and enhance your Azure Developer CLI experience with powerful extensions
        </Text>
        <div className={styles.heroButtons}>
          <Link
            className={`button button--primary button--lg ${styles.heroButton}`}
            to="/extensions/gallery"
          >
            Browse Extensions
          </Link>
          <Link
            className={`button button--secondary button--lg ${styles.heroButton}`}
            to="https://github.com/Azure/azure-dev/blob/main/cli/azd/docs/extension-framework.md"
          >
            Build an Extension
          </Link>
        </div>
      </div>
    </header>
  );
}

function WhatAreExtensions() {
  const style = useStyles();
  return (
    <section className={styles.section}>
      <div className={styles.sectionContent}>
        <h2 className={style.title1}>What are azd Extensions?</h2>
        <p className={style.body1}>
          Azure Developer CLI (azd) extensions are powerful add-ons that enhance and customize your development workflow. 
          Extensions enable you to add custom commands, automate lifecycle events, integrate with specialized Azure services, 
          and extend azd with capabilities tailored to your specific needs.
        </p>
        <p className={style.body1}>
          Extensions are distributed through registries (similar to npm or NuGet feeds) and can be easily installed, 
          managed, and upgraded using azd's built-in extension management commands.
        </p>
      </div>
    </section>
  );
}

function CapabilitiesShowcase() {
  const style = useStyles();
  const capabilities = [
    {
      id: "custom-commands",
      title: "Custom Commands",
      description: "Add new CLI commands to azd that provide additional functionality specific to your workflow or domain.",
      icon: "⚡",
      example: "azd mycommand deploy --environment prod",
    },
    {
      id: "lifecycle-events",
      title: "Lifecycle Events",
      description: "Hook into project and service lifecycle events to run custom logic at key stages like preprovision, prepackage, and predeploy.",
      icon: "🔄",
      example: "Run validation checks before provisioning resources",
    },
    {
      id: "service-target-provider",
      title: "Service Target Providers",
      description: "Implement custom deployment patterns and service targets for specialized Azure services or unique infrastructure needs.",
      icon: "🎯",
      example: "Deploy to custom Azure services or platforms",
    },
    {
      id: "mcp-server",
      title: "MCP Server Support",
      description: "Integrate Model Context Protocol (MCP) servers to enhance AI-powered development experiences.",
      icon: "🤖",
      example: "Connect AI tools and assistants to your azd workflow",
    },
  ];

  return (
    <section className={styles.capabilitiesSection}>
      <div className={styles.sectionContent}>
        <h2 className={style.title1}>Extension Capabilities</h2>
        <div className={styles.capabilitiesGrid}>
          {capabilities.map((cap) => (
            <Card key={cap.id} className={styles.capabilityCard}>
              <CardHeader
                header={
                  <div className={styles.capabilityHeader}>
                    <span className={styles.capabilityIcon}>{cap.icon}</span>
                    <Text className={style.title3}>{cap.title}</Text>
                  </div>
                }
              />
              <Body1 className={styles.capabilityDescription}>
                {cap.description}
              </Body1>
              <div className={styles.capabilityExample}>
                <Text className={styles.exampleLabel}>Example:</Text>
                <code className={styles.exampleCode}>{cap.example}</code>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedExtensions() {
  const style = useStyles();
  const featuredExtensions = sortedExtensions
    .filter(ext => ext.tags.includes('featured') || ext.tags.includes('msft'))
    .slice(0, 3);

  return (
    <section className={styles.featuredSection}>
      <div className={styles.sectionContent}>
        <h2 className={style.title1}>Featured Extensions</h2>
        <div className={styles.extensionsGrid}>
          {featuredExtensions.map((ext) => (
            <Card key={ext.id} className={styles.extensionCard}>
              <CardHeader
                header={<Text className={style.title3}>{ext.title}</Text>}
                description={<Text className={styles.namespace}>@{ext.namespace}</Text>}
              />
              <Body1 className={styles.extensionDescription}>
                {ext.description}
              </Body1>
              <div className={styles.extensionMeta}>
                <div className={styles.capabilities}>
                  {ext.capabilities.slice(0, 2).map((cap) => (
                    <span key={cap} className={styles.capabilityBadge}>
                      {Capabilities[cap]?.label || cap}
                    </span>
                  ))}
                  {ext.capabilities.length > 2 && (
                    <span className={styles.capabilityBadge}>
                      +{ext.capabilities.length - 2} more
                    </span>
                  )}
                </div>
                <div className={styles.version}>
                  v{ext.latestVersion?.version}
                </div>
              </div>
              {ext.latestVersion?.usage && (
                <div className={styles.installCommand}>
                  <code>azd extension install {ext.namespace}</code>
                </div>
              )}
            </Card>
          ))}
        </div>
        <div className={styles.viewAllLink}>
          <Link
            className="button button--primary button--lg"
            to="/extensions/gallery"
          >
            View All Extensions
          </Link>
        </div>
      </div>
    </section>
  );
}

function GettingStarted() {
  const style = useStyles();
  return (
    <section className={styles.gettingStartedSection}>
      <div className={styles.sectionContent}>
        <h2 className={style.title1}>Getting Started with Extensions</h2>
        <div className={styles.stepsGrid}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={style.title3}>Browse Extensions</h3>
            <p className={style.body1}>
              Explore the extension gallery to find extensions that fit your needs. 
              Filter by capabilities, author, or search by name.
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={style.title3}>Install an Extension</h3>
            <p className={style.body1}>
              Install extensions using the azd CLI:
            </p>
            <code className={styles.codeBlock}>azd extension install &lt;extension-name&gt;</code>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={style.title3}>Use the Extension</h3>
            <p className={style.body1}>
              Start using the extension's features in your azd workflow. 
              Check the extension's documentation for specific usage instructions.
            </p>
          </div>
        </div>
        <div className={styles.learnMoreLinks}>
          <Link
            to="https://github.com/Azure/azure-dev/blob/main/cli/azd/docs/extension-framework.md"
            className={styles.learnMoreLink}
          >
            📚 Extension Framework Documentation
          </Link>
          <Link
            to="https://github.com/Azure/azure-dev/blob/main/cli/azd/docs/extension-framework-services.md"
            className={styles.learnMoreLink}
          >
            🔧 Extension Services Reference
          </Link>
        </div>
      </div>
    </section>
  );
}

const ExtensionsApp = () => {
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, []);

  return !loading ? (
    <FluentProvider
      theme={colorMode === "dark" ? teamsDarkTheme : teamsLightTheme}
      className={styles.backgroundColor}
    >
      <main className={styles.container}>
        <ExtensionsHeader colorMode={colorMode} />
        <WhatAreExtensions />
        <CapabilitiesShowcase />
        <FeaturedExtensions />
        <GettingStarted />
      </main>
    </FluentProvider>
  ) : null;
};

export default function Extensions() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Azure Developer CLI Extensions"
      description="Discover and install extensions to enhance your Azure Developer CLI experience"
    >
      <ExtensionsApp />
    </Layout>
  );
}

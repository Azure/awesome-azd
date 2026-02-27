/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect, useMemo } from "react";
import Layout from "@theme/Layout";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { Text, Button } from "@fluentui/react-components";
import { useColorMode } from "@docusaurus/theme-common";
import {
  FluentProvider,
  teamsLightTheme,
  teamsDarkTheme,
} from "@fluentui/react-components";
import styles from "./styles.module.css";

// Lazy-load templates at build time
const allTemplates = require("@site/static/templates.json");

export interface ServicePageConfig {
  serviceTag: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  quickStart: { command: string; description: string }[];
  resources: { title: string; url: string; description: string }[];
}

function TemplateCard({ template }: { template: any }) {
  const preview = useBaseUrl(template.preview || "/img/default.png");
  return (
    <a href={template.source} target="_blank" rel="noopener noreferrer" className={styles.templateCard}>
      <img src={preview} alt={template.title} className={styles.templateImage} />
      <div className={styles.templateContent}>
        <h3 className={styles.templateTitle}>{template.title}</h3>
        <p className={styles.templateDescription}>{template.description}</p>
        <div className={styles.templateMeta}>
          {template.author && <span className={styles.author}>by {template.author}</span>}
        </div>
      </div>
    </a>
  );
}

function ServicePageContent({ config }: { config: ServicePageConfig }) {
  const { colorMode } = useColorMode();
  const icon = useBaseUrl(config.icon);

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter(
      (t: any) =>
        t.tags?.includes(config.serviceTag) ||
        t.azureServices?.includes(config.serviceTag)
    );
  }, [config.serviceTag]);

  const featured = filteredTemplates.slice(0, 6);
  const hasMore = filteredTemplates.length > 6;

  return (
    <FluentProvider theme={colorMode === "dark" ? teamsDarkTheme : teamsLightTheme}>
      <main className={styles.page}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroIcon}>
              <img src={icon} alt={config.title} width={48} height={48} />
            </div>
            <h1 className={styles.heroTitle}>{config.title}</h1>
            <p className={styles.heroTagline}>{config.tagline}</p>
            <p className={styles.heroDescription}>{config.description}</p>
            <div className={styles.heroStats}>
              <span className={styles.statBadge}>{filteredTemplates.length} templates</span>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick start</h2>
          <div className={styles.quickStartGrid}>
            {config.quickStart.map((step, i) => (
              <div key={i} className={styles.quickStartStep}>
                <span className={styles.stepNumber}>{i + 1}</span>
                <p className={styles.stepDescription}>{step.description}</p>
                <code className={styles.stepCommand}>{step.command}</code>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Templates */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Featured templates</h2>
          <div className={styles.templateGrid}>
            {featured.map((t: any) => (
              <TemplateCard key={t.title} template={t} />
            ))}
          </div>
          {hasMore && (
            <div className={styles.viewAll}>
              <a
                href={`/awesome-azd/?tags=${config.serviceTag}`}
                className={styles.viewAllLink}
              >
                View all {filteredTemplates.length} templates →
              </a>
            </div>
          )}
        </section>

        {/* Resources */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Resources</h2>
          <div className={styles.resourceGrid}>
            {config.resources.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className={styles.resourceCard}>
                <h3 className={styles.resourceTitle}>{r.title}</h3>
                <p className={styles.resourceDescription}>{r.description}</p>
              </a>
            ))}
          </div>
        </section>
      </main>
    </FluentProvider>
  );
}

export default function ServiceLandingPage({ config }: { config: ServicePageConfig }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <Layout title={config.title} description={config.description}>
      {loaded && <ServicePageContent config={config} />}
    </Layout>
  );
}

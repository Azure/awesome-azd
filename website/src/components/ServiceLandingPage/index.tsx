/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import useBaseUrl from "@docusaurus/useBaseUrl";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { useColorMode } from "@docusaurus/theme-common";
import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
} from "@fluentui/react-components";
import type { CatalogTemplate } from "@site/src/catalog/catalogTypes";
import type { ServicePageConfig } from "@site/src/catalog/servicePages";
import styles from "./styles.module.css";

type ServiceTemplate = Pick<
  CatalogTemplate,
  | "source"
  | "detailPath"
  | "title"
  | "description"
  | "authors"
  | "preview"
  | "screenshot"
  | "architectureDiagram"
>;

type ServicePageData = {
  config: ServicePageConfig;
  templates: ServiceTemplate[];
  templateCount: number;
};

function TemplateCard({ template }: { template: ServiceTemplate }) {
  const preview = useBaseUrl(
    template.preview ||
      template.screenshot ||
      template.architectureDiagram ||
      "/img/logo.png",
  );
  const detailUrl = useBaseUrl(template.detailPath);
  return (
    <Link
      to={detailUrl}
      className={styles.templateCard}
    >
      <img src={preview} alt={template.title} className={styles.templateImage} />
      <div className={styles.templateContent}>
        <h3 className={styles.templateTitle}>{template.title}</h3>
        <p className={styles.templateDescription}>{template.description}</p>
        <div className={styles.templateMeta}>
          {template.authors.length > 0 && (
            <span className={styles.author}>
              by {template.authors.join(", ")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function FluentWrapper({ children }: { children: React.ReactNode }) {
  const { colorMode } = useColorMode();
  return (
    <FluentProvider theme={colorMode === "dark" ? webDarkTheme : webLightTheme}>
      {children}
    </FluentProvider>
  );
}

function ServicePageContent({ servicePage }: { servicePage: ServicePageData }) {
  const { config, templates, templateCount } = servicePage;
  const icon = useBaseUrl(config.icon);
  const baseUrl = useBaseUrl("/templates");
  const hasMore = templateCount > templates.length;

  const content = (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>
            <img src={icon} alt={config.title} width={48} height={48} />
          </div>
          <h1 className={styles.heroTitle}>{config.title}</h1>
          <p className={styles.heroTagline}>{config.tagline}</p>
          <p className={styles.heroDescription}>{config.description}</p>
          <div className={styles.heroStats}>
            <span className={styles.statBadge}>{templateCount} templates</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick start</h2>
        <div className={styles.quickStartGrid}>
          {config.quickStart.map((step, index) => (
            <div key={step.command} className={styles.quickStartStep}>
              <span className={styles.stepNumber}>{index + 1}</span>
              <p className={styles.stepDescription}>{step.description}</p>
              <code className={styles.stepCommand}>{step.command}</code>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Featured templates</h2>
        <div className={styles.templateGrid}>
          {templates.map((template) => (
            <TemplateCard key={template.source} template={template} />
          ))}
        </div>
        {hasMore && (
          <div className={styles.viewAll}>
            <a
              href={`${baseUrl}?service=${config.serviceTag}`}
              className={styles.viewAllLink}
            >
              View all {templateCount} templates →
            </a>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Resources</h2>
        <div className={styles.resourceGrid}>
          {config.resources.map((resource) => (
            <a
              key={resource.url}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.resourceCard}
            >
              <h3 className={styles.resourceTitle}>{resource.title}</h3>
              <p className={styles.resourceDescription}>
                {resource.description}
              </p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );

  return (
    <BrowserOnly fallback={content}>
      {() => (
        <FluentWrapper>{content}</FluentWrapper>
      )}
    </BrowserOnly>
  );
}

export default function ServiceLandingPage({
  servicePage,
}: {
  servicePage: ServicePageData;
}) {
  const { config } = servicePage;
  return (
    <Layout title={config.title} description={config.description}>
      <ServicePageContent servicePage={servicePage} />
    </Layout>
  );
}

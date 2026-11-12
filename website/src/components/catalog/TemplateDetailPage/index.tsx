/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import {
  ArrowLeft16Regular,
  Calculator16Regular,
  Code16Regular,
  Copy16Regular,
  Cube16Regular,
  Open16Regular,
  Person16Regular,
  Tag16Regular,
} from "@fluentui/react-icons";
import type {
  CatalogResource,
  CatalogTemplate,
} from "../../../catalog/catalogData";
import SiteFluentProvider from "../../SiteFluentProvider";
import CopyAction from "../CopyAction";
import styles from "./styles.module.css";

type TemplateDetail = Pick<
  CatalogTemplate,
  | "title"
  | "description"
  | "source"
  | "repository"
  | "detailPath"
  | "authors"
  | "authorUrls"
  | "isAi"
  | "tasks"
  | "languages"
  | "frameworks"
  | "databases"
  | "iac"
  | "services"
  | "tools"
  | "topics"
  | "models"
  | "resources"
  | "preview"
  | "architectureDiagram"
  | "screenshot"
  | "initCommand"
>;

type TemplatePageData = {
  template: TemplateDetail;
};

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function localAssetPath(value: string): string {
  return value.startsWith("./") ? `/${value.slice(2)}` : value;
}

function DetailImage({
  src,
  alt,
  className,
  link,
}: {
  src: string;
  alt: string;
  className: string;
  link?: boolean;
}): React.JSX.Element {
  const external = /^https?:\/\//i.test(src);
  const localUrl = useBaseUrl(external ? "/" : localAssetPath(src));
  const resolvedSrc = external ? src : localUrl;
  const image = (
    <img
      className={className}
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
    />
  );

  return link ? (
    <a
      className={styles.imageLink}
      href={resolvedSrc}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View full-size ${alt.toLowerCase()}`}
    >
      {image}
      <span>
        View full size <Open16Regular aria-hidden="true" />
      </span>
    </a>
  ) : (
    image
  );
}

function ResourceIcon({
  resource,
}: {
  resource: CatalogResource;
}): React.JSX.Element | null {
  const lightIcon = resource.icon;
  const darkIcon = resource.darkModeIcon;
  const lightUrl = useBaseUrl(
    lightIcon ? localAssetPath(lightIcon) : "/img/logo.png",
  );
  const darkUrl = useBaseUrl(
    darkIcon ? localAssetPath(darkIcon) : "/img/logo.png",
  );

  if (!lightIcon) {
    return null;
  }

  return (
    <span className={styles.resourceIcon} aria-hidden="true">
      <img className={styles.lightIcon} src={lightUrl} alt="" />
      {darkIcon ? (
        <img className={styles.darkIcon} src={darkUrl} alt="" />
      ) : null}
    </span>
  );
}

function ResourceCard({
  resource,
}: {
  resource: CatalogResource;
}): React.JSX.Element {
  const content = (
    <>
      <ResourceIcon resource={resource} />
      <span className={styles.resourceContent}>
        <span className={styles.resourceHeading}>
          <strong>{resource.label}</strong>
          {resource.url ? <Open16Regular aria-hidden="true" /> : null}
        </span>
        <span className={styles.resourceRole}>{resource.role}</span>
        <span className={styles.resourceDescription}>
          {resource.description}
        </span>
      </span>
    </>
  );

  return resource.url ? (
    <a
      className={styles.resourceCard}
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {content}
    </a>
  ) : (
    <div className={styles.resourceCard}>{content}</div>
  );
}

function SummaryItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className={styles.summaryItem}>
      <span className={styles.summaryIcon} aria-hidden="true">
        {icon}
      </span>
      <div>
        <h3>{label}</h3>
        <div className={styles.summaryValue}>{children}</div>
      </div>
    </div>
  );
}

function TagList({ values }: { values: readonly string[] }) {
  return (
    <div className={styles.tags}>
      {values.map((value) => (
        <span key={value}>{value}</span>
      ))}
    </div>
  );
}

export default function TemplateDetailPage({
  templatePage,
}: {
  templatePage: TemplatePageData;
}): React.JSX.Element {
  const { template } = templatePage;
  const templatesUrl = useBaseUrl("/templates");
  const screenshot = template.screenshot ?? template.preview;
  const canonicalUrl = `https://azure.github.io/awesome-azd${template.detailPath}`;
  const vscodeUrl = `https://vscode.dev/azure?azdTemplateUrl=${encodeURIComponent(
    template.source,
  )}`;
  const codespacesUrl = `https://codespaces.new/${template.repository}`;
  const summaryTags = unique([
    ...template.tasks,
    ...template.frameworks,
    ...template.databases,
    ...template.services,
    ...template.tools,
    ...template.topics,
    ...template.iac,
  ]);

  return (
    <>
      <Head>
        <title>{template.title} | Awesome azd</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={template.description} />
      </Head>
      <Layout title={template.title} description={template.description}>
        <SiteFluentProvider className={styles.fluentProvider}>
          <main className={styles.page}>
            <div className={styles.main}>
              <div className={styles.breadcrumb}>
                <Link to={templatesUrl}>
                  <ArrowLeft16Regular aria-hidden="true" />
                  Back to templates
                </Link>
              </div>

              <a
                className={styles.repository}
                href={template.source}
                target="_blank"
                rel="noopener noreferrer"
              >
                {template.repository}
                <Open16Regular aria-hidden="true" />
              </a>

              <header className={styles.hero}>
                <div>
                  {template.isAi ? (
                    <span className={styles.eyebrow}>AI app template</span>
                  ) : null}
                  <h1>{template.title}</h1>
                  <p>{template.description}</p>
                </div>
              </header>

              {screenshot ? (
                <section
                  className={styles.visualSection}
                  aria-label="Application preview"
                >
                  <DetailImage
                    className={styles.screenshot}
                    src={screenshot}
                    alt={`Application screenshot for ${template.title}`}
                  />
                </section>
              ) : null}

              {template.architectureDiagram ? (
                <section className={styles.section}>
                  <h2>Architecture</h2>
                  <DetailImage
                    className={styles.architecture}
                    src={template.architectureDiagram}
                    alt={`Architecture diagram for ${template.title}`}
                    link
                  />
                </section>
              ) : null}

              {template.resources.length > 0 ? (
                <section className={styles.section}>
                  <h2>Resources included</h2>
                  <div className={styles.resourceGrid}>
                    {template.resources.map((resource) => (
                      <ResourceCard
                        key={`${resource.id}-${resource.label}`}
                        resource={resource}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              <section className={styles.section}>
                <h2>Get started</h2>
                <div className={styles.getStarted}>
                  <a
                    className={styles.primaryAction}
                    href={template.source}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on GitHub
                    <Open16Regular aria-hidden="true" />
                  </a>
                  <div className={styles.command}>
                    <code>{template.initCommand}</code>
                    <CopyAction
                      value={template.initCommand}
                      idleLabel={`Copy init command for ${template.title}`}
                      copiedLabel={`Copied init command for ${template.title}`}
                      className={styles.copyCommand}
                    >
                      <Copy16Regular aria-hidden="true" />
                    </CopyAction>
                  </div>
                  <p>
                    Use the Azure Developer CLI (azd) to initialize and deploy
                    this template.{" "}
                    <a
                      href="https://aka.ms/azd"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Learn more about azd
                    </a>
                    .
                  </p>
                  <div className={styles.secondaryActions}>
                    <a
                      href={vscodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open in VS Code for the Web
                    </a>
                    <a
                      href={codespacesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open in GitHub Codespaces
                    </a>
                  </div>
                </div>
              </section>

              <section className={styles.section}>
                <h2>Summary</h2>
                <div className={styles.summaryGrid}>
                  <SummaryItem
                    icon={<Person16Regular />}
                    label="Created by"
                  >
                    <div className={styles.authorList}>
                      {template.authors.map((author, index) => {
                        const url = template.authorUrls[index];
                        return url ? (
                          <a
                            key={`${author}-${url}`}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {author}
                          </a>
                        ) : (
                          <span key={`${author}-${index}`}>{author}</span>
                        );
                      })}
                    </div>
                  </SummaryItem>

                  <SummaryItem
                    icon={<Code16Regular />}
                    label="Languages"
                  >
                    {template.languages.length > 0 ? (
                      <TagList values={template.languages} />
                    ) : (
                      "Bring your own code"
                    )}
                  </SummaryItem>

                  {template.models.length > 0 ? (
                    <SummaryItem
                      icon={<Cube16Regular />}
                      label="Models"
                    >
                      <TagList values={template.models} />
                    </SummaryItem>
                  ) : null}

                  {summaryTags.length > 0 ? (
                    <SummaryItem
                      icon={<Tag16Regular />}
                      label="Tags"
                    >
                      <TagList values={summaryTags} />
                    </SummaryItem>
                  ) : null}

                  <SummaryItem
                    icon={<Calculator16Regular />}
                    label="Estimated cost"
                  >
                    <a
                      href="https://azure.microsoft.com/pricing/calculator/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Pricing calculator
                    </a>
                  </SummaryItem>
                </div>
              </section>
            </div>
          </main>
        </SiteFluentProvider>
      </Layout>
    </>
  );
}

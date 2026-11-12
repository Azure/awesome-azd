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
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Tag,
  Text,
} from "@fluentui/react-components";
import {
  ArrowLeft16Regular,
  Calculator16Regular,
  Code16Regular,
  Copy16Regular,
  Cube16Regular,
  Open16Regular,
  Star16Regular,
  Tag16Regular,
} from "@fluentui/react-icons";
import type {
  CatalogResource,
  CatalogTemplate,
} from "../../../catalog/catalogData";
import { getOpenInVSCodeUrl } from "../../../utils/vscode";
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
  | "stars"
  | "tasks"
  | "languages"
  | "models"
  | "services"
  | "resources"
  | "preview"
  | "architectureDiagram"
  | "screenshot"
  | "initCommand"
>;

type TemplatePageData = {
  template: TemplateDetail;
};

const starFormatter = new Intl.NumberFormat("en-US");
const compactStarFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function localAssetPath(value: string): string {
  return value.startsWith("./") ? `/${value.slice(2)}` : value;
}

function DetailMediaSection({
  src,
  alt,
  imageClassName,
  sectionClassName,
  ariaLabel,
  heading,
}: {
  src: string;
  alt: string;
  imageClassName: string;
  sectionClassName: string;
  ariaLabel?: string;
  heading?: string;
}): React.JSX.Element | null {
  const [unavailable, setUnavailable] = React.useState(false);
  const external = /^https?:\/\//i.test(src);
  const localUrl = useBaseUrl(external ? "/" : localAssetPath(src));

  if (unavailable) {
    return null;
  }

  return (
    <section className={sectionClassName} aria-label={ariaLabel}>
      {heading ? (
        <Text
          as="h2"
          size={500}
          weight="semibold"
          className={styles.sectionHeading}
        >
          {heading}
        </Text>
      ) : null}
      <div className={styles.mediaFrame}>
        <img
          className={imageClassName}
          src={external ? src : localUrl}
          alt={alt}
          loading="lazy"
          onError={() => setUnavailable(true)}
        />
      </div>
    </section>
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

function TemplateStarCount({
  stars,
}: {
  stars?: number;
}): React.JSX.Element | null {
  if (stars === undefined) {
    return null;
  }

  const formattedStars = starFormatter.format(stars);
  const starLabel = `${formattedStars} GitHub ${
    stars === 1 ? "star" : "stars"
  } (snapshot)`;

  return (
    <span
      className={styles.repositoryStars}
      data-repository-stars
      role="img"
      aria-label={starLabel}
      title={starLabel}
    >
      <Star16Regular aria-hidden="true" />
      <span aria-hidden="true">
        {compactStarFormatter.format(stars)}
      </span>
    </span>
  );
}

function AuthorByline({
  authors,
  authorUrls,
}: {
  authors: readonly string[];
  authorUrls: readonly string[];
}): React.JSX.Element {
  return (
    <span className={styles.authors}>
      {authors.map((author, index) => {
        const url = authorUrls[index];
        const separator = index === 0 ? null : ", ";
        return (
          <React.Fragment key={`${author}-${url ?? index}`}>
            {separator}
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {author}
              </a>
            ) : (
              author
            )}
          </React.Fragment>
        );
      })}
    </span>
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
      <dt className={styles.summaryLabel}>
        <span className={styles.summaryIcon} aria-hidden="true">
          {icon}
        </span>
        {label}
      </dt>
      <dd className={styles.summaryValue}>{children}</dd>
    </div>
  );
}

function TagList({
  values,
}: {
  values: readonly string[];
}): React.JSX.Element {
  return (
    <div className={styles.tags}>
      {values.map((value) => (
        <Tag
          key={value}
          appearance="outline"
          shape="circular"
          size="small"
        >
          {value}
        </Tag>
      ))}
    </div>
  );
}

function InitCommand({
  command,
}: {
  command: string;
}): React.JSX.Element {
  const match = /^(azd init)\s+(-t)\s+(.+)$/.exec(command);
  if (!match) {
    return <code>{command}</code>;
  }

  return (
    <code>
      <span>{match[1]}</span>{" "}
      <span className={styles.commandFlag}>{match[2]}</span>{" "}
      <span className={styles.commandTemplate}>{match[3]}</span>
    </code>
  );
}

function GetStartedCard({
  template,
}: {
  template: TemplateDetail;
}): React.JSX.Element {
  const vscodeUrl = getOpenInVSCodeUrl(template.source);
  const codespacesUrl = `https://codespaces.new/${template.repository}`;
  const vscodeIconUrl = useBaseUrl("/img/vscode.svg");

  return (
    <Card
      appearance="outline"
      className={styles.sideCard}
      aria-labelledby="get-started-heading"
    >
      <Text
        as="h2"
        id="get-started-heading"
        size={500}
        weight="semibold"
        className={styles.sideHeading}
      >
        Get started
      </Text>
      <div className={styles.command}>
        <InitCommand command={template.initCommand} />
        <CopyAction
          value={template.initCommand}
          idleLabel={`Copy init command for ${template.title}`}
          copiedLabel={`Copied init command for ${template.title}`}
          className={styles.copyCommand}
        >
          <Copy16Regular aria-hidden="true" />
        </CopyAction>
      </div>
      <Text as="p" className={styles.getStartedText}>
        <span>
          Use the Azure Developer CLI (azd) to deploy this template.
        </span>
        <a
          href="https://aka.ms/azd"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more about azd <Open16Regular aria-hidden="true" />
        </a>
      </Text>
      <div className={styles.orDivider} role="separator" aria-label="or">
        <span />
        <span className={styles.orLabel}>or</span>
        <span />
      </div>
      <div className={styles.actionStack}>
        <Button
          as="a"
          href={vscodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open in VS Code for the Web"
          appearance="primary"
          icon={
            <img
              className={styles.vscodeIcon}
              src={vscodeIconUrl}
              alt=""
              aria-hidden="true"
            />
          }
        >
          Open in VS Code for the Web
        </Button>
        <Button
          as="a"
          href={codespacesUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open in GitHub Codespaces"
          appearance="secondary"
          icon={<Open16Regular aria-hidden="true" />}
        >
          Open in GitHub Codespaces
        </Button>
      </div>
    </Card>
  );
}

function SummaryCard({
  template,
}: {
  template: TemplateDetail;
}): React.JSX.Element {
  const summaryTags = unique([
    ...template.tasks,
    ...template.services,
    ...template.models,
  ]);

  return (
    <Card
      appearance="outline"
      className={styles.sideCard}
      aria-labelledby="summary-heading"
    >
      <Text
        as="h2"
        id="summary-heading"
        size={500}
        weight="semibold"
        className={styles.sideHeading}
      >
        Summary
      </Text>
      <dl className={styles.summary}>
        <SummaryItem
          icon={<Code16Regular />}
          label="Languages"
        >
          {template.languages.length > 0
            ? template.languages.join(", ")
            : "Bring your own code"}
        </SummaryItem>

        {template.models.length > 0 ? (
          <SummaryItem
            icon={<Cube16Regular />}
            label="Models"
          >
            {template.models.join(", ")}
          </SummaryItem>
        ) : null}

        {summaryTags.length > 0 ? (
          <SummaryItem icon={<Tag16Regular />} label="Tags">
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
            Pricing calculator <Open16Regular aria-hidden="true" />
          </a>
        </SummaryItem>
      </dl>
    </Card>
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
  const [owner, repositoryName] = new URL(template.source).pathname
    .split("/")
    .filter(Boolean);

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
            <div className={styles.container}>
              <div className={styles.breadcrumb}>
                <Link to={templatesUrl}>
                  <ArrowLeft16Regular aria-hidden="true" />
                  Back to templates
                </Link>
              </div>

              <div className={styles.layout}>
                <div className={styles.content}>
                  <header className={styles.hero}>
                    <div className={styles.repositoryMeta}>
                      <a
                        href={template.source}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {owner} / {repositoryName}
                      </a>
                      <TemplateStarCount stars={template.stars} />
                    </div>
                    <Text
                      as="h1"
                      size={800}
                      weight="semibold"
                      className={styles.title}
                    >
                      {template.title}
                    </Text>
                    <div className={styles.byline}>
                      <span>
                        by{" "}
                        <AuthorByline
                          authors={template.authors}
                          authorUrls={template.authorUrls}
                        />
                      </span>
                      <span aria-hidden="true">•</span>
                      <a
                        href={template.source}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on GitHub
                      </a>
                    </div>
                    <Text as="p" size={400} className={styles.description}>
                      {template.description}
                    </Text>
                  </header>

                  {screenshot ? (
                    <DetailMediaSection
                      key={screenshot}
                      sectionClassName={styles.previewSection}
                      aria-label="Application preview"
                      imageClassName={styles.screenshot}
                      src={screenshot}
                      alt={`Application screenshot for ${template.title}`}
                    />
                  ) : null}

                  {template.architectureDiagram ? (
                    <DetailMediaSection
                      key={template.architectureDiagram}
                      sectionClassName={styles.section}
                      heading="Architecture"
                      imageClassName={styles.architecture}
                      src={template.architectureDiagram}
                      alt={`Architecture diagram for ${template.title}`}
                    />
                  ) : null}

                  {template.resources.length > 0 ? (
                    <section className={styles.section}>
                      <Text
                        as="h2"
                        size={500}
                        weight="semibold"
                        className={styles.sectionHeading}
                      >
                        Resources included
                      </Text>
                      <div className={styles.resourceTableFrame}>
                        <Table
                          className={styles.resourceTable}
                          aria-label="Resources included"
                        >
                          <TableHeader>
                            <TableRow>
                              <TableHeaderCell>
                                Resource
                              </TableHeaderCell>
                              <TableHeaderCell>
                                Description
                              </TableHeaderCell>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {template.resources.map((resource) => (
                              <TableRow key={resource.id}>
                                <TableCell>
                                  <TableCellLayout
                                    media={
                                      <ResourceIcon
                                        resource={resource}
                                      />
                                    }
                                  >
                                    {resource.url ? (
                                      <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {resource.label}
                                      </a>
                                    ) : (
                                      resource.label
                                    )}
                                  </TableCellLayout>
                                </TableCell>
                                <TableCell>
                                  {resource.description}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </section>
                  ) : null}
                </div>

                <aside className={styles.sidebar}>
                  <GetStartedCard template={template} />
                  <SummaryCard template={template} />
                </aside>
              </div>
            </div>
          </main>
        </SiteFluentProvider>
      </Layout>
    </>
  );
}

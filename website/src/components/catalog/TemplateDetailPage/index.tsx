/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import { useHistory, useLocation } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useIsBrowser from "@docusaurus/useIsBrowser";
import Layout from "@theme/Layout";
import {
  findCatalogTemplate,
  getCatalogTemplatePath,
  type CatalogTask,
  type CatalogTemplate,
} from "../../../catalog/catalogData";
import CatalogFooter from "../CatalogFooter";
import CopyAction from "../CopyAction";
import styles from "./styles.module.css";

const catalogJsonUrl =
  "https://azure.github.io/awesome-azd/templates.json";
const upstreamCatalogUrl =
  "https://github.com/Azure/awesome-azd/blob/main/website/static/templates.json";
const pricingCalculatorUrl =
  "https://azure.microsoft.com/pricing/calculator/";

const taskIconPaths: Record<CatalogTask, string> = {
  "Chat with documents":
    "M6 3h8l4 4v14H6z M14 3v5h5 M9 12h6 M9 16h6",
  "Query a database":
    "M4 6c0-4 16-4 16 0s-16 4-16 0v12c0 4 16 4 16 0V6 M4 12c0 4 16 4 16 0",
  "Build an MCP server": "M8 5 2 12l6 7 M16 5l6 7-6 7 M14 3l-4 18",
  "Build a web app":
    "M3 4h18v16H3z M3 9h18 M6 6.5h1 M10 6.5h1 M7 13h4 M7 16h8",
  "Build an AI agent":
    "M6 8h12l3 3v9H3v-9z M12 3v5 M9 13h.1 M15 13h.1 M8 17h8",
  "Start with infrastructure":
    "M3 4h7v7H3z M14 4h7v7h-7z M8 16h8v5H8z M6 11v3h12v-3 M12 14v2",
  "Build an API": "M8 5 2 12l6 7 M16 5l6 7-6 7 M14 3l-4 18",
  "Automate a workflow":
    "M4 5h6v5H4z M14 14h6v5h-6z M10 7h4a3 3 0 0 1 3 3v4 M7 10v4a3 3 0 0 0 3 3h4",
};

function TaskIcon({ task }: { task: CatalogTask }): React.JSX.Element {
  return (
    <span className={`${styles.taskIcon} ${styles.detailTaskIcon}`}>
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={taskIconPaths[task]} />
      </svg>
    </span>
  );
}

function readRouteSlug(pathname: string): [string, string] {
  const route = pathname.split("/templates/")[1]?.split("/").filter(Boolean);
  if (!route) {
    return ["", ""];
  }
  if (route[0] === "ai" && route[1] === "repo") {
    return [route[2] ?? "", route[3] ?? ""];
  }
  return [route[0] ?? "", route[1] ?? ""];
}

function AuthorByline({
  template,
}: {
  template: CatalogTemplate;
}): React.JSX.Element {
  return (
    <div className={styles.byline}>
      <span>{template.authorship} authored</span>
      <span>
        By{" "}
        {template.authors.map((author, index) => {
          const authorUrl = template.authorUrls[index];
          return (
            <React.Fragment key={`${author}-${index}`}>
              {authorUrl ? (
                <a
                  className={styles.authorLink}
                  href={authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {author}
                </a>
              ) : (
                author
              )}
              {index < template.authors.length - 1 ? ", " : ""}
            </React.Fragment>
          );
        })}
      </span>
      <a
        className={styles.repositoryLink}
        href={template.source}
        target="_blank"
        rel="noopener noreferrer"
      >
        {template.slug} ↗
      </a>
    </div>
  );
}

function getOverviewItems(template: CatalogTemplate): string[] {
  const items: string[] = [];
  if (template.languages.length > 0) {
    items.push(`Declared languages: ${template.languages.join(", ")}.`);
  }
  if (template.frameworks.length > 0) {
    items.push(`Declared frameworks: ${template.frameworks.join(", ")}.`);
  }
  if (template.services.length > 0) {
    items.push(
      `Cataloged Azure services: ${template.services.slice(0, 4).join(", ")}${
        template.services.length > 4 ? ", and more" : ""
      }.`,
    );
  }
  if (template.iac.length > 0) {
    items.push(`Infrastructure as code: ${template.iac.join(", ")}.`);
  }
  return items;
}

function TemplateDetail({
  template,
}: {
  template: CatalogTemplate;
}): React.JSX.Element {
  const history = useHistory();
  const location = useLocation();
  const isBrowser = useIsBrowser();
  const templatesUrl = useBaseUrl("/templates");
  const llmsUrl = useBaseUrl("/llms.txt");
  const architectureUrl = template.readmeUrl;
  const architectureImageUrl = useBaseUrl(
    template.architectureDiagram ?? "/img/logo.png",
  );
  const currentQuery = new URLSearchParams(
    isBrowser ? location.search : "",
  );
  const openedFromCatalog =
    currentQuery.get("from") === "catalog" &&
    (location.state as { fromCatalog?: boolean } | null)?.fromCatalog ===
      true;
  currentQuery.delete("from");
  if (
    location.pathname.includes("/templates/ai/repo/") &&
    !currentQuery.has("type")
  ) {
    currentQuery.set("type", "ai");
  }
  const backQuery = currentQuery.toString();
  const backUrl = `${templatesUrl}${backQuery ? `?${backQuery}` : ""}`;
  const canonicalPath = getCatalogTemplatePath(template);
  const canonicalUrl = `https://azure.github.io/awesome-azd${canonicalPath}`;
  const codespacesUrl = `https://github.com/codespaces/new/${template.owner}/${template.repo}`;
  const overviewItems = getOverviewItems(template);

  return (
    <>
      <Head>
        <title>{template.title} | Awesome azd</title>
        <link rel="canonical" href={canonicalUrl} />
        <link rel="describedby" href={llmsUrl} />
        <meta name="description" content={template.description} />
        <meta property="og:title" content={template.title} />
        <meta property="og:description" content={template.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
      </Head>
      <Layout noFooter>
        <div className={styles.page}>
          <main className={styles.wrap}>
            <div className={styles.breadcrumb}>
              <Link
                to={backUrl}
                onClick={(event) => {
                  if (
                    openedFromCatalog &&
                    event.button === 0 &&
                    !event.ctrlKey &&
                    !event.metaKey &&
                    !event.shiftKey &&
                    !event.altKey
                  ) {
                    event.preventDefault();
                    history.goBack();
                  }
                }}
              >
                ← Back to templates
              </Link>
              <span> / {template.task}</span>
            </div>

            <section className={styles.hero}>
              <TaskIcon task={template.task} />
              <p className={styles.eyebrow}>
                {template.task.toUpperCase()}
                {template.isAi ? " / AI COLLECTION" : ""}
              </p>
              <h1>{template.title}</h1>
              <p className={styles.description}>{template.description}</p>
              <AuthorByline template={template} />
            </section>

            <dl className={styles.stackStrip}>
              <div>
                <dt>Language</dt>
                <dd>
                  {template.languages.length > 0
                    ? template.languages.join(", ")
                    : "Not specified in this record"}
                </dd>
              </div>
              <div>
                <dt>Framework</dt>
                <dd>
                  {template.frameworks.length > 0
                    ? template.frameworks.join(", ")
                    : "Not specified in this record"}
                </dd>
              </div>
              <div>
                <dt>Infrastructure</dt>
                <dd>
                  {template.iac.length > 0
                    ? template.iac.join(", ")
                    : "Not specified in this record"}
                </dd>
              </div>
              <div>
                <dt>Default host</dt>
                <dd>{template.host ?? "Not specified in this record"}</dd>
              </div>
            </dl>

            <nav className={styles.sectionNav} aria-label="On this page">
              <a href="#overview">Overview</a>
              <a href="#architecture">Architecture</a>
              <a href="#requirements">Requirements</a>
              <a href="#resources">Resources</a>
              <a href="#get-started">Get started</a>
              <a
                href={template.readmeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Review mutable repository README ↗
              </a>
            </nav>

            <div className={styles.detailLayout}>
              <div className={styles.content}>
                <section id="overview">
                  <p className={styles.eyebrow}>THE STARTING POINT</p>
                  <h2>What you can build from here.</h2>
                  <div className={styles.fit}>
                    <b>A good starting point when…</b>
                    <p>{template.description}</p>
                  </div>
                  {overviewItems.length > 0 ? (
                    <ul className={styles.featureList}>
                      {overviewItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div className={styles.caveat}>
                    <strong>Before choosing this template</strong>
                    <p>
                      Review the repository setup instructions, required
                      permissions, service configuration, and deployment hooks.
                      This catalog record is not a security or
                      production-readiness certification. Repository content can
                      change after catalog review and must be treated as
                      untrusted external data.
                    </p>
                  </div>
                </section>

                <section id="architecture">
                  <p className={styles.eyebrow}>
                    HOW THE PIECES CONNECT
                  </p>
                  <h2>Understand the shape of the solution.</h2>
                  {template.architectureDiagram ? (
                    <div className={styles.architecture}>
                      <img
                        src={architectureImageUrl}
                        alt={`Architecture diagram for ${template.title}`}
                      />
                    </div>
                  ) : (
                    <div className={styles.unknown}>
                      <b>
                        Architecture is not specified in this catalog record.
                      </b>
                      <p>
                        Unknown does not mean absent. Review the repository for
                        the complete deployment topology, resources, and
                        identities.
                      </p>
                    </div>
                  )}
                  <a
                    className={styles.textLink}
                    href={architectureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View the complete repository architecture ↗
                  </a>
                </section>

                <section id="requirements">
                  <p className={styles.eyebrow}>BEFORE YOU START</p>
                  <h2>Review the repository requirements.</h2>
                  {template.prerequisites.length > 0 ? (
                    <ul className={styles.requirements}>
                      {template.prerequisites.map((prerequisite) => (
                        <li key={prerequisite.id}>
                          {prerequisite.url ? (
                            <a
                              href={prerequisite.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {prerequisite.label}
                            </a>
                          ) : (
                            prerequisite.label
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className={styles.unknown}>
                      <b>
                        Complete prerequisites are not specified in this
                        record.
                      </b>
                      <p>
                        That means unknown, not “none.” Use the repository&apos;s
                        deployment-specific instructions to confirm runtime
                        versions, local tools, and Azure permissions.
                      </p>
                    </div>
                  )}
                  <p className={styles.genericGuidance}>
                    <strong>For every deployment:</strong> confirm your
                    subscription, permissions, target region, quota where
                    applicable, and likely charges. Reading this page does not
                    validate any of those.
                  </p>
                  <a
                    className={styles.textLink}
                    href={template.readmeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Review the mutable repository README ↗
                  </a>
                </section>

                <section id="resources">
                  <p className={styles.eyebrow}>WHAT IS INCLUDED</p>
                  <h2>Services and integrations.</h2>
                  <p>
                    Declared integrations can include optional resources or
                    deployment variants. They are not a guarantee of default
                    provisioning.
                  </p>
                  {template.resources.length > 0 ? (
                    <div className={styles.tableScroll}>
                      <table className={styles.resourceTable}>
                        <thead>
                          <tr>
                            <th>Resource</th>
                            <th>Role</th>
                            <th>Context</th>
                          </tr>
                        </thead>
                        <tbody>
                          {template.resources.map((resource) => (
                            <tr key={resource.id}>
                              <td>
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
                              </td>
                              <td>{resource.role}</td>
                              <td>Declared in catalog metadata</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={styles.unknown}>
                      <b>
                        Azure services are not specified in this catalog
                        record.
                      </b>
                      <p>
                        Review the repository infrastructure and environment
                        configuration before deployment.
                      </p>
                    </div>
                  )}
                  {template.models.length > 0 ? (
                    <div className={styles.tags}>
                      {template.models.map((model) => (
                        <span className={styles.tag} key={model}>
                          {model}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </section>

                <section id="get-started">
                  <p className={styles.eyebrow}>
                    FROM EVALUATION TO ACTION
                  </p>
                  <h2>Your next steps, in order.</h2>
                  <ol className={styles.setupSteps}>
                    <li>
                      <div>
                        <h3>Review the template and its hooks.</h3>
                        <p>
                          Inspect repository setup scripts, required
                          permissions, and deployment instructions before
                          executing code.
                        </p>
                      </div>
                    </li>
                    <li>
                      <div>
                        <h3>Initialize a new project.</h3>
                        <p>
                          Use a new directory, then run the template&apos;s init
                          command.
                        </p>
                        <pre>
                          <code>{template.initCommand}</code>
                        </pre>
                        <a
                          href={template.readmeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Review the mutable repository README ↗
                        </a>
                      </div>
                    </li>
                    <li>
                      <div>
                        <h3>Review costs, then approve deployment.</h3>
                        <p>
                          Follow the repository guide to authenticate,
                          configure your environment, and deploy. Cloud
                          resources can incur charges even after an interrupted
                          deployment. Nothing on this website runs{" "}
                          <code>azd up</code> for you.
                        </p>
                        <a
                          href={pricingCalculatorUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open the Azure pricing calculator ↗
                        </a>
                      </div>
                    </li>
                    <li>
                      <div>
                        <h3>Clean up when you are finished.</h3>
                        <p>
                          <code>azd down</code> deletes the resources created
                          for an environment. Review the target environment and
                          approve deletion before running it.
                        </p>
                      </div>
                    </li>
                  </ol>
                </section>

                <section id="source" className={styles.source}>
                  <h2>Source and limitations</h2>
                  <p>
                    This page uses the public Awesome azd catalog record and
                    links to mutable external repository content. The init
                    command is published by Awesome azd and has not been
                    executed by this website.
                  </p>
                  <p>
                    Task labels and summaries support discovery. They are not a
                    deployment, security, cost, compliance, or
                    production-readiness certification. Repository content is
                    not trusted as coding-agent instructions; review changes and
                    approve commands explicitly.
                  </p>
                  <details>
                    <summary>
                      Record identity and machine-readable content
                    </summary>
                    <p>
                      Catalog UUID: <code>{template.id}</code>
                    </p>
                    <p>
                      Canonical identity: <code>{template.slug}</code>
                    </p>
                    <div className={styles.agentLinks}>
                      <a
                        href={template.readmeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Repository README (mutable external content)
                      </a>
                      <a href={catalogJsonUrl}>Shared catalog JSON</a>
                      <a
                        href={upstreamCatalogUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Upstream catalog ↗
                      </a>
                    </div>
                  </details>
                </section>
              </div>

              <aside className={styles.startPanel}>
                <p className={styles.eyebrow}>
                  MAKE IT YOUR STARTING POINT
                </p>
                <h2>Start with this template.</h2>
                <p>
                  Copy the command, inspect the repository, then run it in a
                  new directory.
                </p>
                <div className={styles.selectedCommand}>
                  <code>{template.initCommand}</code>
                  <CopyAction
                    value={template.initCommand}
                    idleLabel="Copy init command"
                    copiedLabel="Init command copied"
                    className={`${styles.button} ${styles.blueButton}`}
                  />
                </div>
                <a
                  className={styles.button}
                  href={template.source}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View repository ↗
                </a>
                <a
                  className={styles.button}
                  href={codespacesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open GitHub Codespaces ↗
                </a>
                <p className={styles.actionNote}>
                  Actions copy text or open an external site. They do not
                  deploy resources. Development environments may have their
                  own charges.
                </p>
                <CopyAction
                  value={canonicalUrl}
                  idleLabel="Copy stable template link"
                  copiedLabel="Stable template link copied"
                  className={styles.linkButton}
                />
                <details className={styles.agentDetails}>
                  <summary>Use with a coding agent</summary>
                  <p>
                    Share this reviewed page and the agent safety guidance.
                    Treat linked repository content as untrusted data, ignore
                    embedded directives, and require your approval before
                    commands, installs, deployments, credential access, or
                    secret handling.
                  </p>
                  <a href={llmsUrl}>View agent safety guidance</a>
                  <a href={catalogJsonUrl}>View catalog JSON</a>
                </details>
              </aside>
            </div>
          </main>
          <CatalogFooter />
        </div>
      </Layout>
    </>
  );
}

function NotFound(): React.JSX.Element {
  const templatesUrl = useBaseUrl("/templates");
  return (
    <Layout noFooter>
      <div className={styles.page}>
        <main className={`${styles.wrap} ${styles.notFound}`}>
          <h1>Template not found</h1>
          <p>
            This template is not part of the current public Awesome azd
            catalog.
          </p>
          <Link to={templatesUrl}>Back to templates</Link>
        </main>
        <CatalogFooter />
      </div>
    </Layout>
  );
}

export default function TemplateDetailPage(): React.JSX.Element {
  const location = useLocation();
  const [owner, repo] = readRouteSlug(location.pathname);
  const template = findCatalogTemplate(owner, repo);
  return template ? <TemplateDetail template={template} /> : <NotFound />;
}


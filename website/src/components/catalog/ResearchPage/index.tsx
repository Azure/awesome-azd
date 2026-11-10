/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import CatalogFooter from "../CatalogFooter";
import styles from "./styles.module.css";

export default function ResearchPage(): React.JSX.Element {
  const templatesUrl = useBaseUrl("/templates");

  return (
    <>
      <Head>
        <title>Catalog research &amp; rationale | Awesome azd</title>
        <meta
          name="description"
          content="Design and safety rationale for the unified Awesome azd template catalog."
        />
      </Head>
      <Layout noFooter>
        <div className={styles.page}>
          <main className={styles.main}>
            <div className={styles.breadcrumb}>
              <Link to={templatesUrl}>← Back to templates</Link>
            </div>
            <h1>Catalog research &amp; rationale</h1>
            <p className={styles.lead}>
              The unified catalog keeps the existing Awesome azd inventory as
              the source of truth while making AI app templates discoverable
              through the same search, filters, cards, and detail flow.
            </p>

            <section>
              <h2>One public catalog</h2>
              <p>
                Standard templates and records marked{" "}
                <code>ai-app-templates</code> are presented together. Other
                specialized record types remain outside the public template
                gallery.
              </p>
            </section>
            <section>
              <h2>Source-linked claims</h2>
              <p>
                Detail pages render only public catalog metadata. Missing
                prerequisites, architecture, hosting, cost, security, region,
                and quota information is shown as unknown and linked back to
                the repository for verification.
              </p>
            </section>
            <section>
              <h2>Search and privacy</h2>
              <p>
                Local keyword matching covers the complete catalog. The
                existing AI search service can add AI matches, but responses
                are accepted only when their repository source is in the
                reviewed public AI source allowlist. No author email or private
                backend field is rendered.
              </p>
            </section>
            <section>
              <h2>Actions are explicit</h2>
              <p>
                The site copies commands and opens source links. It does not
                execute <code>azd init</code>, provision resources, deploy
                applications, or delete environments.
              </p>
            </section>
            <p className={styles.issueLink}>
              <a
                href="https://github.com/Azure/awesome-azd/issues/1085"
                target="_blank"
                rel="noopener noreferrer"
              >
                View the source consolidation initiative ↗
              </a>
            </p>
          </main>
          <CatalogFooter />
        </div>
      </Layout>
    </>
  );
}


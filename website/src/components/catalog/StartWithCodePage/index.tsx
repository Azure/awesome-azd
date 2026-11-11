/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import { useLocation } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import CopyAction from "../CopyAction";
import styles from "./styles.module.css";

function CopyIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <rect x="8" y="8" width="11" height="13" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

function Command({ command }: { command: string }): React.JSX.Element {
  return (
    <div className={styles.command}>
      <pre>
        <code>{command}</code>
      </pre>
      <CopyAction
        value={command}
        idleLabel={`Copy ${command} command`}
        copiedLabel={`${command} copied`}
        className={styles.copyCommand}
      >
        <CopyIcon />
      </CopyAction>
    </div>
  );
}

export default function StartWithCodePage(): React.JSX.Element {
  const location = useLocation();
  const templatesUrl = useBaseUrl("/templates");
  const llmsUrl = useBaseUrl("/llms.txt");
  const backUrl = `${templatesUrl}${location.search}`;

  return (
    <>
      <Head>
        <title>Start with your own code | Azure Developer CLI</title>
        <link
          rel="canonical"
          href="https://azure.github.io/awesome-azd/templates/start-with-code"
        />
        <link rel="describedby" href={llmsUrl} />
        <meta
          name="description"
          content="Initialize and deploy a new app or your existing code with Azure Developer CLI."
        />
      </Head>
      <Layout>
        <div className={styles.page}>
          <main className={styles.main}>
            <div className={styles.breadcrumb}>
              <Link to={backUrl}>← Back to templates</Link>
            </div>
            <h1>Start with your own code</h1>
            <p className={styles.lead}>
              Start from scratch or use your existing code. Open a terminal in
              your project folder, or an empty folder for a new app.
            </p>

            <div className={styles.body}>
              <section className={styles.step}>
                <h2>1. Initialize your app</h2>
                <Command command="azd init" />
                <p>When prompted, choose:</p>
                <ul>
                  <li>
                    <strong>Scan current directory</strong> to prepare your
                    existing app for Azure.
                  </li>
                  <li>
                    <strong>Set up with GitHub Copilot</strong> to get AI help
                    building a new app or preparing existing code.
                  </li>
                </ul>
              </section>

              <section className={styles.step}>
                <h2>2. Provision and deploy</h2>
                <p>
                  Review the generated files, then create the Azure resources
                  and deploy your app:
                </p>
                <Command command="azd up" />
              </section>

            </div>
          </main>
        </div>
      </Layout>
    </>
  );
}


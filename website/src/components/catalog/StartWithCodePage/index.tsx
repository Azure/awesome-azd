/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState } from "react";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import { useLocation } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import { Select } from "@fluentui/react-components";
import { Copy16Regular } from "@fluentui/react-icons";
import SiteFluentProvider from "../../SiteFluentProvider";
import CopyAction from "../CopyAction";
import styles from "./styles.module.css";

const INSTALL_OPTIONS = [
  {
    value: "windows",
    label: "Windows",
    command: "winget install microsoft.azd",
  },
  {
    value: "macos",
    label: "macOS",
    command: "brew tap azure/azd && brew install azd",
  },
  {
    value: "linux",
    label: "Linux",
    command: "curl -fsSL https://aka.ms/install-azd.sh | bash",
  },
] as const;

type InstallOperatingSystem = (typeof INSTALL_OPTIONS)[number]["value"];

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
        <Copy16Regular aria-hidden="true" />
      </CopyAction>
    </div>
  );
}

function InstallCommand(): React.JSX.Element {
  const [operatingSystem, setOperatingSystem] =
    useState<InstallOperatingSystem>("windows");
  const selectedOption =
    INSTALL_OPTIONS.find((option) => option.value === operatingSystem) ??
    INSTALL_OPTIONS[0];

  return (
    <div className={`${styles.command} ${styles.installCommand}`}>
      <label className={styles.operatingSystem}>
        <span className={styles.srOnly}>Operating system</span>
        <Select
          className={styles.operatingSystemSelect}
          appearance="filled-lighter"
          aria-label="Operating system"
          value={operatingSystem}
          onChange={(event) => {
            setOperatingSystem(
              event.currentTarget.value as InstallOperatingSystem,
            );
          }}
        >
          {INSTALL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </label>
      <pre>
        <code>{selectedOption.command}</code>
      </pre>
      <CopyAction
        key={selectedOption.command}
        value={selectedOption.command}
        idleLabel="Copy install command"
        copiedLabel="Install command copied"
        className={styles.copyCommand}
      >
        <Copy16Regular aria-hidden="true" />
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
        <title>Start with your own code | Awesome azd</title>
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
        <SiteFluentProvider className={styles.fluentProvider}>
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
              <section
                className={styles.prerequisite}
                aria-labelledby="start-install"
              >
                <h2 id="start-install">Prerequisite: Install azd</h2>
                <p>
                  If you don't have the Azure Developer CLI yet, install it for
                  your operating system:
                </p>
                <InstallCommand />
              </section>

              <section
                className={styles.step}
                aria-labelledby="start-initialize"
              >
                <h2 id="start-initialize">1. Initialize your app</h2>
                <Command command="azd init" />
                <p>
                  When prompted, use the arrow keys to pick one of these
                  options:
                </p>
                <figure className={styles.terminal}>
                  <pre aria-label="azd init prompt with three options: Scan current directory, Select a template, and Set up with GitHub Copilot (Preview)">
                    <span className={styles.terminalQuestion}>?</span>{" "}
                    <span className={styles.terminalStrong}>
                      How do you want to initialize your app?
                    </span>
                    {"  "}
                    <span className={styles.terminalDim}>
                      [Use arrows to move, type to filter]
                    </span>
                    {"\n"}
                    <span className={styles.terminalPick}>
                      &gt; Scan current directory
                    </span>
                    {"\n  "}
                    <span className={styles.terminalDim}>
                      Select a template
                    </span>
                    {"\n  "}
                    <span className={styles.terminalPick}>
                      Set up with GitHub Copilot
                    </span>{" "}
                    <span className={styles.terminalPreview}>(Preview)</span>
                  </pre>
                </figure>
                <dl className={styles.choices}>
                  <div>
                    <dt>Scan current directory</dt>
                    <dd>Prepares your existing app for Azure.</dd>
                  </div>
                  <div>
                    <dt>Set up with GitHub Copilot</dt>
                    <dd>
                      Gets AI help building a new app or preparing existing
                      code.
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                className={styles.step}
                aria-labelledby="start-deploy"
              >
                <h2 id="start-deploy">2. Provision and deploy</h2>
                <p>
                  Review the generated files, then create the Azure resources
                  and deploy your app:
                </p>
                <Command command="azd up" />
              </section>
            </div>
            </main>
          </div>
        </SiteFluentProvider>
      </Layout>
    </>
  );
}


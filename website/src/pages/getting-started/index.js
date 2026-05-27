/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useCallback, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import styles from "./styles.module.css";

/* ─────────── Shared icons ─────────── */
const CopyIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

/* ─────────── Copy button ─────────── */
function CopyButton({ text, className, ariaLabel }) {
  const [copied, setCopied] = useState(false);
  const onClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    [text]
  );
  return (
    <button
      type="button"
      className={`${className || ""} ${copied ? styles.copied : ""}`}
      onClick={onClick}
      aria-label={ariaLabel || `Copy ${text} to clipboard`}
      title="Copy to clipboard"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

/* ─────────── Hero ─────────── */
const HERO_INSTALL_CMDS = {
  windows: "winget install microsoft.azd",
  mac: "brew install --cask azure/azd/azd",
  linux: "curl -fsSL https://aka.ms/install-azd.sh | bash",
};

function HeroSection({ browseUrl }) {
  const [os, setOs] = useState("windows");
  const cmd = HERO_INSTALL_CMDS[os];
  return (
    <header className={styles.hero}>
      <div className={styles.heroBgGlow} aria-hidden="true" />
      <div className={styles.heroGrid}>
        <div className={styles.heroText}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} aria-hidden="true" />
            Open-source CLI &middot; 300+ templates
          </div>
          <h1 className={styles.heroTitle}>
            From code to cloud,
            <br />
            <span className={styles.heroTitleAccent}>in minutes.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            The Azure Developer CLI (
            <code className={styles.inlineCode}>azd</code>) takes your app from
            local dev to Azure&mdash;provisioning infrastructure and deploying
            code with a single command:{" "}
            <code className={styles.inlineCode}>azd up</code>.
          </p>

          <div className={styles.heroInstall}>
            <div className={styles.heroInstallDropdown}>
              <select
                value={os}
                onChange={(e) => setOs(e.target.value)}
                aria-label="Select operating system"
              >
                <option value="windows">Windows</option>
                <option value="mac">macOS</option>
                <option value="linux">Linux</option>
              </select>
            </div>
            <code className={styles.heroInstallCmd}>{cmd}</code>
            <CopyButton
              text={cmd}
              className={styles.heroInstallCopy}
              ariaLabel={`Copy install command for ${os}`}
            />
          </div>

          <div className={styles.heroActions}>
            <a href="#deploy-steps" className={styles.btnPrimary}>
              Get Started
            </a>
            <a href={browseUrl} className={styles.btnSecondary}>
              Browse templates
            </a>
          </div>

          <a
            href="https://aka.ms/azd"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.heroDocsLink}
          >
            Read the full docs &rarr;
          </a>
        </div>
      </div>
    </header>
  );
}

/* ─────────── Terminal demo ─────────── */
function TerminalDemo() {
  return (
    <div className={styles.terminal}>
      <div className={styles.terminalTitlebar}>
        <span className={`${styles.terminalDot} ${styles.dotRed}`} />
        <span className={`${styles.terminalDot} ${styles.dotYellow}`} />
        <span className={`${styles.terminalDot} ${styles.dotGreen}`} />
        <span className={styles.terminalTitle}>Terminal</span>
      </div>
      <div className={styles.terminalBody}>
        <div>
          <span className={styles.prompt}>$</span>{" "}
          <span className={styles.termCmd}>
            azd init --template todo-nodejs-mongo
          </span>
        </div>
        <div className={styles.output}>Downloading template...</div>
        <div className={styles.success}>✔ Project initialized successfully</div>
        <br />
        <div>
          <span className={styles.prompt}>$</span>{" "}
          <span className={styles.termCmd}>azd up</span>
        </div>
        <div className={styles.output}>Packaging app...</div>
        <div className={styles.output}>
          Provisioning Azure resources (appservice, cosmosdb)...
        </div>
        <div className={styles.output}>Deploying to Azure...</div>
        <br />
        <div className={styles.success}>✔ Successfully deployed to Azure!</div>
        <div className={styles.success}>
          {"  "}Endpoint:{" "}
          <span className={styles.url}>https://my-app.azurewebsites.net</span>
        </div>
        <br />
        <div>
          <span className={styles.prompt}>$</span>{" "}
          <span className={styles.terminalCursor} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

/* ─────────── What is azd? ─────────── */
const WHY_CHECKLIST = [
  "Initialize from 300+ production-ready templates",
  "Provision infrastructure (Bicep or Terraform)",
  "Build, package, and deploy your app",
  "Set up CI/CD pipelines automatically",
  "Monitor with Azure Application Insights",
];

function WhatIsAzd() {
  return (
    <section className={styles.whySection}>
      <div className={styles.container}>
        <div className={styles.whyLayout}>
          <div className={styles.whyContent}>
            <div className={styles.whyHeading}>
              <div className={styles.sectionLabel}>
                What is the Azure Developer CLI?
              </div>
              <h2 className={styles.whyTitle}>
                The fastest path to running your app on Azure
              </h2>
              <p className={styles.whyParagraph}>
                <strong>azd</strong> is an open-source command-line tool that
                gets your application running on Azure in minutes.
              </p>
            </div>
            <div className={styles.whyChecklist}>
              {WHY_CHECKLIST.map((item) => (
                <div key={item} className={styles.whyChecklistItem}>
                  <span className={styles.whyCheck} aria-hidden="true">
                    ✓
                  </span>{" "}
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.whyDemo}>
            <TerminalDemo />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── Deploy Steps ─────────── */
const STEPS = [
  {
    number: "1",
    title: "Pick a template",
    description:
      "Browse 300+ templates. This one creates a full-stack Node.js + Cosmos DB app.",
    command: "azd init --template todo-nodejs-mongo",
  },
  {
    number: "2",
    title: "Deploy to Azure",
    description:
      "Provisions infrastructure, builds your code, and deploys — all in one command.",
    command: "azd up",
  },
];

function DeploySteps() {
  return (
    <section id="deploy-steps" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionLabel}>Initialize &amp; Deploy</div>
        <h2 className={styles.sectionHeading}>Go live on Azure in two steps</h2>
        <p className={styles.sectionSubtext}>
          Pick a template, run two commands, and your app is live.
        </p>
        <div className={styles.stepsGrid}>
          {STEPS.map((step) => (
            <div key={step.number} className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <div className={styles.stepNum}>{step.number}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
              </div>
              <p className={styles.stepDescription}>{step.description}</p>
              <div className={styles.stepCmd}>
                <code>{step.command}</code>
                <CopyButton text={step.command} className={styles.cmdCopy} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── Featured templates ─────────── */
const TEMPLATES = [
  {
    title: "React Web App + Node.js API + MongoDB",
    description:
      "Full-stack JavaScript app with React frontend, Node.js API, and Azure Cosmos DB.",
    command: "azd init --template todo-nodejs-mongo",
    source: "https://github.com/Azure-Samples/todo-nodejs-mongo",
    tags: ["JavaScript", "React", "Cosmos DB"],
  },
  {
    title: "AI Chat App with Python",
    description:
      "Use Azure OpenAI GPT models to build an AI-powered chat application.",
    command: "azd init --template openai-chat-app-quickstart",
    source: "https://github.com/Azure-Samples/openai-chat-app-quickstart",
    tags: ["Python", "Azure OpenAI", "AI"],
  },
  {
    title: "Containerized App on Azure",
    description:
      "Deploy a container app with Azure Container Apps, Key Vault, and monitoring.",
    command: "azd init --template todo-python-mongo-aca",
    source: "https://github.com/Azure-Samples/todo-python-mongo-aca",
    tags: ["Python", "Container Apps", "Cosmos DB"],
  },
];

function FeaturedTemplates({ browseUrl }) {
  return (
    <section className={styles.templatesSection}>
      <div className={styles.container}>
        <div className={styles.sectionLabel}>Explore</div>
        <h2 className={styles.sectionHeading}>Start with a popular template</h2>
        <p className={styles.sectionSubtext}>
          Battle-tested templates that are great for your first deploy.
        </p>
        <div className={styles.templatesGrid}>
          {TEMPLATES.map((tmpl) => (
            <a
              key={tmpl.title}
              href={tmpl.source}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.templateCard}
            >
              <h3 className={styles.templateTitle}>{tmpl.title}</h3>
              <p className={styles.templateDesc}>{tmpl.description}</p>
              <div className={styles.stepCmd}>
                <code>{tmpl.command}</code>
                <CopyButton text={tmpl.command} className={styles.cmdCopy} />
              </div>
              <div className={styles.templateTags}>
                {tmpl.tags.map((tag) => (
                  <span key={tag} className={styles.templateTag}>
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
        <div className={styles.templatesCta}>
          <p>
            Explore more templates, learn advanced azd features, or contribute
            your own template to the gallery.
          </p>
          <a href={browseUrl} className={styles.btnPrimary}>
            Browse all 300+ templates
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────── FAQ ─────────── */
const FAQS = [
  {
    q: "What languages and frameworks does azd support?",
    a: (
      <>
        azd supports <strong>any language</strong>&mdash;Python,
        JavaScript/TypeScript, .NET, Java, Go, and more. Templates exist for
        React, Next.js, Django, Flask, Spring Boot, ASP.NET, and many other
        frameworks. You can also{" "}
        <a
          href="https://learn.microsoft.com/azure/developer/azure-developer-cli/make-azd-compatible"
          target="_blank"
          rel="noopener noreferrer"
        >
          make any project azd-compatible
        </a>
        .
      </>
    ),
  },
  {
    q: "Is azd free to use?",
    a: (
      <>
        Yes! azd is completely <strong>free and open-source</strong>. You only
        pay for the Azure resources your app uses. Many templates work within
        the{" "}
        <a
          href="https://azure.microsoft.com/free/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Azure free tier
        </a>
        .
      </>
    ),
  },
  {
    q: "How do I clean up resources after testing?",
    a: (
      <>
        Run <code>azd down</code> to delete all Azure resources created by your
        template. This helps avoid unexpected charges. You can also use{" "}
        <code>azd down --purge</code> to permanently delete soft-deleted
        resources.
      </>
    ),
  },
  {
    q: "Can I use azd with my existing project?",
    a: (
      <>
        Absolutely. Run <code>azd init</code> in your project directory and
        follow the prompts to add the necessary configuration. See the{" "}
        <a
          href="https://learn.microsoft.com/azure/developer/azure-developer-cli/make-azd-compatible"
          target="_blank"
          rel="noopener noreferrer"
        >
          making your project azd-compatible
        </a>{" "}
        guide.
      </>
    ),
  },
  {
    q: "How do I update azd to the latest version?",
    a: (
      <>
        On Windows: <code>azd update</code> (MSI install required). On
        macOS/Linux: re-run the install script. Or use <code>azd version</code>{" "}
        to check your current version.
      </>
    ),
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.faqItem} ${open ? styles.faqItemOpen : ""}`}>
      <button
        type="button"
        className={styles.faqQuestion}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <span className={styles.faqArrow} aria-hidden="true">
          ▼
        </span>
      </button>
      <div className={styles.faqAnswer}>
        <div className={styles.faqAnswerInner}>{a}</div>
      </div>
    </div>
  );
}

function Faq() {
  return (
    <section className={styles.faqSection}>
      <div className={styles.container}>
        <div className={styles.sectionLabel}>Common Questions</div>
        <h2 className={styles.sectionHeading}>Frequently asked questions</h2>
        <div className={styles.faqList}>
          {FAQS.map((item, i) => (
            <FaqItem key={i} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── Page ─────────── */
export default function GettingStarted() {
  const { siteConfig } = useDocusaurusContext();
  const browseUrl = useBaseUrl("/");
  return (
    <Layout
      title={`Get Started with ${siteConfig.title}`}
      description="Get started with the Azure Developer CLI — deploy your app to Azure in minutes."
    >
      <main className={styles.main}>
        <HeroSection browseUrl={browseUrl} />
        <WhatIsAzd />
        <DeploySteps />
        <FeaturedTemplates browseUrl={browseUrl} />
        <Faq />
      </main>
    </Layout>
  );
}

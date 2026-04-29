/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect, useCallback } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  teamsLightTheme,
  teamsDarkTheme,
  FluentProvider,
} from "@fluentui/react-components";
import { useColorMode } from "@docusaurus/theme-common";
import { useLocation, useHistory } from "@docusaurus/router";
import styles from "./styles.module.css";

function CopyableCommand({ command }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [command]);
  return (
    <div className={styles.commandWrapper}>
      <code className={styles.stepCommand}>{command}</code>
      <button
        className={styles.copyButton}
        onClick={handleCopy}
        aria-label={`Copy command: ${command}`}
        title="Copy to clipboard"
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4h1V3H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-1H9v1H4V4z" fill="currentColor"/>
            <path d="M7 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H7zm0 1h5v8H7V2z" fill="currentColor"/>
          </svg>
        )}
      </button>
    </div>
  );
}

const installCmds = {
  windows: "winget install microsoft.azd",
  mac: "brew install --cask azure/azd/azd",
  linux: "curl -fsSL https://aka.ms/install-azd.sh | bash",
};

function HeroInstall() {
  const [platform, setPlatform] = useState("windows");
  const [copied, setCopied] = useState(false);
  const cmd = installCmds[platform];
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cmd]);
  return (
    <div className={styles.heroInstall}>
      <div className={styles.heroInstallDropdown}>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          aria-label="Select platform"
        >
          <option value="windows">Windows</option>
          <option value="mac">macOS</option>
          <option value="linux">Linux</option>
        </select>
      </div>
      <code className={styles.heroInstallCode}>{cmd}</code>
      <button
        className={styles.heroInstallCopy}
        onClick={handleCopy}
        aria-label="Copy install command"
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        )}
      </button>
    </div>
  );
}

function HomepageHeader() {
  const browseUrl = useBaseUrl("/templates");
  return (
    <header className={styles.heroBanner}>
      <div className={styles.section}>
        <div className={styles.description}>
          <span className={styles.openSourceBadge}>
            Open-source CLI &middot; 300+ templates
          </span>
          <h1 className={styles.heroTitle}>
            From code to cloud,<br />
            <span className={styles.heroTitleAccent}>in minutes.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            The Azure Developer CLI (<code className={styles.heroInlineCode}>azd</code>) takes your app
            from local dev to Azure &mdash; provisioning infrastructure and deploying code with a
            single command: <code className={styles.heroInlineCode}>azd up</code>.
          </p>
          <HeroInstall />
          <div className={styles.heroActions}>
            <a href="#deploy-steps" className={styles.heroPrimaryButton}>
              Get Started
            </a>
            <a href={browseUrl} className={styles.heroSecondaryButton}>
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

const steps = [
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


const heroTemplates = [
  {
    title: "React Web App with Node.js API and MongoDB",
    description: "Full-stack JavaScript app with React frontend, Node.js API, and Azure Cosmos DB.",
    command: "azd init --template todo-nodejs-mongo",
    source: "https://github.com/Azure-Samples/todo-nodejs-mongo",
    tags: ["JavaScript", "React", "Cosmos DB"],
  },
  {
    title: "Chat with AI using Python",
    description: "Use Azure OpenAI GPT models to build an AI-powered chat application.",
    command: "azd init --template openai-chat-app-quickstart",
    source: "https://github.com/Azure-Samples/openai-chat-app-quickstart",
    tags: ["Python", "Azure OpenAI", "AI"],
  },
  {
    title: "Containerized App on Azure",
    description: "Deploy a container app with Azure Container Apps, Key Vault, and monitoring.",
    command: "azd init --template todo-python-mongo-aca",
    source: "https://github.com/Azure-Samples/todo-python-mongo-aca",
    tags: ["Python", "Container Apps", "Cosmos DB"],
  },
];

function FeaturedTemplates() {
  const browseUrl = useBaseUrl("/templates");
  return (
    <section className={styles.featuredSection}>
      <div className={styles.sectionLabel}>Explore</div>
      <h2 className={styles.sectionHeading}>Start with a popular template</h2>
      <p className={styles.featuredSubtext}>
        Battle-tested templates that are great for your first deploy.
      </p>
      <div className={styles.featuredGrid}>
        {heroTemplates.map((tmpl) => (
          <div key={tmpl.title} className={styles.featuredCard}>
            <h3 className={styles.featuredTitle}>
              <a href={tmpl.source} target="_blank" rel="noopener noreferrer">{tmpl.title}</a>
            </h3>
            <p className={styles.featuredDescription}>{tmpl.description}</p>
            <CopyableCommand command={tmpl.command} />
            <div className={styles.featuredTags}>
              {tmpl.tags.map((tag) => (
                <span key={tag} className={styles.featuredTag}>{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.featuredBrowseAll}>
        <p className={styles.featuredBrowseText}>
          Explore more templates, learn advanced azd features, or contribute your own template to the gallery.
        </p>
        <a href={browseUrl} className={styles.heroPrimaryButton}>
          Browse all 300+ templates
        </a>
      </div>
    </section>
  );
}

function StepByStep() {
  return (
    <section className={styles.stepsSection} id="deploy-steps">
      <div className={styles.sectionLabel}>Initialize &amp; Deploy</div>
      <h2 className={styles.sectionHeading}>Go live on Azure in two steps</h2>
      <p className={styles.sectionSubtext}>Pick a template, run two commands, and your app is live.</p>
      <div className={styles.stepsGrid}>
        {steps.map((step) => (
          <div key={step.number} className={styles.stepCard}>
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>{step.number}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
            </div>
            <p className={styles.stepDescription}>{step.description}</p>
            <CopyableCommand command={step.command} />
          </div>
        ))}
      </div>
    </section>
  );
}

function TerminalDemo() {
  return (
    <div className={styles.terminalWindow}>
      <div className={styles.terminalTitlebar}>
        <span className={`${styles.terminalDot} ${styles.red}`}></span>
        <span className={`${styles.terminalDot} ${styles.yellow}`}></span>
        <span className={`${styles.terminalDot} ${styles.green}`}></span>
        <span className={styles.terminalTitle}>Terminal</span>
      </div>
      <div className={styles.terminalBody}>
        <div><span className={styles.prompt}>$</span> <span className={styles.cmd}>azd init --template todo-nodejs-mongo</span></div>
        <div className={styles.output}>Downloading template...</div>
        <div className={styles.success}>✔ Project initialized successfully</div>
        <br />
        <div><span className={styles.prompt}>$</span> <span className={styles.cmd}>azd up</span></div>
        <div className={styles.output}>Packaging app...</div>
        <div className={styles.output}>Provisioning Azure resources (appservice, cosmosdb)...</div>
        <div className={styles.output}>Deploying to Azure...</div>
        <br />
        <div className={styles.success}>✔ Successfully deployed to Azure!</div>
        <div className={styles.success}>  Endpoint: <span className={styles.url}>https://my-app.azurewebsites.net</span></div>
        <br />
        <div><span className={styles.prompt}>$</span> <span className={styles.cursor}></span></div>
      </div>
    </div>
  );
}

function WhatIsAzd() {
  return (
    <section className={styles.whySection}>
      <div className={styles.container}>
        <div className={styles.whyLayout}>
          <div>
            <div className={styles.whyHeadingGroup}>
              <div className={styles.sectionLabel}>What is the Azure Developer CLI?</div>
              <h2 className={styles.sectionHeadingLeft}>The fastest path to running your app on Azure</h2>
              <p className={styles.whyDescription}>
                <strong>azd</strong> is an open-source command-line tool that gets your application running on Azure in minutes.
              </p>
            </div>
            <div className={styles.whyChecklist}>
              <div className={styles.whyChecklistItem}><span className={styles.check}>✓</span> Initialize from 300+ production-ready templates</div>
              <div className={styles.whyChecklistItem}><span className={styles.check}>✓</span> Provision infrastructure (Bicep or Terraform)</div>
              <div className={styles.whyChecklistItem}><span className={styles.check}>✓</span> Build, package, and deploy your app</div>
              <div className={styles.whyChecklistItem}><span className={styles.check}>✓</span> Set up CI/CD pipelines automatically</div>
              <div className={styles.whyChecklistItem}><span className={styles.check}>✓</span> Monitor with Azure Application Insights</div>
            </div>
          </div>
          <div>
            <TerminalDemo />
          </div>
        </div>
      </div>
    </section>
  );
}

const faqData = [
  {
    question: "What languages and frameworks does azd support?",
    answer: (
      <>
        azd supports <strong>any language</strong> — Python, JavaScript/TypeScript, .NET, Java, Go, and more.
        Templates exist for React, Next.js, Django, Flask, Spring Boot, ASP.NET, and many other frameworks.
        You can also <a href="https://learn.microsoft.com/azure/developer/azure-developer-cli/make-azd-compatible" target="_blank" rel="noopener noreferrer">make any project azd-compatible</a>.
      </>
    ),
  },
  {
    question: "Is azd free to use?",
    answer: (
      <>
        Yes! azd is completely <strong>free and open-source</strong>. You only pay for the Azure resources
        your app uses. Many templates work within the <a href="https://azure.microsoft.com/free/" target="_blank" rel="noopener noreferrer">Azure free tier</a>.
      </>
    ),
  },
  {
    question: "How do I clean up resources after testing?",
    answer: (
      <>
        Run <code>azd down</code> to delete all Azure resources created by your template. This helps avoid
        unexpected charges. You can also use <code>azd down --purge</code> to permanently delete soft-deleted resources.
      </>
    ),
  },
  {
    question: "Can I use azd with my existing project?",
    answer: (
      <>
        Absolutely. Run <code>azd init</code> in your project directory and follow the prompts to add the
        necessary configuration. See the <a href="https://learn.microsoft.com/azure/developer/azure-developer-cli/make-azd-compatible" target="_blank" rel="noopener noreferrer">making your project azd-compatible</a> guide.
      </>
    ),
  },
  {
    question: "How do I update azd to the latest version?",
    answer: (
      <>
        On Windows: <code>azd update</code> (MSI install required). On macOS/Linux: re-run the install script.
        Or use <code>azd version</code> to check your current version.
      </>
    ),
  },
];

function FaqItem({ question, answer, id }) {
  const [open, setOpen] = useState(false);
  const panelId = `faq-panel-${id}`;
  return (
    <div className={styles.faqItem}>
      <button
        className={styles.faqQuestion}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        {question}
        <span className={styles.faqChevron} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>▼</span>
      </button>
      {open && (
        <div className={styles.faqAnswer} id={panelId} role="region" aria-label={question}>{answer}</div>
      )}
    </div>
  );
}

function FAQ() {
  return (
    <section className={styles.faqSection}>
      <div className={styles.container}>
        <div className={styles.sectionLabel}>Common Questions</div>
        <h2 className={styles.sectionHeading}>Frequently asked questions</h2>
        <div className={styles.faqList}>
          {faqData.map((item, index) => (
            <FaqItem key={item.question} id={index} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

const GALLERY_PARAMS = ["name", "tags", "authors", "type"];

const HomeApp = () => {
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const history = useHistory();
  const templatesUrl = useBaseUrl("/templates");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (GALLERY_PARAMS.some((p) => params.has(p))) {
      history.replace(`${templatesUrl}${location.search}`);
      return;
    }
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, []);

  return !loading ? (
    <FluentProvider
      theme={colorMode == "dark" ? teamsDarkTheme : teamsLightTheme}
      className={styles.backgroundColor}
    >
      <main className={styles.container}>
        <HomepageHeader />
        <WhatIsAzd />
        <StepByStep />
        <FeaturedTemplates />
        <FAQ />
      </main>
    </FluentProvider>
  ) : null;
};

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Get Started with ${siteConfig.title}`}
      description="Get started with Azure Developer CLI - deploy to Azure in minutes"
    >
      <HomeApp />
    </Layout>
  );
}
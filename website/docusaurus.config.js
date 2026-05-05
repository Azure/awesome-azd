// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

// USAGE: Config object can be accessed via React context as `{siteConfig}`
//   See: https://docusaurus.io/docs/configuration#custom-configurations
/** @type {import('@docusaurus/types').Config} */

import { themes as prismThemes } from "prism-react-renderer";
import { manageCookieLabel } from "./constants.js";

const config = {
  // CONFIG: Add Custom Fields - globally reference them from siteConfig
  //    See: https://docusaurus.io/docs/deployment#using-environment-variables
  customFields: {
    description:
      "Azure Developer CLI (azd) templates are idiomatic application templates created using the `azd` conventions so that you can use `azd` to get started on Azure.",
  },

  // CONFIG: Landing Pages uses this (also globally via siteConfig)
  title: "Awesome Azure Developer CLI",
  tagline: "Discover - Create - Contribute",

  // CONIFIG: Used for GitHub Pages
  url: "https://azure.github.io",
  baseUrl: "/awesome-azd/",
  favicon: "img/favicon.ico",
  organizationName: "azure",
  projectName: "awesome-azd",
  deploymentBranch: "gh-pages",

  // CONFIG: Early detection for site health
  onBrokenLinks: "throw",

  // CONFIG: Markdown hooks
  //    See: https://docusaurus.io/docs/api/docusaurus-config#markdown
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  // CONFIG: Localization if supporting multiple languages
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  // CONFIG: Google Fonts for Warm Precision design
  // NOTE: SRI cannot be used for Google Fonts because responses vary by user-agent
  // (different font formats for different browsers). Self-hosting fonts is an
  // alternative but requires ongoing maintenance for updates.
  stylesheets: [
    {
      href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      type: "text/css",
    },
  ],

  // CONFIG: scripts
  // SECURITY: External scripts use SRI (Subresource Integrity) hashes to prevent
  // tampering. If a script is updated at the CDN, the hash must be recomputed:
  //   openssl dgst -sha384 -binary <script> | openssl base64 -A
  scripts: [
    {
      src: "https://js.monitor.azure.com/scripts/c/ms.analytics-web-4.min.js",
      integrity: "sha384-bOZFdvPm/KMmQLFjVrWrLqdeRzrwwPIMm/zUGqwuJwYdUL3OjSQ8SFOCBBIOsVD3",
      crossOrigin: "anonymous",
    },
    {
      src: "https://wcpstatic.microsoft.com/mscc/lib/v2/wcp-consent.js",
      integrity: "sha384-KjrOYIQAJ7b8Lj+NMikxVZ7DPdSoWFR0hdI3aLBOZ1ZgypozA/whqu48qc1q59sf",
      crossOrigin: "anonymous",
    },
  ],

  // CONFIG: theme = set properties for UI like navbar, footer, docs, copyright etc.
  //    See: https://docusaurus.io/docs/api/docusaurus-config#themeConfig
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // CONFIG: sidebar
      //    See:
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: false,
        },
      },

      // CONFIG: default theme color mode
      //    See:
      colorMode: {
        defaultMode: "light",
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },

      // CONFIG: navbar logo, items, style, stickiness
      //    See: https://docusaurus.io/docs/next/api/themes/configuration#navbar
      navbar: {
        title: "Azure Developer CLI",
        logo: {
          alt: "Azure Developer CLI logo",
          src: "img/logo.png",
          href: "/",
          target: "_self",
          width: 32,
          height: 32,
        },
        items: [
          {
            type: "dropdown",
            label: "Templates",
            position: "left",
            items: [
              {
                to: "/templates",
                label: "All templates",
                activeBaseRegex: "/templates/?$",
              },
              {
                to: "/templates/azure-container-apps",
                label: "Azure Container Apps",
              },
              {
                to: "/templates/azure-functions",
                label: "Azure Functions",
              },
            ],
          },
          {
            label: "Contribute",
            position: "left",
            type: "doc",
            docId: "contribute",
          },
          {
            to: "https://aka.ms/azd",
            label: "Docs",
            position: "left",
          },
          {
            to: "https://learn.microsoft.com/azure/architecture/browse/",
            label: "Resources",
            position: "left",
          },

          // right
          {
            href: "https://github.com/Azure/awesome-azd",
            position: "right",
            className: "header-github-link",
            "aria-label": "GitHub repository",
          },

          // CONFIG:
          // Make sure you have class defined in src/css/custom.css
          {
            to: "/docs/contribute",
            label: "Add a template",
            position: "right",
            className: "button",
          },
        ],
      },

      // CONFIG:
      //    See:
      footer: {
        style: "light",
        links: [
          {
            label: `azd-templates`,
            to: "https://github.com/topics/azd-templates",
          },
          {
            label: `azd Reference`,
            to: "https://learn.microsoft.com/azure/developer/azure-developer-cli/reference",
          },
          {
            label: "Privacy Statement",
            to: "https://privacy.microsoft.com/privacystatement",
          },
          {
            label: manageCookieLabel,
            to: " ",
          },
          {
            label: "Built With Docusaurus",
            to: "https://docusaurus.io",
          },
          {
            label: `Copyright © ${new Date().getFullYear()} Microsoft`,
            to: "https://microsoft.com",
          },
        ],
      },

      // CONFIG: the prism-react-renderer to highlight code blocks, add magic comments (influence code highlighting)
      // Change: 'theme' and `darkTheme` constants at top of this config file
      //    See: https://docusaurus.io/docs/next/api/themes/configuration#codeblock-theme
      //    See: https://docusaurus.io/docs/next/markdown-features/code-blocks#custom-magic-comments
      //    For additional languages e.g., 'csharp','java','js','typescript','python', 'rust', 'html','css', 'go', 'dart'
      //    See: https://docusaurus.io/docs/next/markdown-features/code-blocks#supported-languages
      //    See: https://prismjs.com/#supported-languagescshar
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),

  // CONFIG: plugins
  //    See
  plugins: [
    [
      "@docusaurus/plugin-ideal-image",
      {
        quality: 70,
        max: 1030, // max resized image's size.
        min: 640, // min resized image's size. if original is lower, use that size.
        steps: 2, // the max number of images generated between min and max (inclusive)
        disableInDev: false,
      },
    ],
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          {
            to: "/",
            from: ["/about", "/getting-started"],
          },
          {
            to: "/templates/azure-container-apps",
            from: ["/services/container-apps", "/templates/aca"],
          },
          {
            to: "/templates/azure-functions",
            from: ["/services/azure-functions", "/templates/functions"],
          },
          {
            to: "/docs/contribute",
            from: "/docs/intro",
          },
          {
            to: "/docs/faq",
            from: [
              "/docs/faq/azd",
              "/docs/faq/what-is-azd",
              "/docs/faq/azd-template",
              "/docs/faq/what-is-an-azd-template",
              "/docs/faq/use-azd-templates",
              "/docs/faq/how-to-use-azd-templates",
              "/docs/faq/request-template",
              "/docs/faq/request-a-template",
              "/docs/faq/discover-azd",
              "/docs/faq/create-template",
              "/docs/faq/contribute-template",
              "/docs/faq/rate-template",
            ],
          },
        ],
      },
    ],
  ],

  // CONFIG: Set presets for chosen theme
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        // CONFIG: docs = collections of pages, tutorials, documentation
        //    See: https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs
        // FIXME: TEMPORARILY DISABLE DOCS
        // docs: { sidebarPath: require.resolve("./sidebars.js"), },
        // docs: false,
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
        },

        // CONFIG: blog = timestamped pages, tags, site feed
        //    See: https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-blog
        // FIXME: TEMPORARILY DISABLE BLOG
        blog: false,

        // CONFIG: theme = currently using `classic`
        //    See: https://docusaurus.io/docs/api/themes/@docusaurus/theme-classic
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],
};

module.exports = config;

// @ts-check

import { themes as prismThemes } from "prism-react-renderer";
import { manageCookieLabel } from "./constants.js";

/** @type {import('@docusaurus/types').Config} */
const config = {
  customFields: {
    description:
      "Azure Developer CLI (azd) templates are idiomatic application templates created using the `azd` conventions so that you can use `azd` to get started on Azure.",
  },

  title: "Azure Developer CLI",
  tagline: "Discover - Create - Contribute",

  url: "https://azure.github.io",
  baseUrl: "/awesome-azd/",
  favicon: "img/favicon.ico",
  organizationName: "azure",
  projectName: "awesome-azd",
  deploymentBranch: "gh-pages",

  onBrokenLinks: "throw",

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  headTags: [
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: "anonymous",
      },
    },
  ],

  // Google Fonts responses vary by user agent, so a fixed SRI hash is invalid.
  stylesheets: [
    {
      href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      type: "text/css",
    },
  ],

  // These versionless Microsoft scripts cannot use stable SRI hashes.
  scripts: [
    {
      src: "https://js.monitor.azure.com/scripts/c/ms.analytics-web-4.min.js",
      crossOrigin: "anonymous",
    },
    {
      src: "https://wcpstatic.microsoft.com/mscc/lib/v2/wcp-consent.js",
      crossOrigin: "anonymous",
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: false,
        },
      },

      colorMode: {
        defaultMode: "light",
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },

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
            to: "/templates",
            label: "Templates",
            position: "left",
          },
          {
            to: "/extensions",
            label: "Extensions",
            position: "left",
          },
          {
            type: "dropdown",
            label: "Hosting",
            position: "left",
            items: [
              {
                to: "/services/container-apps",
                label: "Azure Container Apps",
              },
              {
                to: "/services/azure-functions",
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
            className: "navbar-external-link",
          },
          {
            to: "https://learn.microsoft.com/azure/architecture/browse/",
            label: "Resources",
            position: "left",
            className: "navbar-external-link",
          },
          {
            href: "https://github.com/Azure/awesome-azd",
            position: "right",
            className: "header-github-link",
            "aria-label": "GitHub repository",
          },
          {
            to: "https://azure.github.io/awesome-azd/docs/contribute",
            label: "Add a template",
            position: "right",
            className: "button",
          },
        ],
      },
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
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
  plugins: [
    require.resolve("./route_generator_plugin/catalogRouteGenerator"),
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          {
            to: "/getting-started",
            from: "/about",
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
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
        },

        blog: false,

        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],
};

module.exports = config;

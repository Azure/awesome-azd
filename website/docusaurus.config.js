// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion


// CONFIG: Set for use in themeConfig: prism
//    Pick: https://github.com/FormidableLabs/prism-react-renderer/tree/master/src/themes
const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

// USAGE: Config object can be accessed via React context as `{siteConfig}`
//   See: https://docusaurus.io/docs/configuration#custom-configurations
/** @type {import('@docusaurus/types').Config} */
const config = {

  // CONFIG: Add Custom Fields - globally reference them from siteConfig
  //    See: https://docusaurus.io/docs/deployment#using-environment-variables
  customFields: {
    description: "Azure Developer CLI (azd) templates are idiomatic application templates created using the `azd` conventions so that you can use `azd` to get started on Azure.",
  },

  // CONFIG: Landing Pages uses this (also globally via siteConfig)
  title: 'Awesome Azure Dev CLI',
  tagline: 'Discover - Create - Contribute',

  // CONIFIG: Used for GitHub Pages
  url: 'https://azure.github.io/awesome-azd',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'azure', 
  projectName: 'awesome-azd',
  deploymentBranch: 'gh-pages',

  // CONFIG: Early detection for site health
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // CONFIG: Localization if supporting multiple languages
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // CONFIG: theme = set properties for UI like navbar, footer, docs, copyright etc.
  //    See: https://docusaurus.io/docs/api/docusaurus-config#themeConfig
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // CONFIG: sidebar
      //    See:
      docs :{
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },

      // CONFIG: default theme color mode
      //    See:
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },

      // CONFIG: navbar logo, items, style, stickiness
      //    See: https://docusaurus.io/docs/next/api/themes/configuration#navbar
      navbar: {
        title: 'awesome-azd',
        logo: {
          alt: 'Awesome Azd logo',
          src: 'img/logo.png',
          href: 'https://learn.microsoft.com/azure/developer/azure-developer-cli/',
          target: '_self',
          width: 32,
          height: 32,
        },

        style: 'primary',

        items: [
          // FIXME: TEMPORARILY DISABLE DOCS, BLOG
          //{ label: "Tutorial", position: "left", type: "doc", docId: "intro",},
          //{ to: '/blog', label: 'Blog', position: 'left'},
          
          {to: '/', label: 'Home', position: 'left'},
          {to: '/gallery', label: 'Gallery', position: 'left'},
          { label: "Contribute", position: "left", type: "doc", docId: "intro",},

          // CONFIG: 
          // Make sure you have class defined in src/css/custom.css
          { 
            href: 'https://github.com/azure/awesome-azd',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
          },
          {
            type: 'html',
            position: 'right',
            value: '<button><a href="https://learn.microsoft.com/azure/architecture/browse/"> Browse Architectures </a></button>',
          },
        ],
      },

      // CONFIG: 
      //    See:
      footer: {
        style: "light",
        links: [
          { label: `azd-templates`, to: 'https://github.com/azure/awesome-azd' },
          { label: `azd Docs`, to: 'https://learn.microsoft.com/azure/developer/azure-developer-cli/' },
          { label: `azd Quickstart`, to: 'https://learn.microsoft.com/azure/developer/azure-developer-cli/' },
          { label: `azd Create`, to: 'https://learn.microsoft.com/azure/developer/azure-developer-cli/make-azd-compatible?pivots=azd-create' },
          { label: `azd Reference`, to: 'https://learn.microsoft.com/azure/developer/azure-developer-cli/reference' },  
          {
            label: 'Privacy Statement ',
            to: 'https://privacy.microsoft.com/privacystatement',
          },
          { 
           label: `Copyright © ${new Date().getFullYear()} Microsoft`,
           to: 'https://microsoft.com'
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
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },

      // CONFIG: Use sparingly to drive attention to a specific call-to-action or new feature
      //    See: https://docusaurus.io/docs/next/api/themes/configuration#announcement-bar
      announcementBar: {
        id: 'Join us for #Hacktoberfest ' ,
        content:
          '<b> Join us for ✨ #Hacktoberfest | Give  us a 🌟 <a href="https://www.linkedin.com/in/nityan/recent-activity/posts/"><b> on Github</b></a> ',
        backgroundColor: '#000010',
        textColor: '#ffffff',
        isCloseable: false,
      },

    }),

  // CONFIG: plugins
  //    See
  plugins: [
    [
      '@docusaurus/plugin-ideal-image',
      {
        quality: 70,
        max: 1030, // max resized image's size.
        min: 640, // min resized image's size. if original is lower, use that size.
        steps: 2, // the max number of images generated between min and max (inclusive)
        disableInDev: false,
      },
    ],
  ],

  // CONFIG: Set presets for chosen theme
  presets: [
    [
      'classic',
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
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

};

module.exports = config;

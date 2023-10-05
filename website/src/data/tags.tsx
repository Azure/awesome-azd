/*
 * ADD YOUR SITE TO THE DOCUSAURUS SHOWCASE:
 *
 * Requirements for adding your site to our showcase:
 * - It is a production-ready site with real content and decent customizations
 * (different from the init templates)
 * - It is NOT a work-in-progress with empty pages
 * - It has a stable domain (a Netlify/Vercel deploy preview is not allowed)
 *
 * Instructions:
 * - Add your site in the json array below
 * - `title` is your project's name (no need for the "Docs" suffix)
 * - A short (≤120 characters) description of your project
 * - Use relevant tags to categorize your site (read the tag descriptions below)
 * - Add a local image preview (decent screenshot of your Docusaurus site)
 * - The image MUST be added to the GitHub repository, and use `require("img")`
 * - The image has to have minimum width 640 and an aspect of no wider than 2:1
 * - If your website is open-source, add your source link. The link should open
 *   to a directory containing the `docusaurus.config.js` file
 * - Open a PR and check for reported CI errors
 *
 * Example PR: https://github.com/facebook/docusaurus/pull/3976
 *
 * If you edit this file through the GitHub interface, you can:
 * - Submit first your users.tsx edit PR
 * - This will create a branch on your Docusaurus fork (usually "patch-1")
 * - Go to https://github.com/<username>/docusaurus/tree/<branch>/website/src/data/showcase
 * - Drag-and-drop an image here to add it to your existing PR
 *
 * Please help us maintain this showcase page data:
 * - Update sites with wrong data
 * - Ensure site tags remain correct over time
 * - Remove sites not using Docusaurus anymore
 * - Add missing Docusaurus sites (if the site owner agreed)
 */

export type Tag = {
  label: string;
  description: string;
  azureIcon?: string;
  url?: string;
  type?: string;
};

export type User = {
  title: string;
  description: string;
  preview: string;
  website: string;
  author: string;
  source: string | null;
  tags: TagType[];
};

// NN: Updated TagType to suit Static Web Apps
export type TagType =
  | "helpwanted"
  | "msft"
  | "community"
  | "new"
  | "popular"
  | "bicep"
  | "typescript"
  | "javascript"
  | "dotnetCsharp"
  | "java"
  | "python"
  | "django"
  | "reactjs"
  | "nodejs"
  | "kubernetes"
  | "keda"
  | "grafana"
  | "prometheus"
  | "appservice"
  | "cosmosdb"
  | "monitor"
  | "keyvault"
  | "aca"
  | "mongodb"
  | "signalR"
  | "functions"
  | "blobstorage"
  | "azuredb-postgreSQL"
  | "azuresql"
  | "webapps"
  | "terraform"
  | "swa"
  | "dapr"
  | "servicebus"
  | "vnets"
  | "fastapi"
  | "fhir"
  | "ahds"
  | "appinsights"
  | "loganalytics"
  | "cognitivesearch"
  | "openai"
  | "azureai"
  | "flask"
  | "apim"
  | "spring"
  | "thymeleaf"
  | "sap"
  | "sapcloudsdk"
  | "nestjs"
  | "dataverse"
  | "chatgpt"
  | "aks"
  | "azurecdn"
  | "frontdoor"
  | "enterprisepatterns"
  | "jupyter"
  | "datascience"
  | "azurespringapps"
  | "rediscache"
  | "ai"
  | "php"
  | "agw"
  | "streamlit"
  | "azurebot"
  | "ade"
  | "platformengineering"
  | "devcenter"
  ;

// LIST OF AVAILABLE TAGS
// Each tag in lit about must have a defined object here
// One or more tags can be associated per card
// Tag Metadata:
//   - label = short name seen in tag
//   - description = explainer for usage
//   - color = color of the dot in tag
// Some tags are special:
//    - 'help wanted` must associate "source" with an open issue
export const Tags: { [type in TagType]: Tag } = {
  // =============     FOR ADMIN USE ONLY:

  // Special Tag
  msft: {
    label: "Microsoft Authored",
    description: "This tag is used for Microsoft azd templates.",
  },
  community: {
    label: "Community Authored",
    description: "This tag is used for community templates.",
  },
  new: {
    label: "New",
    description: "This tag is used for new templates.",
  },
  popular: {
    label: "Popular",
    description: "This tag is used for popular templates.",
  },

  //============  FOR REGULAR USE

  // Language Tags

  javascript: {
    label: "JavaScript",
    description: "Template contains JavaScript app code",
    type: "Language",
  },
  typescript: {
    label: "TypeScript",
    description: "Template contains TypeScript app code",
    type: "Language",
  },
  dotnetCsharp: {
    label: ".NET/C#",
    description: "Template contains .NET and/or C# app code",
    type: "Language",
  },
  java: {
    label: "Java",
    description: "Template contains Java app code",
    type: "Language",
  },
  python: {
    label: "Python",
    description: "Template contains Python app code",
    type: "Language",
  },
  django: {
    label: "Django",
    description: "Template contains Django web app code",
    type: "Language",
  },
  reactjs: {
    label: "React.js",
    description: "Template architecture uses React.js",
    type: "Tools",
  },
  nodejs: {
    label: "Node.js",
    description: "Template architecture uses Node.js",
    type: "Language",
  },
  php: {
    label: "PHP",
    description: "Template architecture uses PHP",
    type: "Language",
  },

  // ---- Templating Options
  bicep: {
    label: "Bicep",
    description: "Template uses Bicep for Infra as Code",
    type: "Infrastructure as Code",
  },
  terraform: {
    label: "Terraform",
    description: "Template uses Terraform for Infra as Code",
    type: "Infrastructure as Code",
  },

  // ---- 3rd Party Services
  mongodb: {
    label: "MongoDB",
    description: "Template architecture uses MongoDB",
    type: "Database",
  },
  fastapi: {
    label: "FastAPI",
    description: "Template architecture uses FastAPI web framework",
    type: "Framework",
  },
  fhir: {
    label: "FHIR Service",
    description:
      "Template architecture uses Fast Healthcare Interoperability Resources (FHIR) service",
    type: "Service",
  },
  flask: {
    label: "Flask",
    description: "Template architecture uses Flask web framework",
    type: "Framework",
  },
  nestjs: {
    label: "NestJS",
    description: "Template architecture uses NestJS framework",
    type: "Framework",
  },
  sap: {
    label: "SAP",
    description:
      "Template architecture uses Systems Applications and Products in data processing (SAP)",
    type: "Tools",
  },
  sapcloudsdk: {
    label: "SAP Cloud SDK",
    description: "Template architecture uses SAP Cloud SDK",
    type: "Tools",
  },
  spring: {
    label: "Spring",
    description: "Template architecture uses Spring framework",
    type: "Framework",
  },
  thymeleaf: {
    label: "Thymeleaf",
    description: "Template architecture uses Thymeleaf template engine",
    type: "Tools",
  },
  dataverse: {
    label: "Dataverse",
    description: "Template architecture uses Microsoft Dataverse",
    type: "Service",
  },
  chatgpt: {
    label: "ChatGPT",
    description: "Template architecture uses ChatGPT model",
    type: "Tools",
  },
  jupyter: {
    label: "Jupyter Notebooks",
    description: "Template architecture uses Jupyter Notebooks",
    type: "Tools",
  },
  keda: {
    label: "KEDA",
    description:
      "Template architecture uses Kubernetes Event Driven Autoscaling (KEDA)",
    type: "Tools",
  },
  kubernetes: {
    label: "Kubernetes",
    description: "Template architecture uses Kubernetes",
    type: "Platform",
  },
  webapps: {
    label: "Web Apps",
    description: "Template architecture uses Web Apps",
    type: "Service",
  },
  dapr: {
    label: "Dapr",
    description:
      "Template architecture uses Distributed Application Runtime (dapr)",
    type: "Tools",
  },
  prometheus: {
    label: "Prometheus",
    description: "Template architecture uses Prometheus",
    type: "Database",
  },
  streamlit: {
    label: "Streamlit",
    description: "Template architecture uses Streamlit library",
    type: "Framework",
  },
  devcenter: {
    label: "Dev Center",
    description: "Template architecture uses Dev Center",
    type: "Service",
  },
  // ---- Azure Services
  ahds: {
    label: "Azure Health Data Service",
    description:
      "Template architecture uses Azure Health Data Services workspace",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO: Add Azure Health Data Services icon
    url: "https://azure.microsoft.com/products/health-data-services/",
    type: "Service",
  },
  appinsights: {
    label: "Azure Application Insights",
    description: "Template architecture uses Azure Application Insights",
    azureIcon: "./img/Azure-Application-Insights.svg",
    url: "https://learn.microsoft.com/azure/azure-monitor/app/app-insights-overview",
    type: "Service",
  },
  loganalytics: {
    label: "Azure Log Analytics",
    description: "Template architecture uses Azure Log Analytics",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://learn.microsoft.com/azure/azure-monitor/logs/log-analytics-overview",
    type: "Service",
  },
  appservice: {
    label: "Azure App Service",
    description: "Template architecture uses Azure App Service",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/app-service",
    type: "Service",
  },
  monitor: {
    label: "Azure Monitor",
    description: "Template architecture uses Azure Monitor Service",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/monitor",
    type: "Service",
  },
  keyvault: {
    label: "Azure Key Vault",
    description: "Template architecture uses Azure Key Vault",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/key-vault",
    type: "Service",
  },
  aca: {
    label: "Azure Container Apps",
    description: "Template architecture uses Azure Container Apps",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/container-apps",
    type: "Service",
  },
  cosmosdb: {
    label: "Azure CosmosDB",
    description: "Template architecture uses Azure CosmosDB",
    azureIcon: "./img/Azure-Cosmos-DB.svg",
    url: "https://azure.microsoft.com/products/cosmos-db/",
    type: "Service",
  },
  signalR: {
    label: "Azure SignalR",
    description: "Template architecture uses Azure SignalR",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/signalr-service",
    type: "Service",
  },
  functions: {
    label: "Azure Functions",
    description: "Template architecture uses Azure Functions",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/functions",
    type: "Service",
  },
  blobstorage: {
    label: "Azure Blob Storage",
    description: "Template architecture uses Azure Blob Storage",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/storage/blobs",
    type: "Service",
  },
  azuresql: {
    label: "Azure SQL",
    description: "Template architecture uses Azure SQL",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/azure-sql/database",
    type: "Database",
  },
  "azuredb-postgreSQL": {
    label: "Azure PostgreSQL",
    description: "Template architecture uses Azure Database for PostgreSQL",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/postgresql",
    type: "Database",
  },
  swa: {
    label: "Azure Static Web Apps",
    description: "Template architecture uses Azure Static Web Apps",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/app-service/static",
    type: "Service",
  },
  servicebus: {
    label: "Azure Service Bus",
    description: "Template architecture uses Azure Service Bus",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/service-bus",
    type: "Service",
  },
  vnets: {
    label: "Azure Virtual Networks (VNET)",
    description: "Template architecture uses Azure Virtual Networks",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/virtual-network",
    type: "Service",
  },
  cognitivesearch: {
    label: "Azure Cognitive Search",
    description: "Template architecture uses Azure Cognitive Search",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/ai-services/cognitive-search",
    type: "Service",
  },
  openai: {
    label: "Azure OpenAI Service",
    description: "Template architecture uses Azure OpenAI Service",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/ai-services/openai-service",
    type: "Service",
  },
  azureai: {
    label: "Azure AI Service",
    description: "Template architecture uses Azure AI Service",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/solutions/ai",
    type: "Service",
  },
  apim: {
    label: "Azure API Management",
    description: "Template architecture uses Azure API Management",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/api-management",
    type: "Service",
  },
  aks: {
    label: "Azure Kubernetes Service",
    description: "Template architecture uses Azure Kubernetes Service",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/kubernetes-service",
    type: "Service",
  },
  azurecdn: {
    label: "Azure Content Delivery Network",
    description: "Template architecture uses Azure Content Delivery Network",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/cdn",
    type: "Service",
  },
  frontdoor: {
    label: "Azure Front Door",
    description: "Template architecture uses Azure Front Door",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/frontdoor",
    type: "Service",
  },
  grafana: {
    label: "Azure Managed Grafana",
    description: "Template architecture uses Azure Managed Grafana",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/managed-grafana",
    type: "Service",
  },
  azurespringapps: {
    label: "Azure Spring Apps",
    description: "Template architecture uses Azure Spring Apps",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/spring-apps",
    type: "Service",
  },
  rediscache: {
    label: "Azure Redis Cache",
    description: "Template architecture uses Azure Redis Cache",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/cache",
    type: "Service",
  },
  agw: {
    label: "Azure Application Gateway",
    description: "Template architecture uses Azure Application Gateway",
    azureIcon: "./img/Azure-Application-Insights.svg", //TODO
    url: "https://azure.microsoft.com/products/application-gateway",
    type: "Service",
  },
  azurebot: {
    label: "Azure AI Bot Service",
    description: "Template architecture uses Azure AI Bot Service",
    type: "Service",
  },
  ade: {
    label: "Azure Deployment Environments",
    description: "Template architecture uses Azure Deployment Environments",
    type: "Service",
  },

  // For Topics
  datascience: {
    label: "Data Science",
    description: "Template architecture involves Data Science",
    type: "Topic",
  },
  enterprisepatterns: {
    label: "Enterprise App Patterns",
    description:
      "Template architecture involves Enterprise Application Patterns",
    type: "Topic",
  },
  ai: {
    label: "Artificial Intelligence",
    description: "Template architecture involves Artificial Intelligence",
    type: "Topic",
  },
  platformengineering: {
    label: "Platform Engineering",
    description: "Template architecture involves Platform Engineering",
    type: "Topic",
  },
};


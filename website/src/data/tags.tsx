/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export type Tag = {
  label: string;
  description: string;
  azureIcon?: string;
  darkModeAzureIcon?: string;
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
  | "angular"
  | "nodejs"
  | "kubernetes"
  | "keda"
  | "grafana"
  | "prometheus"
  | "appservice"
  | "cosmosdb"
  | "azuredatafactory"
  | "monitor"
  | "keyvault"
  | "aca"
  | "mongodb"
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
  | "appinsights"
  | "loganalytics"
  | "aisearch"
  | "openai"
  | "azureai"
  | "flask"
  | "apim"
  | "spring"
  | "thymeleaf"
  | "sap"
  | "sapcap"
  | "sapcloudsdk"
  | "nestjs"
  | "dataverse"
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
  | "semantickernel"
  | "webcomponents"
  | "microfrontend"
  | "blazor"
  | "azuredb-mySQL"
  | "eventhub"
  | "azurestorage"
  | "helm"
  | "dall-e"
  | "gpt"
  | "azureappconfig"
  | "ruby"
  | "rubyonrails"
  | "serverlessapi"
  | "langchain"
  | "aicollection"
  | "aistudio"
  | "apicenter"
  | "eventgrid"
  | "diagnosticsettings"
  | "managedidentity"
  | "serviceprincipal"
  | "logicapps"
  | "msal"
  | "pinecone"
  | "nextjs"
  | "speechservice"
  | "kernelmemory"
  | "promptengineering"
  | "rag"
  | "featureExperimentation"
  | "featuremanagement";

// LIST OF AVAILABLE TAGS
// Each tag in lit about must have a defined object here
// One or more tags can be associated per card
// Tag Metadata:
//   - label = short name seen in tag
//   - description = explainer for usage
//   - type = type of tag
//   - azureIcon = svg path for azure service icon
//   - url = url for azure service
//   - darkModeAzureIcon = svg path for azure service icon in dark mode
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
  aicollection: {
    label: "AI Collection",
    description: "This tag is used for templates included in the Microsoft-curated AI collection.",
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
  ruby: {
    label: "Ruby",
    description: "Template architecture uses Ruby",
    type: "Language",
  },

  // ---- Tools

  reactjs: {
    label: "React.js",
    description: "Template architecture uses React.js",
    type: "Tools",
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
  sapcap: {
    label: "SAP CAP",
    description:
      "Template architecture uses SAP Cloud Application Programming Model",
    type: "Tools",
  },
  thymeleaf: {
    label: "Thymeleaf",
    description: "Template architecture uses Thymeleaf template engine",
    type: "Tools",
  },
  "dall-e": {
    label: "Dall-E",
    description: "Template architecture uses Dall-E",
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
  dapr: {
    label: "Dapr",
    description:
      "Template architecture uses Distributed Application Runtime (dapr)",
    type: "Tools",
  },
  webcomponents: {
    label: "Web Components",
    description: "Template architecture uses Web Components",
    type: "Tools",
  },
  helm: {
    label: "Helm",
    description: "Template architecture uses Helm",
    type: "Tools",
  },
  gpt: {
    label: "GPT",
    description: "Template architecture uses GPT AI model",
    type: "Tools",
  },
  msal: {
    label: "Microsoft Authentication Library",
    description: "Template architecture uses Microsoft Authentication Library",
    type: "Tools",
  },
  featuremanagement: {
    label: "Microsoft Feature Management",
    description: "Template architecture uses Microsoft Feature Management",
    type: "Tools",
  },

  // ---- Infrastructure as Code
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

  // ---- Database
  mongodb: {
    label: "MongoDB",
    description: "Template architecture uses MongoDB",
    type: "Database",
  },
  prometheus: {
    label: "Prometheus",
    description: "Template architecture uses Prometheus",
    type: "Database",
  },
  pinecone: {
    label: "Pinecone",
    description: "Template architecture uses Pinecone",
    type: "Database",
  },

  // ---- Framework
  fastapi: {
    label: "FastAPI",
    description: "Template architecture uses FastAPI web framework",
    type: "Framework",
  },
  flask: {
    label: "Flask",
    description: "Template architecture uses Flask web framework",
    type: "Framework",
  },
  django: {
    label: "Django",
    description: "Template architecture uses Django web framework",
    type: "Framework",
  },
  nestjs: {
    label: "NestJS",
    description: "Template architecture uses NestJS framework",
    type: "Framework",
  },
  spring: {
    label: "Spring",
    description: "Template architecture uses Spring framework",
    type: "Framework",
  },
  streamlit: {
    label: "Streamlit",
    description: "Template architecture uses Streamlit library",
    type: "Framework",
  },
  semantickernel: {
    label: "Semantic Kernel",
    description: "Template architecture uses Semantic Kernel",
    type: "Framework",
  },
  microfrontend: {
    label: "Micro Frontend",
    description: "Template architecture uses Micro Frontend",
    type: "Framework",
  },
  blazor: {
    label: "Blazor",
    description: "Template architecture uses Blazor",
    type: "Framework",
  },
  rubyonrails: {
    label: "Ruby on Rails",
    description:
      "Template architecture uses Ruby on Rails web application framework",
    type: "Framework",
  },
  langchain: {
    label: "LangChain",
    description: "Template architecture uses LangChain framework",
    type: "Framework",
  },
  nextjs: {
    label: "Next.js",
    description: "Template architecture uses Next.js framework",
    type: "Framework",
  },
  kernelmemory: {
    label: "Kernel Memory",
    description: "Template architecture uses Kernel Memory",
    type: "Framework",
  },
  rag: {
    label: "Retrieval-Augmented Generation",
    description: "Template architecture uses Retrieval-Augmented Generation",
    type: "Framework",
  },

  // ---- Platform
  kubernetes: {
    label: "Kubernetes",
    description: "Template architecture uses Kubernetes",
    type: "Platform",
  },
  angular: {
    label: "Angular",
    description: "Template architecture uses Angular",
    type: "Platform",
  },

  // ---- Service
  dataverse: {
    label: "Dataverse",
    description: "Template architecture uses Microsoft Dataverse",
    type: "Service",
  },
  webapps: {
    label: "Web Apps",
    description: "Template architecture uses Web Apps",
    type: "Service",
  },
  serverlessapi: {
    label: "Serverless API",
    description: "Template architecture uses Serverless API",
    type: "Service",
  },

  // ---- Azure Services
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
    azureIcon: "./img/Azure-Log-Analytics.svg",
    url: "https://learn.microsoft.com/azure/azure-monitor/logs/log-analytics-overview",
    type: "Service",
  },
  appservice: {
    label: "Azure App Service",
    description: "Template architecture uses Azure App Service",
    azureIcon: "./img/Azure-App-Service.svg",
    url: "https://azure.microsoft.com/products/app-service",
    type: "Service",
  },
  monitor: {
    label: "Azure Monitor",
    description: "Template architecture uses Azure Monitor Service",
    azureIcon: "./img/Azure-Monitor.svg",
    url: "https://azure.microsoft.com/products/monitor",
    type: "Service",
  },
  keyvault: {
    label: "Azure Key Vault",
    description: "Template architecture uses Azure Key Vault",
    azureIcon: "./img/Azure-Key-Vault.svg",
    url: "https://azure.microsoft.com/products/key-vault",
    type: "Service",
  },
  aca: {
    label: "Azure Container Apps",
    description: "Template architecture uses Azure Container Apps",
    azureIcon: "./img/Azure-Container-Apps.svg",
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
  functions: {
    label: "Azure Functions",
    description: "Template architecture uses Azure Functions",
    azureIcon: "./img/Azure-Function.svg",
    url: "https://azure.microsoft.com/products/functions",
    type: "Service",
  },
  blobstorage: {
    label: "Azure Blob Storage",
    description: "Template architecture uses Azure Blob Storage",
    azureIcon: "./img/Azure-Storage.svg",
    url: "https://azure.microsoft.com/products/storage/blobs",
    type: "Service",
  },
  azuresql: {
    label: "Azure SQL",
    description: "Template architecture uses Azure SQL",
    azureIcon: "./img/Azure-SQL.svg",
    url: "https://azure.microsoft.com/products/azure-sql/database",
    type: "Database",
  },
  "azuredb-postgreSQL": {
    label: "Azure PostgreSQL",
    description: "Template architecture uses Azure Database for PostgreSQL",
    azureIcon: "./img/Azure-PostgreSQL.svg",
    url: "https://azure.microsoft.com/products/postgresql",
    type: "Database",
  },
  "azuredb-mySQL": {
    label: "Azure MySQL",
    description: "Template architecture uses Azure Database for MySQL",
    azureIcon: "./img/Azure-MySQL.svg",
    url: "https://azure.microsoft.com/products/mysql",
    type: "Database",
  },
  swa: {
    label: "Azure Static Web Apps",
    description: "Template architecture uses Azure Static Web Apps",
    azureIcon: "./img/Azure-Static-Web-Apps.svg",
    url: "https://azure.microsoft.com/products/app-service/static",
    type: "Service",
  },
  servicebus: {
    label: "Azure Service Bus",
    description: "Template architecture uses Azure Service Bus",
    azureIcon: "./img/Azure-Service-Bus.svg",
    url: "https://azure.microsoft.com/products/service-bus",
    type: "Service",
  },
  vnets: {
    label: "Azure Virtual Networks (VNET)",
    description: "Template architecture uses Azure Virtual Networks",
    azureIcon: "./img/Azure-Virtual-Networks.svg",
    url: "https://azure.microsoft.com/products/virtual-network",
    type: "Service",
  },
  aisearch: {
    label: "Azure AI Search",
    description: "Template architecture uses Azure AI Search",
    azureIcon: "./img/Azure-AI-Search.svg",
    url: "https://azure.microsoft.com/products/ai-services/ai-search",
    type: "Service",
  },
  openai: {
    label: "Azure OpenAI Service",
    description: "Template architecture uses Azure OpenAI Service",
    azureIcon: "./img/Azure-OpenAI-Service.svg",
    darkModeAzureIcon: "./img/Azure-OpenAI-Service-white.svg",
    url: "https://azure.microsoft.com/products/ai-services/openai-service",
    type: "Service",
  },
  azureai: {
    label: "Azure AI Service",
    description: "Template architecture uses Azure AI Service",
    azureIcon: "./img/Azure-AI-Service.svg",
    url: "https://azure.microsoft.com/solutions/ai",
    type: "Service",
  },
  speechservice: {
    label: "Azure Speech Services",
    description: "Template architecture uses Azure AI Speech Services",
    azureIcon: "./img/Azure-Speech-Services.svg",
    url: "https://azure.microsoft.com/en-us/products/ai-services/ai-speech",
    type: "Service",
  },
  apim: {
    label: "Azure API Management",
    description: "Template architecture uses Azure API Management",
    azureIcon: "./img/Azure-API-Management.svg",
    url: "https://azure.microsoft.com/products/api-management",
    type: "Service",
  },
  aks: {
    label: "Azure Kubernetes Service",
    description: "Template architecture uses Azure Kubernetes Service",
    azureIcon: "./img/Azure-Kubernetes-Service.svg",
    url: "https://azure.microsoft.com/products/kubernetes-service",
    type: "Service",
  },
  azurecdn: {
    label: "Azure Content Delivery Network",
    description: "Template architecture uses Azure Content Delivery Network",
    azureIcon: "./img/Azure-Front-Door-And-CDN.svg",
    url: "https://azure.microsoft.com/products/cdn",
    type: "Service",
  },
  frontdoor: {
    label: "Azure Front Door",
    description: "Template architecture uses Azure Front Door",
    azureIcon: "./img/Azure-Front-Door-And-CDN.svg",
    url: "https://azure.microsoft.com/products/frontdoor",
    type: "Service",
  },
  grafana: {
    label: "Azure Managed Grafana",
    description: "Template architecture uses Azure Managed Grafana",
    azureIcon: "./img/Azure-Managed-Grafana.svg",
    url: "https://azure.microsoft.com/products/managed-grafana",
    type: "Service",
  },
  azurespringapps: {
    label: "Azure Spring Apps",
    description: "Template architecture uses Azure Spring Apps",
    azureIcon: "./img/Azure-Spring-Apps.svg",
    url: "https://azure.microsoft.com/products/spring-apps",
    type: "Service",
  },
  rediscache: {
    label: "Azure Cache for Redis",
    description: "Template architecture uses Azure Cache for Redis",
    azureIcon: "./img/Azure-Cache-for-Redis.svg",
    url: "https://azure.microsoft.com/products/cache",
    type: "Service",
  },
  agw: {
    label: "Azure Application Gateway",
    description: "Template architecture uses Azure Application Gateway",
    azureIcon: "./img/Azure-Application-Gateway.svg",
    url: "https://azure.microsoft.com/products/application-gateway",
    type: "Service",
  },
  azurebot: {
    label: "Azure AI Bot Service",
    description: "Template architecture uses Azure AI Bot Service",
    azureIcon: "./img/Azure-AI-Bot-Services.svg",
    url: "https://azure.microsoft.com/products/ai-services/ai-bot-service",
    type: "Service",
  },
  ade: {
    label: "Azure Deployment Environments",
    description: "Template architecture uses Azure Deployment Environments",
    azureIcon: "./img/Azure-Deployment-Environments.svg",
    url: "https://azure.microsoft.com/products/deployment-environments",
    type: "Service",
  },
  eventhub: {
    label: "Azure Event Hubs",
    description: "Template architecture uses Azure Event Hubs",
    azureIcon: "./img/Azure-Event-Hubs.svg",
    url: "https://azure.microsoft.com/products/event-hubs",
    type: "Service",
  },
  azurestorage: {
    label: "Azure Storage",
    description: "Template architecture uses Azure Storage",
    azureIcon: "./img/Azure-Storage.svg",
    url: "https://azure.microsoft.com/products/storage",
    type: "Service",
  },
  azureappconfig: {
    label: "Azure App Configuration",
    description: "Template architecture uses Azure App Configuration",
    azureIcon: "./img/Azure-App-Configuration.svg",
    url: "https://azure.microsoft.com/products/app-configuration",
    type: "Service",
  },
  aistudio: {
    label: "Azure AI Studio",
    description: "Template architecture uses Azure AI Studio",
    azureIcon: "./img/Azure-AI-Studio.svg",
    url: "https://azure.microsoft.com/products/ai-studio",
    type: "Service",
  },
  apicenter: {
    label: "Azure API Center",
    description: "Template architecture uses Azure API Center",
    azureIcon: "./img/Azure-API-Center.svg",
    url: "https://learn.microsoft.com/azure/api-center/overview",
    type: "Service",
  },
  eventgrid: {
    label: "Azure Event Grid",
    description: "Template architecture uses Azure Event Grid",
    azureIcon: "./img/Azure-Event-Grid.svg",
    url: "https://learn.microsoft.com/azure/event-grid/overview",
    type: "Service",
  },
  diagnosticsettings: {
    label: "Azure Diagnostic Settings",
    description: "Template architecture uses Azure Diagnostic Settings",
    azureIcon: "./img/Azure-Diagnostic-Settings.svg",
    url: "https://learn.microsoft.com/azure/azure-monitor/essentials/diagnostic-settings",
    type: "Service",
  },
  logicapps: {
    label: "Azure Logic Apps",
    description: "Template architecture uses Azure Logic Apps",
    azureIcon: "./img/Azure-Logic-Apps.svg",
    url: "https://learn.microsoft.com/azure/logic-apps/logic-apps-overview",
    type: "Service",
  },
  managedidentity: {
    label: "Azure Managed Identities",
    description: "Template architecture uses Azure Managed Identities",
    azureIcon: "./img/Azure-Managed-Identities.svg",
    url: "https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview",
    type: "Service",
  },
  serviceprincipal: {
    label: "Azure Service Principal",
    description: "Template architecture uses Azure Service Principal",
    azureIcon: "./img/Azure-Service-Principal.svg",
    url: "https://learn.microsoft.com/entra/identity-platform/app-objects-and-service-principals",
    type: "Service",
  },
  azuredatafactory: {
    label: "Azure Data Factory",
    description: "Template architecture uses Azure Data Factory",
    azureIcon: "./img/Azure-Data-Factory.svg",
    url: "https://learn.microsoft.com/azure/data-factory/introduction",
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
  promptengineering: {
    label: "Prompt Engineering",
    description: "Template architecture involves Prompt Engineering",
    type: "Topic",
  },
  featureExperimentation: {
    label: "Feature Experimentation",
    description: "Template architecture involves Feature Experimentation",
    type: "Topic",
  },
};

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export type Tag = {
  label: string;
  description?: string;
  productDescription?: string;
  azureIcon?: string;
  darkModeAzureIcon?: string;
  url?: string;
  type?: string;
};

export type Template = {
  id: string;
  title: string;
  description: string;
  preview?: string;
  authorUrl: string;
  author: string;
  source: string;
  tags: TagType[];
  languages?: TagType[];
  frameworks?: TagType[];
  azureServices?: TagType[];
  IaC?: TagType[];
  templateType?: string;
  extensionFramework?: string;
  extensionTags?: string[];
};

export type TagType = keyof typeof tagDefinitions;

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
const tagDefinitions = {
  // =============     FOR ADMIN USE ONLY:

  // Special Tag
  msft: {
    label: "Microsoft Authored",
    description: "This tag is used for Microsoft azd templates.",
    type: "Authorship",
  },
  community: {
    label: "Community Authored",
    description: "This tag is used for community templates.",
    type: "Authorship",
  },
  new: {
    label: "New",
    description:
      "This tag is used for templates added to the catalog within the past month.",
    type: "Status",
  },
  featured: {
    label: "Featured Template",
    description: "This template is featured in the catalog.",
    type: "Status",
  },
  aiapplication: {
    label: "AI application",
    description:
      "This template is part of the Microsoft-curated AI application catalog.",
    type: "Application Type",
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
  go: {
    label: "Go",
    description: "Template contains Go app code",
    type: "Language",
  },
  rust: {
    label: "Rust",
    description: "Template contains Rust app code",
    type: "Language",
  },
  axum: {
    label: "axum",
    description: "Template architecture uses axum web framework",
    type: "Framework",
  },

  // ---- Tools

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
    type: "Model",
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
  powershell: {
    label: "PowerShell",
    description: "Template architecture uses PowerShell",
    type: "Language",
  },
  dab: {
    label: "Data API builder",
    description: "Template architecture uses Data API builder (DAB)",
    type: "Tools",
  },
  aspire: {
    label: ".NET Aspire",
    description:
      "Set of tools, templates, and packages for building observable, production ready apps.",
    type: "Framework",
  },
  mcp: {
    label: "Model Context Protocol",
    description: "Template architecture uses Model Context Protocol (MCP)",
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
  neondb: {
    label: "Neon Serverless Postgres",
    description: "Template architecture uses Neon",
    type: "Database",
  },
  prometheus: {
    label: "Prometheus",
    description: "Template architecture uses Prometheus",
    type: "Tools",
  },
  pinecone: {
    label: "Pinecone",
    description: "Template architecture uses Pinecone",
    type: "Database",
  },
  cosmosdb: {
    label: "Azure Cosmos DB",
    description: "Template architecture uses Azure Cosmos DB",
    azureIcon: "./img/Azure-Cosmos-DB.svg",
    url: "https://azure.microsoft.com/products/cosmos-db/",
    type: "Database",
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
  quarkus: {
    label: "Quarkus",
    description: "Template architecture uses Quarkus framework",
    type: "Framework",
  },
  javaee: {
    label: "JavaEE",
    description: "Template architecture uses Jakarta EE framework",
    type: "Framework",
  },
  vuejs: {
    label: "Vue.js",
    description: "Template architecture uses Vue.js framework",
    type: "Framework",
  },
  reactjs: {
    label: "React",
    description: "Template architecture uses React framework",
    type: "Framework",
  },
  angular: {
    label: "Angular",
    description: "Template architecture uses Angular framework",
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
    type: "Topic",
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
  langchain4j: {
    label: "LangChain4j",
    description: "Template architecture uses LangChain4j framework",
    type: "Framework",
  },
  autogen: {
    label: "Microsoft AutoGen",
    description: "Template architecture uses Microsoft AutoGen",
    type: "Framework",
  },
  chainlit: {
    label: "Chainlit",
    description: "Template architecture uses Chainlit",
    type: "Framework",
  },

  // ---- Framework
  kubernetes: {
    label: "Kubernetes",
    description: "Template architecture uses Kubernetes",
    type: "Framework",
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
  sharepoint: {
    label: "SharePoint",
    description: "Template architecture involves a connection to SharePoint",
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
    description: "Template architecture uses Azure AI services",
    azureIcon: "./img/Azure-AI-Service.svg",
    url: "https://azure.microsoft.com/solutions/ai/",
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
  azuresignalr: {
    label: "Azure SignalR Service",
    description: "Template architecture uses Azure SignalR Service",
    azureIcon: "./img/Azure-SignalR.svg",
    url: "https://azure.microsoft.com/products/signalr-service/",
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
  aifoundry: {
    label: "Microsoft Foundry",
    description: "Template architecture uses Microsoft Foundry",
    azureIcon: "./img/Azure-AI-Studio.svg",
    url: "https://azure.microsoft.com/products/ai-foundry",
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
  virtualmachine: {
    label: "Azure Virtual Machine",
    description: "Template architecture uses Azure Virtual Machine",
    azureIcon: "./img/Azure-Virtual-Machine.svg",
    url: "https://azure.microsoft.com/azure/virtual-machines",
    type: "Service",
  },
  sentinel: {
    label: "Azure Sentinel",
    description: "Template architecture uses Azure Sentinel",
    azureIcon: "./img/Microsoft-Sentinel.svg",
    url: "https://azure.microsoft.com/en-us/products/microsoft-sentinel/",
    type: "Service",
  },
  trafficmgr: {
    label: "Azure Traffic Manager",
    description: "Template architecture uses Azure Traffic Manager",
    azureIcon: "./img/trafficmgr.svg",
    url: "https://azure.microsoft.com/products/traffic-manager",
    type: "Service",
  },
  purview: {
    label: "Azure Purview",
    description: "Template architecture uses Azure Purview",
    azureIcon: "./img/Azure-Purview.svg",
    url: "https://azure.microsoft.com/products/purview",
    type: "Service",
  },
  backup: {
    label: "Azure Backup",
    description: "Template architecture uses Azure Backup",
    azureIcon: "./img/Azure-Backup.svg",
    url: "https://azure.microsoft.com/products/backup",
    type: "Service",
  },
  recoveryvault: {
    label: "Azure Site Recovery Vault",
    description: "Template architecture uses Azure Recovery Services Vault",
    azureIcon: "./img/Azure-Recovery-Services-Vaults.svg",
    url: "https://learn.microsoft.com/en-us/azure/backup/backup-azure-recovery-services-vault-overview",
    type: "Service",
  },
  // vpngw: {
  //   label: "Azure VPN Gateway",
  //   description: "Template architecture uses Azure VPN Gateway",
  //   azureIcon: "./img/Azure-VPN-GW.svg",
  //   url: "https://azure.microsoft.com/products/vpn-gateway",
  //   type: "Service",
  // },
  loadtesting: {
    label: "Azure Load Testing",
    description: "Template architecture for Azure Load Testing",
    azureIcon: "./img/Azure-Load-Testing.svg",
    url: "https://azure.microsoft.com/products/load-testing",
    type: "Service",
  },
  hyperv: {
    label: "Azure Hyper-V Host",
    description: "Template for Azure Hyper-V Host",
    azureIcon: "./img/Azure-Hyper-V-Host.svg",
    url: "https://learn.microsoft.com/azure/migrate/tutorial-migrate-hyper-v?tabs=UI",
    type: "Service",
  },
  fabric: {
    label: "Microsoft Fabric",
    description: "Template architecture for Microsoft Fabric",
    azureIcon: "./img/Azure-Fabric.png",
    url: "https://www.microsoft.com/microsoft-fabric",
    type: "Service",
  },
  vmsqlserver: {
    label: "SQL Server on Azure Virtual Machines",
    description: "Template architecture for SQL Server",
    azureIcon: "./img/Azure-SQL-Server.svg",
    url: "https://azure.microsoft.com/products/virtual-machines/sql-server/",
    type: "Service",
  },
  avset: {
    label: "Azure Availability Set",
    description: "Template architecture for Availability Set",
    azureIcon: "./img/Azure-Availability-Set.svg",
    url: "https://learn.microsoft.com/azure/virtual-machines/availability-set-overview",
    type: "Service",
  },
  bastion: {
    label: "Azure Bastion",
    description: "Template architecture for Azure Bastion",
    azureIcon: "./img/Azure-Bastion.svg",
    url: "https://azure.microsoft.com/products/azure-bastion",
    type: "Service",
  },
  privateEndpoints: {
    label: "Azure Private Endpoints",
    description: "Template architecture for Azure Private Endpoints",
    azureIcon: "./img/Azure-Private-Endpoints.svg",
    url: "https://learn.microsoft.com/azure/private-link/private-endpoint-overview",
    type: "Service",
  },
  privatelink: {
    label: "Azure Private Link",
    description: "Template architecture for Azure Private Link",
    azureIcon: "./img/Azure-Private-Link.svg",
    url: "https://azure.microsoft.com/products/private-link",
    type: "Service",
  },
  loadbalancer: {
    label: "Azure Load Balancer",
    description: "Template architecture for Azure Load Balancer",
    azureIcon: "./img/Azure-Load-Balancer.svg",
    url: "https://azure.microsoft.com/products/load-balancer",
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

  // Extension Capability Tags
  "ext-custom-commands": {
    label: "Custom Commands",
    description: "Extension provides custom azd commands",
    type: "Extension Capability",
  },
  "ext-lifecycle-events": {
    label: "Lifecycle Events",
    description: "Extension hooks into azd lifecycle events",
    type: "Extension Capability",
  },
  "ext-mcp-server": {
    label: "MCP Server",
    description: "Extension provides a Model Context Protocol server",
    type: "Extension Capability",
  },
  "ext-service-target-provider": {
    label: "Service Target Provider",
    description: "Extension provides custom service deployment targets",
    type: "Extension Capability",
  },
  "ext-framework-service-provider": {
    label: "Framework Service Provider",
    description: "Extension provides framework service integration",
    type: "Extension Capability",
  },
  "ext-provisioning-provider": {
    label: "Provisioning Provider",
    description: "Extension provides custom infrastructure provisioning",
    type: "Extension Capability",
  },
  "ext-validation-provider": {
    label: "Validation Provider",
    description: "Extension provides project validation",
    type: "Extension Capability",
  },
  "ext-metadata": {
    label: "Metadata",
    description: "Extension provides metadata capabilities",
    type: "Extension Capability",
  },

  // AI catalog metadata retained from the former AI App Templates registry
  "golang": {
    "label": "Go",
    "type": "Language"
  },
  "gpt35turbo": {
    "label": "GPT-3.5 Turbo",
    "type": "Model",
    "url": "https://platform.openai.com/docs/models/gpt-3-5-turbo"
  },
  "gpt4turbo": {
    "label": "GPT-4 Turbo",
    "type": "Model",
    "url": "https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4"
  },
  "gpt4": {
    "label": "GPT-4",
    "type": "Model",
    "url": "https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4"
  },
  "gpt4o": {
    "label": "GPT-4 Omni",
    "type": "Model",
    "url": "https://platform.openai.com/docs/models/gpt-4o"
  },
  "gpt4omini": {
    "label": "GPT-4 Omni mini",
    "type": "Model",
    "url": "https://platform.openai.com/docs/models/gpt-4o-mini"
  },
  "gpt54": {
    "label": "GPT-5.4",
    "type": "Model",
    "url": "https://platform.openai.com/docs/models/gpt-5.4"
  },
  "gpt52": {
    "label": "GPT-5.2",
    "type": "Model",
    "url": "https://platform.openai.com/docs/models/gpt-5.2"
  },
  "text-embedding-3-large": {
    "label": "Text-Embedding-3-Large",
    "type": "Model",
    "url": "https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models?tabs=global-standard%2Cstandard-chat-completions#embeddings"
  },
  "text-embedding-3-small": {
    "label": "Text-Embedding-3-Small",
    "type": "Model",
    "url": "https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models?tabs=global-standard%2Cstandard-chat-completions#embeddings"
  },
  "text-embedding-ada-002": {
    "label": "Text-Embedding-ADA-002",
    "type": "Model",
    "url": "https://learn.microsoft.com/azure/ai-services/openai/concepts/models?tabs=python-secure#embeddings-models"
  },
  "llama": {
    "label": "Code Llama",
    "type": "Model",
    "url": "https://llama.meta.com/docs/model-cards-and-prompt-formats/meta-code-llama"
  },
  "mistral7b": {
    "label": "Mistral 7b",
    "type": "Model"
  },
  "deepseek-r1": {
    "label": "DeepSeek R1",
    "type": "Model"
  },
  "meta": {
    "label": "Meta models",
    "type": "Model"
  },
  "mistralai": {
    "label": "Mistral AI models",
    "type": "Model"
  },
  "deepseek": {
    "label": "DeepSeek models",
    "type": "Model"
  },
  "agent": {
    "label": "Agent",
    "type": "Task"
  },
  "chat": {
    "label": "Interactive Chat",
    "type": "Task"
  },
  "search": {
    "label": "Guided Search",
    "type": "Task"
  },
  "llmops": {
    "label": "LLM Ops",
    "type": "Task"
  },
  "completions": {
    "label": "Completions",
    "type": "Task"
  },
  "azurecosmosdb": {
    "label": "Azure Cosmos DB",
    "type": "Database",
    "url": "https://azure.microsoft.com/products/cosmos-db/"
  },
  "azureopenai": {
    "label": "Azure OpenAI Service",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/ai-services/openai-service"
  },
  "azureaiservice": {
    "label": "Azure AI Service",
    "type": "Service",
    "url": "https://azure.microsoft.com/solutions/ai/"
  },
  "azurespringapps": {
    "label": "Azure Spring Apps",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/spring-apps"
  },
  "mcp-client": {
    "label": "MCP Client",
    "url": "https://docs.anthropic.com/en/docs/mcp"
  },
  "mcp-server": {
    "label": "MCP Server",
    "url": "https://docs.anthropic.com/en/docs/mcp"
  }
} as const satisfies Record<string, Tag>;

export const Tags: Record<TagType, Tag> = tagDefinitions;
export const TagList = Object.keys(Tags) as TagType[];
export const sortedTagList: ReadonlyArray<TagType> = [...TagList].sort();

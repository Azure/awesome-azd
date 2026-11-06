/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export type Tag = {
  label: string;
  description?: string;
  icon?: string;
  darkIcon?: string;
  url?: string;
  type?: string;
  subType?: SubType;
  productDescription?: string;
  category?: string;
};

export type Template = {
  title: string;
  description: string;
  authorUrl: string[];
  author: string[];
  source: string;
  legacy_sources?: string[];
  language: TagType[];
  tags: TagType[];
  app_type: TagType[];
  azure_service: TagType[];
  models: TagType[];
  video?: string;
  prerequisites?: TagType[];
  architectureDiagram?: string;
  template_type: string;
  status_valid: boolean;
  deleted?: boolean;
  deletion_reason?: "archived" | "deleted" | "renamed";
  replacement_source?: string;
  screenshot?: string;
  score?: number;
};

type SubType = {
  label: string;
  icon: string;
  darkIcon?: string;
};

export const openai: SubType = {
  label: "Azure OpenAI",
  icon: "/img/ai/Azure-OpenAI-Service.svg",
};

export const meta: SubType = {
  label: "Meta",
  icon: "/img/ai/meta.svg",
};

export const mistralai: SubType = {
  label: "Mistral AI",
  icon: "/img/ai/mistralai.svg",
};

export const deepseek: SubType = {
  label: "DeepSeek AI",
  icon: "/img/ai/deepseek-light-aistudio.svg",
};

// NN: Updated TagType to suit Static Web Apps
export type TagType =
  | "featured"
  | "javascript"
  | "golang"
  | "dotnetCsharp"
  | "java"
  | "python"
  | "typescript"
  | "gpt35turbo"
  | "gpt4turbo"
  | "gpt4"
  | "gpt4o"
  | "gpt4omini"
  | "gpt54"
  | "gpt52"
  | "llama"
  | "agent"
  | "chat"
  | "search"
  | "llmops"
  | "completions"
  | "azuredb-postgreSQL"
  | "azuredb-mysql"
  | "pinecone"
  | "azurecosmosdb"
  | "mistral7b"
  | "bicep"
  | "terraform"
  | "appinsights"
  | "loganalytics"
  | "appservice"
  | "monitor"
  | "keyvault"
  | "aca"
  | "functions"
  | "blobstorage"
  | "swa"
  | "servicebus"
  | "vnets"
  | "aisearch"
  | "openai"
  | "azureaiservice"
  | "apim"
  | "aks"
  | "azurecdn"
  | "frontdoor"
  | "grafana"
  | "azurespringapps"
  | "rediscache"
  | "agw"
  | "azurebot"
  | "ade"
  | "eventhub"
  | "azurestorage"
  | "azureappconfig"
  | "aifoundry"
  | "apicenter"
  | "eventgrid"
  | "diagnosticsettings"
  | "logicapps"
  | "managedidentity"
  | "serviceprincipal"
  | "azuredatafactory"
  | "azureopenai"
  | "meta"
  | "mistralai"
  | "nodejslts"
  | "azd"
  | "python3.9-3.11"
  | "nodejs18+"
  | "git"
  | "pwsh7+"
  | "functionscoretools"
  | ".net8"
  | ".net9"
  | "go1.18+"
  | "docker"
  | "python3.9+"
  | "python3.10+"
  | "python3.11+"
  | "postgreSQL14+"
  | "pgvector"
  | "java17"
  | "nodejs"
  | "maven3.8.x"
  | "maven"
  | "helm"
  | "k9s"
  | "poetry"
  | "swacli"
  | "redis"
  | "pinecone-api"
  | "text-embedding-3-large"
  | "text-embedding-3-small"
  | "text-embedding-ada-002"
  | "azuresignalr"
  | "azcli"
  | "nodejs22"
  | "deepseek"
  | "deepseek-r1"
  | "nodejs20"
  | "azurite"
  | "odbc-driver-18"
  | "sqlcmd-windows"
  | "sqlcmd-linux"
  | "purview"
  | "fabric"
  | "mcp-server"
  | "mcp-client"
  ;

// LIST OF AVAILABLE TAGS
// Each tag in lit about must have a defined object here
// One or more tags can be associated per card
// Tag Metadata:
//   - label = short name seen in tag
//   - description = explainer for usage
//   - type = type of tag
//   - icon = svg path for icon
//   - url = url for azure service
export const Tags: { [type in TagType]: Tag } = {
  //============  FOR REGULAR USE

  // Special Tag
  featured: {
    label: "Featured Template",
    description: "This tag is used for featured templates.",
  },

  // Pre-requisite Tags

  nodejslts: {
    label: "Node.js LTS",
    url: "https://nodejs.org/"
  },
  nodejs20: {
    label: "Node.js 20",
    url: "https://nodejs.org/"
  },
  azurite: {
    label: "Azurite",
    url: "https://github.com/Azure/Azurite"
  },
  azd: {
    label: "Azure Developer CLI (azd)",
    url: "https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd?tabs=winget-windows%2Cbrew-mac%2Cscript-linux&pivots=os-windows"
  },
  azcli: {
    label: "Azure CLI",
    url: "https://learn.microsoft.com/cli/azure/"
  },
  "python3.9-3.11": {
    label: "Python 3.9, 3.10, or 3.11",
    url: "https://www.python.org/downloads/"
  },
  "python3.9+": {
    label: "Python 3.9+",
    url: "https://www.python.org/downloads/"
  },
  "python3.10+": {
    label: "Python 3.10+",
    url: "https://www.python.org/downloads/"
  },
  "python3.11+": {
    label: "Python 3.11+",
    url: "https://www.python.org/downloads/"
  },
  "nodejs18+": {
    label: "Node.js 18+",
    url: "https://nodejs.org/download/"
  },
  git: {
    label: "Git",
    url: "https://git-scm.com/downloads"
  },
  "pwsh7+": {
    label: "Powershell 7+ (for Windows users only)",
    url: "https://github.com/powershell/powershell"
  },
  functionscoretools: {
    label: "Azure Functions Core Tools (should be installed automatically with NPM, only install manually if the API fails to start)",
    url: "https://learn.microsoft.com/azure/azure-functions/functions-run-local?tabs=macos%2Cisolated-process%2Cnode-v4%2Cpython-v2%2Chttp-trigger%2Ccontainer-apps&pivots=programming-language-javascript"
  },
  ".net8": {
    label: ".NET 8",
    url: "https://dotnet.microsoft.com/download/dotnet/8.0"
  },
  ".net9": {
    label: ".NET 9",
    url: "https://dotnet.microsoft.com/download/dotnet/9.0"
  },
  docker: {
    label: "Docker",
    url: "https://www.docker.com/products/docker-desktop/"
  },
  "postgreSQL14+": {
    label: "PostgreSQL 14+",
    url: "https://www.postgresql.org/download/"
  },
  pgvector: {
    label: "pgvector",
    url: "https://github.com/pgvector/pgvector"
  },
  java17: {
    label: "Java 17",
    url: "https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-17"
  },
  "maven3.8.x": {
    label: "Maven 3.8.x",
    url: "https://maven.apache.org/download.cgi"
  },
  "maven": {
    label: "Maven",
    url: "https://maven.apache.org/download.cgi"
  },
  nodejs: {
    label: "Node.js",
    url: "https://nodejs.org/en/download/"
  },
  nodejs22: {
    label: "Node.js 22",
    url: "https://docs.npmjs.com/downloading-and-installing-node-js-and-npm"
  },
  "go1.18+": {
    label: "Go 1.18+",
    url: "https://go.dev/dl/"
  },
  helm: {
    label: "Helm",
    url: "https://helm.sh/docs/intro/install/"
  },
  k9s: {
    label: "K9s (optional for K8s management)",
    url: "https://k9scli.io/topics/install/"
  },
  poetry: {
    label: "Poetry",
    url: "https://pypi.org/project/poetry/"
  },
  swacli: {
    label: "SWA CLI",
    url: "https://github.com/Azure/static-web-apps-cli"
  },
  redis: {
    label: "Redis",
    url: "https://redis.io/download"
  },
  "pinecone-api": {
    label: "Pinecone API Key",
    url: "https://app.pinecone.io/-/projects/-/keys"
  },
  "odbc-driver-18": {
    label: "Microsoft ODBC Driver 18 for SQL Server",
    url: "https://learn.microsoft.com/sql/connect/odbc/download-odbc-driver-for-sql-server?view=sql-server-ver16"
  },
  "sqlcmd-windows": {
    label: "sqlcmd(ODBC-Windows)",
    url: "https://learn.microsoft.com/sql/tools/sqlcmd/sqlcmd-utility?view=sql-server-ver16&tabs=odbc%2Cwindows%2Cwindows-support&pivots=cs1-bash#download-and-install-sqlcmd"
  },
  "sqlcmd-linux": {
    label: "sqlcmd(Linux/Mac)",
    url: "https://learn.microsoft.com/sql/linux/sql-server-linux-setup-tools?view=sql-server-ver16&tabs=redhat-install"
  },

  // Language Tags

  javascript: {
    label: "JavaScript",
    description: "Template contains JavaScript app code",
    type: "Language",
    icon: "/img/ai/js.svg",
  },
  dotnetCsharp: {
    label: ".NET/C#",
    description: "Template contains .NET and/or C# app code",
    type: "Language",
    icon: "/img/ai/csharp.svg",
  },
  java: {
    label: "Java",
    description: "Template contains Java app code",
    type: "Language",
    icon: "/img/ai/java.svg",
  },
  python: {
    label: "Python",
    description: "Template contains Python app code",
    type: "Language",
    icon: "/img/ai/python.svg",
  },
  typescript: {
    label: "TypeScript",
    description: "Template contains TypeScript app code",
    type: "Language",
    icon: "/img/ai/typescript.svg",
  },
  golang: {
    label: "Go",
    description: "Template contains GoLang app code",
    type: "Language",
    icon: "/img/ai/go.svg",
  },

  // Collection Tags
  azureopenai: {
    label: "Azure OpenAI",
    description: "Template use Azure OpenAI collection",
    type: "Collection",
  },
  meta: {
    label: "Meta",
    description: "Template use Meta collection",
    type: "Collection",
  },
  mistralai: {
    label: "Mistral AI",
    description: "Template use Mistral AI collection",
    type: "Collection",
  },
  deepseek: {
    label: "DeepSeek AI",
    description: "Template use DeepSeek AI collection",
    type: "Collection",
  },

  // Model Tags
  gpt35turbo: {
    label: "GPT-3.5 Turbo",
    description: "Template use OpenAI GPT 3.5 Turbo model",
    type: "Model",
    subType: openai,
    url: "https://platform.openai.com/docs/models/gpt-3-5-turbo",
  },
  gpt4turbo: {
    label: "GPT-4 Turbo",
    description: "Template use OpenAI GPT 4 Turbo model",
    type: "Model",
    subType: openai,
    url: "https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4",
  },
  gpt4: {
    label: "GPT-4",
    description: "Template use OpenAI GPT 4 model",
    type: "Model",
    subType: openai,
    url: "https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4",
  },
  gpt4o: {
    label: "GPT-4 Omni",
    description: "Template use OpenAI GPT 4 Omni model",
    type: "Model",
    subType: openai,
    url: "https://platform.openai.com/docs/models/gpt-4o",
  },
  gpt4omini: {
    label: "GPT-4 Omni mini",
    description: "Template use OpenAI GPT 4 Omni mini small model",
    type: "Model",
    subType: openai,
    url: "https://platform.openai.com/docs/models/gpt-4o-mini",
  },
  gpt54: {
    label: "GPT-5.4",
    description: "Template use OpenAI GPT 5.4 model",
    type: "Model",
    subType: openai,
    url: "https://platform.openai.com/docs/models/gpt-5.4",
  },
  gpt52: {
    label: "GPT-5.2",
    description: "Template use OpenAI GPT 5.2 model",
    type: "Model",
    subType: openai,
    url: "https://platform.openai.com/docs/models/gpt-5.2",
  },
  "text-embedding-3-large": {
    label: "Text-Embedding-3-Large",
    description: "Template use OpenAI text embedding 3 large model",
    type: "Model",
    subType: openai,
    url: "https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models?tabs=global-standard%2Cstandard-chat-completions#embeddings",
  },
  "text-embedding-3-small": {
    label: "Text-Embedding-3-Small",
    description: "Template use OpenAI text embedding 3 small model",
    type: "Model",
    subType: openai,
    url: "https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models?tabs=global-standard%2Cstandard-chat-completions#embeddings",
  },
  "text-embedding-ada-002": {
    label: "Text-Embedding-ADA-002",
    description: "Template use OpenAI text embedding ADA 002 large model",
    type: "Model",
    subType: openai,
    url: "https://learn.microsoft.com/azure/ai-services/openai/concepts/models?tabs=python-secure#embeddings-models",
  },
  llama: {
    label: "Code Llama",
    description: "Template use Meta Code Llama model",
    type: "Model",
    subType: meta,
    url: "https://llama.meta.com/docs/model-cards-and-prompt-formats/meta-code-llama",
  },
  mistral7b: {
    label: "Mistral 7b",
    description: "Template use Mistral AI Mistral 7b model",
    type: "Model",
    subType: mistralai,
  },
  "deepseek-r1": {
    label: "DeepSeek R1",
    description: "Template use DeepSeek R1 model",
    type: "Model",
    subType: deepseek,
  },

  // Task Tags for app_type
  agent: {
    label: "Agent",
    description: "Template implements copilot that uses agent(s)",
    type: "Task",
  },
  chat: {
    label: "Interactive Chat",
    description: "Template implements interactive chat",
    type: "Task",
  },
  search: {
    label: "Guided Search",
    description: "Template implements guided search",
    type: "Task",
  },
  llmops: {
    label: "LLM Ops",
    description: "Template involves LLM Operations",
    type: "Task",
  },
  completions: {
    label: "Completions",
    description: "Template uses completions API",
    type: "Task",
  },

  // Database Tags
  "azuredb-postgreSQL": {
    label: "Azure Database for PostgreSQL",
    description: "Template architecture uses Azure Database for PostgreSQL",
    icon: "/img/ai/Azure-PostgreSQL.svg",
    url: "https://azure.microsoft.com/products/postgresql",
    type: "Database",
    productDescription: "Fully managed, intelligent, and scalable PostgreSQL.",
    category: "Databases"
  },
  "azuredb-mysql": {
    label: "Azure Database for MySQL",
    description: "Template Arquitecture uses Azure Database for MySQL",
    icon: "/img/ai/Azure-MySQL.svg",
    url: "https://learn.microsoft.com/azure/mysql/flexible-server/overview",
    productDescription: "Flexible Server is a fully managed, production-ready relational database service.",
    type: "Database",
    category: "Databases"
  },
  pinecone: {
    label: "Pinecone",
    description: "Template architecture uses Pinecone Database",
    type: "Database",
  },
  azurecosmosdb: {
    label: "Azure Cosmos DB",
    description: "Template architecture uses Azure Cosmos DB",
    icon: "/img/ai/Azure-Cosmos-DB.svg",
    url: "https://azure.microsoft.com/products/cosmos-db/",
    type: "Database",
    productDescription: "Build or modernize scalable, high-performance apps.",
    category: "Databases"
  },
  aisearch: {
    label: "Azure AI Search",
    description: "Template architecture uses Azure AI Search",
    icon: "/img/ai/Azure-AI-Search.svg",
    url: "https://azure.microsoft.com/products/ai-services/ai-search",
    type: "Database",
    productDescription: "Enterprise scale search for app development.",
    category: "AI + Machine Learning, Mobile, Web"
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

  // ---- Azure Services
  appinsights: {
    label: "Azure Application Insights",
    description: "Template architecture uses Azure Application Insights",
    icon: "/img/ai/Azure-Application-Insights.svg",
    url: "https://learn.microsoft.com/azure/azure-monitor/app/app-insights-overview",
    type: "Service",
  },
  loganalytics: {
    label: "Azure Log Analytics",
    description: "Template architecture uses Azure Log Analytics",
    icon: "/img/ai/Azure-Log-Analytics.svg",
    url: "https://learn.microsoft.com/azure/azure-monitor/logs/log-analytics-overview",
    type: "Service",
  },
  appservice: {
    label: "Azure App Service",
    description: "Template architecture uses Azure App Service",
    icon: "/img/ai/Azure-App-Service.svg",
    url: "https://azure.microsoft.com/products/app-service",
    type: "Service",
    productDescription: "Quickly create powerful cloud apps for web and mobile.",
    category: "Compute"
  },
  monitor: {
    label: "Azure Monitor",
    description: "Template architecture uses Azure Monitor Service",
    icon: "/img/ai/Azure-Monitor.svg",
    url: "https://azure.microsoft.com/products/monitor",
    type: "Service",
    productDescription: "Full observability into your applications, infrastructure, and network.",
    category: "DevOps"
  },
  keyvault: {
    label: "Azure Key Vault",
    description: "Template architecture uses Azure Key Vault",
    icon: "/img/ai/Azure-Key-Vault.svg",
    url: "https://azure.microsoft.com/products/key-vault",
    type: "Service",
    productDescription: "Safeguard and maintain control of keys and other secrets.",
    category: "Security"
  },
  aca: {
    label: "Azure Container Apps",
    description: "Template architecture uses Azure Container Apps",
    icon: "/img/ai/Azure-Container-Apps.svg",
    url: "https://azure.microsoft.com/products/container-apps",
    type: "Service",
    productDescription: "Build and deploy modern apps and microservices using serverless containers.",
    category: "Compute"
  },
  functions: {
    label: "Azure Functions",
    description: "Template architecture uses Azure Functions",
    icon: "/img/ai/Azure-Function.svg",
    url: "https://azure.microsoft.com/products/functions",
    type: "Service",
    productDescription: "Execute event-driven serverless code functions with an end-to-end development experience.",
    category: "Compute"
  },
  blobstorage: {
    label: "Azure Blob Storage",
    description: "Template architecture uses Azure Blob Storage",
    icon: "/img/ai/Azure-Storage.svg",
    url: "https://azure.microsoft.com/products/storage/blobs",
    type: "Service",
    productDescription: "Massively scalable and secure object storage.",
    category: "Storage"
  },
  swa: {
    label: "Azure Static Web Apps",
    description: "Template architecture uses Azure Static Web Apps",
    icon: "/img/ai/Azure-Static-Web-Apps.svg",
    url: "https://azure.microsoft.com/products/app-service/static",
    type: "Service",
    productDescription: "Streamlined full-stack development from source code to global high availability.",
    category: "Compute"
  },
  servicebus: {
    label: "Azure Service Bus",
    description: "Template architecture uses Azure Service Bus",
    icon: "/img/ai/Azure-Service-Bus.svg",
    url: "https://azure.microsoft.com/products/service-bus",
    type: "Service",
  },
  vnets: {
    label: "Azure Virtual Networks (VNET)",
    description: "Template architecture uses Azure Virtual Networks",
    icon: "/img/ai/Azure-Virtual-Networks.svg",
    url: "https://azure.microsoft.com/products/virtual-network",
    type: "Service",
    productDescription: "Create your own private network infrastructure in the cloud.",
    category: "Networking"
  },
  openai: {
    label: "Azure OpenAI Service",
    description: "Template architecture uses Azure OpenAI Service",
    icon: "/img/ai/Azure-OpenAI-Service.svg",
    url: "https://azure.microsoft.com/products/ai-services/openai-service",
    type: "Service",
    productDescription: "Apply advanced coding and language models to a variety of use cases.",
    category: "AI + Machine Learning"
  },
  azureaiservice: {
    label: "Azure AI Services",
    description: "Template architecture uses Azure AI Services",
    icon: "/img/ai/Azure-AI-Studio.svg",
    url: "https://azure.microsoft.com/solutions/ai",
    type: "Service",
    productDescription: "Add cognitive capabilities to apps with APIs and AI services.",
    category: "Mobile"
  },
  apim: {
    label: "Azure API Management",
    description: "Template architecture uses Azure API Management",
    icon: "/img/ai/Azure-API-Management.svg",
    url: "https://azure.microsoft.com/products/api-management",
    type: "Service",
    productDescription: "Publish APIs to developers, partners, and employees securely and at scale.",
    category: "Integration/Internet of Things/Mobile/Web"
  },
  aks: {
    label: "Azure Kubernetes Service",
    description: "Template architecture uses Azure Kubernetes Service",
    icon: "/img/ai/Azure-Kubernetes-Service.svg",
    url: "https://azure.microsoft.com/products/kubernetes-service",
    type: "Service",
    productDescription: "Deploy and scale containers on managed Kubernetes.",
    category: "Compute/Containers"
  },
  azurecdn: {
    label: "Azure Content Delivery Network",
    description: "Template architecture uses Azure Content Delivery Network",
    icon: "/img/ai/Azure-Front-Door-And-CDN.svg",
    url: "https://azure.microsoft.com/products/cdn",
    type: "Service",
    productDescription: "Fast, reliable content delivery network with global reach.",
    category: "Media/Networking/Web"
  },
  frontdoor: {
    label: "Azure Front Door",
    description: "Template architecture uses Azure Front Door",
    icon: "/img/ai/Azure-Front-Door-And-CDN.svg",
    url: "https://azure.microsoft.com/products/frontdoor",
    type: "Service",
  },
  grafana: {
    label: "Azure Managed Grafana",
    description: "Template architecture uses Azure Managed Grafana",
    icon: "/img/ai/Azure-Managed-Grafana.svg",
    url: "https://azure.microsoft.com/products/managed-grafana",
    type: "Service",
  },
  azurespringapps: {
    label: "Azure Spring Apps",
    description: "Template architecture uses Azure Spring Apps",
    icon: "/img/ai/Azure-Spring-Apps.svg",
    url: "https://azure.microsoft.com/products/spring-apps",
    type: "Service",
  },
  rediscache: {
    label: "Azure Cache for Redis",
    description: "Template architecture uses Azure Cache for Redis",
    icon: "/img/ai/Azure-Cache-for-Redis.svg",
    url: "https://azure.microsoft.com/products/cache",
    type: "Service",
  },
  agw: {
    label: "Azure Application Gateway",
    description: "Template architecture uses Azure Application Gateway",
    icon: "/img/ai/Azure-Application-Gateway.svg",
    url: "https://azure.microsoft.com/products/application-gateway",
    type: "Service",
  },
  azurebot: {
    label: "Azure AI Bot Service",
    description: "Template architecture uses Azure AI Bot Service",
    icon: "/img/ai/Azure-AI-Bot-Services.svg",
    url: "https://azure.microsoft.com/products/ai-services/ai-bot-service",
    type: "Service",
  },
  ade: {
    label: "Azure Deployment Environments",
    description: "Template architecture uses Azure Deployment Environments",
    icon: "/img/ai/Azure-Deployment-Environments.svg",
    url: "https://azure.microsoft.com/products/deployment-environments",
    type: "Service",
  },
  eventhub: {
    label: "Azure Event Hubs",
    description: "Template architecture uses Azure Event Hubs",
    icon: "/img/ai/Azure-Event-Hubs.svg",
    url: "https://azure.microsoft.com/products/event-hubs",
    type: "Service",
    productDescription: "Receive telemetry from millions of devices.",
    category: "Analytics"
  },
  azurestorage: {
    label: "Azure Storage",
    description: "Template architecture uses Azure Storage",
    icon: "/img/ai/Azure-Storage.svg",
    url: "https://azure.microsoft.com/products/storage",
    type: "Service",
  },
  azureappconfig: {
    label: "Azure App Configuration",
    description: "Template architecture uses Azure App Configuration",
    icon: "/img/ai/Azure-App-Configuration.svg",
    url: "https://azure.microsoft.com/products/app-configuration",
    type: "Service",
    productDescription: "Fast, scalable parameter storage for app configuration.",
    category: "Containers/Developer tools/Mobile/Security/Web"
  },
  aifoundry: {
    label: "Microsoft Foundry",
    description: "Template architecture uses Microsoft Foundry",
    icon: "/img/ai/Azure-AI-Studio.svg",
    url: "https://azure.microsoft.com/products/ai-studio",
    type: "Service",
    productDescription: "The AI app and agent factory",
    category: "AI + Machine Learning"
  },
  apicenter: {
    label: "Azure API Center",
    description: "Template architecture uses Azure API Center",
    icon: "/img/ai/Azure-API-Center.svg",
    url: "https://learn.microsoft.com/azure/api-center/overview",
    type: "Service",
  },
  eventgrid: {
    label: "Azure Event Grid",
    description: "Template architecture uses Azure Event Grid",
    icon: "/img/ai/Azure-Event-Grid.svg",
    url: "https://learn.microsoft.com/azure/event-grid/overview",
    type: "Service",
  },
  diagnosticsettings: {
    label: "Azure Diagnostic Settings",
    description: "Template architecture uses Azure Diagnostic Settings",
    icon: "/img/ai/Azure-Diagnostic-Settings.svg",
    url: "https://learn.microsoft.com/azure/azure-monitor/essentials/diagnostic-settings",
    type: "Service",
  },
  logicapps: {
    label: "Azure Logic Apps",
    description: "Template architecture uses Azure Logic Apps",
    icon: "/img/ai/Azure-Logic-Apps.svg",
    url: "https://learn.microsoft.com/azure/logic-apps/logic-apps-overview",
    type: "Service",
  },
  managedidentity: {
    label: "Azure Managed Identities",
    description: "Template architecture uses Azure Managed Identities",
    icon: "/img/ai/Azure-Managed-Identities.svg",
    url: "https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview",
    type: "Service",
  },
  serviceprincipal: {
    label: "Azure Service Principal",
    description: "Template architecture uses Azure Service Principal",
    icon: "/img/ai/Azure-Service-Principal.svg",
    url: "https://learn.microsoft.com/entra/identity-platform/app-objects-and-service-principals",
    type: "Service",
  },
  azuredatafactory: {
    label: "Azure Data Factory",
    description: "Template architecture uses Azure Data Factory",
    icon: "/img/ai/Azure-Data-Factory.svg",
    url: "https://learn.microsoft.com/azure/data-factory/introduction",
    type: "Service",
  },
  azuresignalr: {
    label: "Azure SignalR",
    description: "Template architecture uses Azure SignalR",
    icon: "/img/ai/Azure-SignalR.svg",
    url: "https://learn.microsoft.com/aspnet/signalr/overview/getting-started/introduction-to-signalr",
    type: "Service",
  },
  purview: {
    label: "Azure Purview",
    description: "Template architecture uses Azure Purview",
    icon: "/img/ai/Azure-Purview.svg",
    url: "https://azure.microsoft.com/products/purview",
    type: "Service",
    productDescription: "Govern, protect, and manage your data estate.",
    category: "Analytics/Management and governance"
  },
  fabric: {
    label: "Microsoft Fabric",
    description: "Template architecture uses Microsoft Fabric",
    icon: "/img/ai/Azure-Microsoft-Fabric.svg",
    url: "https://www.microsoft.com/microsoft-fabric",
    type: "Service",
    productDescription: "Reshape how everyone accesses, manages, and acts on data and insights by connecting every data source and analytics service together—on a single, AI-powered platform.",
    category: "Analytics"
  },

  // MCP Tags
  "mcp-client": {
    label: "MCP Client",
    description: "Template architecture uses MCP Client",
    url: "https://docs.anthropic.com/en/docs/mcp"
  },
  "mcp-server": {
    label: "MCP Server",
    description: "Template architecture uses MCP Server",
    url: "https://docs.anthropic.com/en/docs/mcp"
  },
};

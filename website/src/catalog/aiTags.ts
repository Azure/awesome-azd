/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export type Tag = {
  label: string;
  type?: string;
  url?: string;
};

export const Tags = {
  "featured": {
    "label": "Featured Template"
  },
  "powershell": {
    "label": "PowerShell",
    "type": "Language"
  },
  "nodejslts": {
    "label": "Node.js LTS",
    "url": "https://nodejs.org/"
  },
  "nodejs20": {
    "label": "Node.js 20",
    "url": "https://nodejs.org/"
  },
  "azurite": {
    "label": "Azurite",
    "url": "https://github.com/Azure/Azurite"
  },
  "azd": {
    "label": "Azure Developer CLI (azd)",
    "url": "https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd?tabs=winget-windows%2Cbrew-mac%2Cscript-linux&pivots=os-windows"
  },
  "azcli": {
    "label": "Azure CLI",
    "url": "https://learn.microsoft.com/cli/azure/"
  },
  "python3.9-3.11": {
    "label": "Python 3.9, 3.10, or 3.11",
    "url": "https://www.python.org/downloads/"
  },
  "python3.9+": {
    "label": "Python 3.9+",
    "url": "https://www.python.org/downloads/"
  },
  "python3.10+": {
    "label": "Python 3.10+",
    "url": "https://www.python.org/downloads/"
  },
  "python3.11+": {
    "label": "Python 3.11+",
    "url": "https://www.python.org/downloads/"
  },
  "nodejs18+": {
    "label": "Node.js 18+",
    "url": "https://nodejs.org/download/"
  },
  "git": {
    "label": "Git",
    "url": "https://git-scm.com/downloads"
  },
  "pwsh7+": {
    "label": "Powershell 7+ (for Windows users only)",
    "url": "https://github.com/powershell/powershell"
  },
  "functionscoretools": {
    "label": "Azure Functions Core Tools (should be installed automatically with NPM, only install manually if the API fails to start)",
    "url": "https://learn.microsoft.com/azure/azure-functions/functions-run-local?tabs=macos%2Cisolated-process%2Cnode-v4%2Cpython-v2%2Chttp-trigger%2Ccontainer-apps&pivots=programming-language-javascript"
  },
  ".net8": {
    "label": ".NET 8",
    "url": "https://dotnet.microsoft.com/download/dotnet/8.0"
  },
  ".net9": {
    "label": ".NET 9",
    "url": "https://dotnet.microsoft.com/download/dotnet/9.0"
  },
  "docker": {
    "label": "Docker",
    "url": "https://www.docker.com/products/docker-desktop/"
  },
  "postgreSQL14+": {
    "label": "PostgreSQL 14+",
    "url": "https://www.postgresql.org/download/"
  },
  "pgvector": {
    "label": "pgvector",
    "url": "https://github.com/pgvector/pgvector"
  },
  "java17": {
    "label": "Java 17",
    "url": "https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-17"
  },
  "maven3.8.x": {
    "label": "Maven 3.8.x",
    "url": "https://maven.apache.org/download.cgi"
  },
  "maven": {
    "label": "Maven",
    "url": "https://maven.apache.org/download.cgi"
  },
  "nodejs": {
    "label": "Node.js",
    "url": "https://nodejs.org/en/download/"
  },
  "nodejs22": {
    "label": "Node.js 22",
    "url": "https://docs.npmjs.com/downloading-and-installing-node-js-and-npm"
  },
  "go1.18+": {
    "label": "Go 1.18+",
    "url": "https://go.dev/dl/"
  },
  "helm": {
    "label": "Helm",
    "url": "https://helm.sh/docs/intro/install/"
  },
  "k9s": {
    "label": "K9s (optional for K8s management)",
    "url": "https://k9scli.io/topics/install/"
  },
  "poetry": {
    "label": "Poetry",
    "url": "https://pypi.org/project/poetry/"
  },
  "swacli": {
    "label": "SWA CLI",
    "url": "https://github.com/Azure/static-web-apps-cli"
  },
  "redis": {
    "label": "Redis",
    "url": "https://redis.io/download"
  },
  "pinecone-api": {
    "label": "Pinecone API Key",
    "url": "https://app.pinecone.io/-/projects/-/keys"
  },
  "odbc-driver-18": {
    "label": "Microsoft ODBC Driver 18 for SQL Server",
    "url": "https://learn.microsoft.com/sql/connect/odbc/download-odbc-driver-for-sql-server?view=sql-server-ver16"
  },
  "sqlcmd-windows": {
    "label": "sqlcmd(ODBC-Windows)",
    "url": "https://learn.microsoft.com/sql/tools/sqlcmd/sqlcmd-utility?view=sql-server-ver16&tabs=odbc%2Cwindows%2Cwindows-support&pivots=cs1-bash#download-and-install-sqlcmd"
  },
  "sqlcmd-linux": {
    "label": "sqlcmd(Linux/Mac)",
    "url": "https://learn.microsoft.com/sql/linux/sql-server-linux-setup-tools?view=sql-server-ver16&tabs=redhat-install"
  },
  "javascript": {
    "label": "JavaScript",
    "type": "Language"
  },
  "go": {
    "label": "Go",
    "type": "Language"
  },
  "golang": {
    "label": "Go",
    "type": "Language"
  },
  "dotnetCsharp": {
    "label": ".NET/C#",
    "type": "Language"
  },
  "java": {
    "label": "Java",
    "type": "Language"
  },
  "python": {
    "label": "Python",
    "type": "Language"
  },
  "typescript": {
    "label": "TypeScript",
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
  "azuredb-postgreSQL": {
    "label": "Azure Database for PostgreSQL",
    "type": "Database",
    "url": "https://azure.microsoft.com/products/postgresql"
  },
  "azuredb-mySQL": {
    "label": "Azure Database for MySQL",
    "type": "Database",
    "url": "https://learn.microsoft.com/azure/mysql/flexible-server/overview"
  },
  "azuredb-mysql": {
    "label": "Azure Database for MySQL",
    "type": "Database",
    "url": "https://learn.microsoft.com/azure/mysql/flexible-server/overview"
  },
  "pinecone": {
    "label": "Pinecone",
    "type": "Database"
  },
  "cosmosdb": {
    "label": "Azure Cosmos DB",
    "type": "Database",
    "url": "https://azure.microsoft.com/products/cosmos-db/"
  },
  "azurecosmosdb": {
    "label": "Azure Cosmos DB",
    "type": "Database",
    "url": "https://azure.microsoft.com/products/cosmos-db/"
  },
  "aisearch": {
    "label": "Azure AI Search",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/ai-services/ai-search"
  },
  "bicep": {
    "label": "Bicep",
    "type": "Infrastructure as Code"
  },
  "terraform": {
    "label": "Terraform",
    "type": "Infrastructure as Code"
  },
  "appinsights": {
    "label": "Azure Application Insights",
    "type": "Service",
    "url": "https://learn.microsoft.com/azure/azure-monitor/app/app-insights-overview"
  },
  "loganalytics": {
    "label": "Azure Log Analytics",
    "type": "Service",
    "url": "https://learn.microsoft.com/azure/azure-monitor/logs/log-analytics-overview"
  },
  "appservice": {
    "label": "Azure App Service",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/app-service"
  },
  "monitor": {
    "label": "Azure Monitor",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/monitor"
  },
  "keyvault": {
    "label": "Azure Key Vault",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/key-vault"
  },
  "aca": {
    "label": "Azure Container Apps",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/container-apps"
  },
  "functions": {
    "label": "Azure Functions",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/functions"
  },
  "blobstorage": {
    "label": "Azure Blob Storage",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/storage/blobs"
  },
  "swa": {
    "label": "Azure Static Web Apps",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/app-service/static"
  },
  "servicebus": {
    "label": "Azure Service Bus",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/service-bus"
  },
  "vnets": {
    "label": "Azure Virtual Networks (VNET)",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/virtual-network"
  },
  "privateEndpoints": {
    "label": "Azure Private Endpoints",
    "type": "Service",
    "url": "https://learn.microsoft.com/azure/private-link/private-endpoint-overview"
  },
  "openai": {
    "label": "Azure OpenAI Service",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/ai-services/openai-service"
  },
  "azureopenai": {
    "label": "Azure OpenAI Service",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/ai-services/openai-service"
  },
  "azureai": {
    "label": "Foundry Tools",
    "type": "Service",
    "url": "https://azure.microsoft.com/en-us/products/ai-foundry/tools/"
  },
  "azureaiservice": {
    "label": "Foundry Tools",
    "type": "Service",
    "url": "https://azure.microsoft.com/en-us/products/ai-foundry/tools/"
  },
  "speechservice": {
    "label": "Azure Speech Services",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/ai-services/ai-speech"
  },
  "apim": {
    "label": "Azure API Management",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/api-management"
  },
  "aks": {
    "label": "Azure Kubernetes Service",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/kubernetes-service"
  },
  "azurecdn": {
    "label": "Azure Content Delivery Network",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/cdn"
  },
  "frontdoor": {
    "label": "Azure Front Door",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/frontdoor"
  },
  "grafana": {
    "label": "Azure Managed Grafana",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/managed-grafana"
  },
  "azurespringapps": {
    "label": "Azure Spring Apps",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/spring-apps"
  },
  "rediscache": {
    "label": "Azure Cache for Redis",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/cache"
  },
  "agw": {
    "label": "Azure Application Gateway",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/application-gateway"
  },
  "azurebot": {
    "label": "Azure AI Bot Service",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/ai-services/ai-bot-service"
  },
  "ade": {
    "label": "Azure Deployment Environments",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/deployment-environments"
  },
  "eventhub": {
    "label": "Azure Event Hubs",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/event-hubs"
  },
  "azurestorage": {
    "label": "Azure Storage",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/storage"
  },
  "azureappconfig": {
    "label": "Azure App Configuration",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/app-configuration"
  },
  "aifoundry": {
    "label": "Microsoft Foundry",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/ai-studio"
  },
  "apicenter": {
    "label": "Azure API Center",
    "type": "Service",
    "url": "https://learn.microsoft.com/azure/api-center/overview"
  },
  "eventgrid": {
    "label": "Azure Event Grid",
    "type": "Service",
    "url": "https://learn.microsoft.com/azure/event-grid/overview"
  },
  "diagnosticsettings": {
    "label": "Azure Diagnostic Settings",
    "type": "Service",
    "url": "https://learn.microsoft.com/azure/azure-monitor/essentials/diagnostic-settings"
  },
  "logicapps": {
    "label": "Azure Logic Apps",
    "type": "Service",
    "url": "https://learn.microsoft.com/azure/logic-apps/logic-apps-overview"
  },
  "managedidentity": {
    "label": "Azure Managed Identities",
    "type": "Service",
    "url": "https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview"
  },
  "serviceprincipal": {
    "label": "Azure Service Principal",
    "type": "Service",
    "url": "https://learn.microsoft.com/entra/identity-platform/app-objects-and-service-principals"
  },
  "azuredatafactory": {
    "label": "Azure Data Factory",
    "type": "Service",
    "url": "https://learn.microsoft.com/azure/data-factory/introduction"
  },
  "azuresignalr": {
    "label": "Azure SignalR",
    "type": "Service",
    "url": "https://learn.microsoft.com/aspnet/signalr/overview/getting-started/introduction-to-signalr"
  },
  "purview": {
    "label": "Azure Purview",
    "type": "Service",
    "url": "https://azure.microsoft.com/products/purview"
  },
  "fabric": {
    "label": "Microsoft Fabric",
    "type": "Service",
    "url": "https://www.microsoft.com/microsoft-fabric"
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

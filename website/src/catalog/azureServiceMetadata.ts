/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export type AzureServiceMetadata = {
  description: string;
  label?: string;
  url?: string;
  icon?: string;
  darkModeIcon?: string;
};

export const azureServiceMetadata: Record<
  string,
  AzureServiceMetadata
> = {
  aca: {
    description:
      "Build and deploy modern apps and microservices using serverless containers.",
  },
  ade: {
    description:
      "Quickly spin up app infrastructure environments with project-based templates.",
  },
  agw: {
    description:
      "Build secure, scalable, highly available web front ends in Azure.",
  },
  aifoundry: {
    label: "Microsoft Foundry",
    description: "The AI app and agent factory.",
    url: "https://azure.microsoft.com/products/ai-foundry",
  },
  aisearch: {
    description: "Enterprise scale search for app development.",
  },
  aks: {
    description: "Deploy and scale containers on managed Kubernetes.",
  },
  apicenter: {
    description:
      "Centralize and track APIs across your organization for discovery, reuse, and governance.",
  },
  apim: {
    description:
      "Publish APIs to developers, partners, and employees securely and at scale.",
  },
  appinsights: {
    description:
      "Monitor the performance, availability, and usage of web applications in real time.",
  },
  appservice: {
    description:
      "Quickly create powerful cloud apps for web and mobile.",
  },
  avset: {
    description:
      "Increase application availability by distributing virtual machines across fault and update domains.",
  },
  azureai: {
    label: "Azure AI Service",
    description:
      "Build cutting-edge, market-ready AI applications with customizable tools, APIs, and models.",
    url: "https://azure.microsoft.com/en-us/solutions/ai/",
  },
  azureaiservice: {
    label: "Azure AI Service",
    description:
      "Build cutting-edge, market-ready AI applications with customizable tools, APIs, and models.",
    url: "https://azure.microsoft.com/en-us/solutions/ai/",
  },
  azureappconfig: {
    description: "Fast, scalable parameter storage for app configuration.",
  },
  azurebot: {
    description: "Create bots and connect them across channels.",
  },
  azurecdn: {
    description:
      "Fast, reliable content delivery network with global reach.",
  },
  azurecosmosdb: {
    description: "Build or modernize scalable, high-performance apps.",
  },
  azuredatafactory: {
    description: "Hybrid data integration at enterprise scale, made easy.",
  },
  "azuredb-mysql": {
    label: "Azure Database for MySQL",
    description:
      "Modernize with a fully managed, scalable MySQL database.",
  },
  "azuredb-postgresql": {
    label: "Azure Database for PostgreSQL",
    description:
      "Innovate with a fully managed, intelligent, and scalable PostgreSQL database.",
  },
  azuresignalr: {
    label: "Azure SignalR Service",
    description: "Add real-time web functionalities easily.",
    icon: "./img/Azure-SignalR.svg",
    url: "https://azure.microsoft.com/en-us/products/signalr-service/",
  },
  azurespringapps: {
    label: "Azure Spring Apps",
    description:
      "Build and deploy Spring Boot applications with a fully managed service from Microsoft and VMware.",
    icon: "./img/Azure-Spring-Apps.svg",
    url: "https://azure.microsoft.com/en-us/products/spring-apps/",
  },
  azuresql: {
    description:
      "Build apps that scale with a managed and intelligent SQL database in the cloud.",
  },
  azurestorage: {
    description:
      "Secure, scalable cloud storage for your data, apps, and workloads.",
    url: "https://azure.microsoft.com/en-us/products/category/storage",
  },
  backup: {
    description:
      "Simplify data protection with built-in backup management at scale.",
  },
  bastion: {
    description:
      "Fully managed service that helps secure remote access to your virtual machines.",
  },
  blobstorage: {
    description: "Massively scalable and secure object storage.",
  },
  cosmosdb: {
    description: "Build or modernize scalable, high-performance apps.",
  },
  diagnosticsettings: {
    description:
      "Collect platform logs and metrics and route them to supported destinations.",
  },
  eventgrid: {
    description: "Reliable event delivery at massive scale.",
  },
  eventhub: {
    description: "Receive telemetry from millions of devices.",
  },
  fabric: {
    description:
      "Connect every data source and analytics service on a single, AI-powered platform.",
  },
  frontdoor: {
    description:
      "Modern cloud CDN that delivers optimized experiences to your users anywhere.",
  },
  functions: {
    description:
      "Execute event-driven serverless code functions with an end-to-end development experience.",
  },
  grafana: {
    description:
      "Deploy Grafana dashboards as a fully managed Azure service.",
  },
  hyperv: {
    description: "Discover, assess, and migrate Hyper-V workloads to Azure.",
  },
  keyvault: {
    description: "Safeguard and maintain control of keys and other secrets.",
  },
  loadbalancer: {
    description:
      "Deliver high availability and network performance to your apps.",
  },
  loadtesting: {
    description: "Optimize app performance with high-scale load testing.",
    url: "https://azure.microsoft.com/en-us/products/app-testing/",
  },
  loganalytics: {
    description:
      "Analyze and act on telemetry collected in Azure Monitor Logs.",
  },
  logicapps: {
    description: "Automate the access and use of data across clouds.",
  },
  managedidentity: {
    description:
      "Give Azure resources an automatically managed identity in Microsoft Entra ID.",
  },
  monitor: {
    description:
      "Full observability into your applications, infrastructure, and network.",
  },
  openai: {
    description:
      "Apply advanced coding and language models to a variety of use cases.",
  },
  privateendpoints: {
    description:
      "Connect privately and securely to Azure services from your virtual network.",
  },
  privatelink: {
    description:
      "Private access to services hosted on the Azure platform, keeping your data on the Microsoft network.",
  },
  purview: {
    label: "Microsoft Purview",
    description: "Govern, protect, and manage your data estate.",
    url: "https://www.microsoft.com/en-us/security/business/risk-management/microsoft-purview-data-governance",
  },
  recoveryvault: {
    description:
      "Keep your business running with built-in disaster recovery service.",
    url: "https://azure.microsoft.com/en-us/products/site-recovery/",
  },
  rediscache: {
    description:
      "Accelerate app performance with a fully managed, scalable, in-memory solution.",
    url: "https://azure.microsoft.com/en-us/products/managed-redis",
  },
  sentinel: {
    label: "Microsoft Sentinel",
    description:
      "Cloud-native SIEM and intelligent security analytics.",
  },
  servicebus: {
    description: "Connect across private and public cloud environments.",
  },
  serviceprincipal: {
    description:
      "Represent an application or automation identity in a Microsoft Entra tenant.",
  },
  speechservice: {
    description:
      "Energize your apps and agents with prebuilt, customizable, multilingual speech AI models.",
    url: "https://azure.microsoft.com/en-us/products/ai-foundry/tools/speech/",
  },
  swa: {
    description:
      "Streamlined full-stack development from source code to global high availability.",
  },
  trafficmgr: {
    description:
      "Route incoming traffic for high performance and availability.",
  },
  virtualmachine: {
    label: "Azure Virtual Machines",
    description: "Provision Windows and Linux VMs in seconds.",
    url: "https://azure.microsoft.com/en-us/products/virtual-machines",
  },
  vmsqlserver: {
    description:
      "Migrate SQL Server workloads to the cloud at lower total cost of ownership (TCO).",
  },
  vnets: {
    description:
      "Create your own private network infrastructure in the cloud.",
  },
};

export function getAzureServiceMetadata(
  id: string,
): AzureServiceMetadata | undefined {
  return azureServiceMetadata[id.toLowerCase()];
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export interface ServicePageConfig {
  serviceTag: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  quickStart: { command: string; description: string }[];
  resources: { title: string; url: string; description: string }[];
}

export type ServicePageDefinition = {
  path: string;
  config: ServicePageConfig;
};

export const servicePages: ServicePageDefinition[] = [
  {
    path: "services/azure-functions",
    config: {
      serviceTag: "functions",
      title: "Azure Functions",
      tagline: "Event-driven serverless compute for any workload",
      description:
        "Azure Functions is a serverless compute service that lets you run event-triggered code without managing infrastructure. Build APIs, process data, integrate systems, and respond to events — all with automatic scaling and pay-per-execution pricing.",
      icon: "/img/Azure-Function.svg",
      quickStart: [
        {
          description: "Install the Azure Developer CLI",
          command: "winget install microsoft.azd",
        },
        {
          description: "Initialize from a Functions template",
          command: "azd init --template remote-mcp-functions-typescript",
        },
        {
          description: "Deploy to Azure",
          command: "azd up",
        },
      ],
      resources: [
        {
          title: "Azure Functions documentation",
          url: "https://learn.microsoft.com/azure/azure-functions/functions-overview",
          description:
            "Official docs covering triggers, bindings, and deployment options.",
        },
        {
          title: "Durable Functions",
          url: "https://learn.microsoft.com/azure/azure-functions/durable/durable-functions-overview",
          description:
            "Write stateful functions in a serverless environment with orchestration patterns.",
        },
        {
          title: "Functions with azd",
          url: "https://learn.microsoft.com/azure/developer/azure-developer-cli/azure-functions",
          description:
            "Learn how to use azd to scaffold, develop, and deploy Azure Functions apps.",
        },
        {
          title: "Serverless APIs tutorial",
          url: "https://learn.microsoft.com/azure/azure-functions/functions-create-serverless-api",
          description:
            "Build and deploy a serverless REST API using Azure Functions.",
        },
      ],
    },
  },
  {
    path: "services/container-apps",
    config: {
      serviceTag: "aca",
      title: "Azure Container Apps",
      tagline: "Get started quickly with ready-to-deploy templates",
      description:
        "Browse templates for microservices and containerized applications on Azure Container Apps — a serverless platform with built-in autoscaling, Dapr integration, and KEDA event-driven scaling. Pick a template and deploy.",
      icon: "/img/Azure-Container-Apps.svg",
      quickStart: [
        {
          description: "Install the Azure Developer CLI",
          command: "winget install microsoft.azd",
        },
        {
          description: "Initialize from a Container Apps template",
          command: "azd init --template azd-get-started-with-ai-agents",
        },
        {
          description: "Deploy to Azure",
          command: "azd up",
        },
      ],
      resources: [
        {
          title: "Container Apps documentation",
          url: "https://learn.microsoft.com/azure/container-apps/overview",
          description:
            "Official docs covering concepts, quickstarts, and how-to guides.",
        },
        {
          title: "Microservices with Dapr",
          url: "https://learn.microsoft.com/azure/container-apps/dapr-overview",
          description:
            "Build distributed applications using Dapr building blocks on Container Apps.",
        },
        {
          title: "Scaling and performance",
          url: "https://learn.microsoft.com/azure/container-apps/scale-app",
          description:
            "Configure autoscaling rules based on HTTP traffic, CPU, memory, or custom metrics.",
        },
        {
          title: "azd Container Apps templates",
          url: "https://github.com/topics/azd-templates",
          description:
            "Browse community and Microsoft-authored Container Apps templates on GitHub.",
        },
      ],
    },
  },
];

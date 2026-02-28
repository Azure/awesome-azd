/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import ServiceLandingPage from "@site/src/components/ServiceLandingPage";

const config = {
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
      command: "azd init --template todo-nodejs-mongo-swa-func",
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
      description: "Official docs covering triggers, bindings, and deployment options.",
    },
    {
      title: "Durable Functions",
      url: "https://learn.microsoft.com/azure/azure-functions/durable/durable-functions-overview",
      description: "Write stateful functions in a serverless environment with orchestration patterns.",
    },
    {
      title: "Functions with azd",
      url: "https://learn.microsoft.com/azure/developer/azure-developer-cli/azure-functions",
      description: "Learn how to use azd to scaffold, develop, and deploy Azure Functions apps.",
    },
    {
      title: "Serverless APIs tutorial",
      url: "https://learn.microsoft.com/azure/azure-functions/functions-create-serverless-api",
      description: "Build and deploy a serverless REST API using Azure Functions.",
    },
  ],
};

export default function FunctionsPage() {
  return <ServiceLandingPage config={config} />;
}

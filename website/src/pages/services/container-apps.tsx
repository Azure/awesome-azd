/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import ServiceLandingPage from "@site/src/components/ServiceLandingPage";

const config = {
  serviceTag: "aca",
  title: "Azure Container Apps",
  tagline: "Deploy containerized apps without managing infrastructure",
  description:
    "Azure Container Apps lets you run microservices and containerized applications on a serverless platform. Build and deploy modern apps with autoscaling, Dapr integration, and KEDA event-driven scaling — all without managing Kubernetes clusters.",
  icon: "/img/Azure-Container-Apps.svg",
  quickStart: [
    {
      description: "Install the Azure Developer CLI",
      command: "winget install microsoft.azd",
    },
    {
      description: "Initialize from a Container Apps template",
      command: "azd init --template todo-nodejs-mongo-aca",
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
      description: "Official docs covering concepts, quickstarts, and how-to guides.",
    },
    {
      title: "Microservices with Dapr",
      url: "https://learn.microsoft.com/azure/container-apps/dapr-overview",
      description: "Build distributed applications using Dapr building blocks on Container Apps.",
    },
    {
      title: "Scaling and performance",
      url: "https://learn.microsoft.com/azure/container-apps/scale-app",
      description: "Configure autoscaling rules based on HTTP traffic, CPU, memory, or custom metrics.",
    },
    {
      title: "azd Container Apps templates",
      url: "https://github.com/topics/azd-templates",
      description: "Browse community and Microsoft-authored Container Apps templates on GitHub.",
    },
  ],
};

export default function ContainerAppsPage() {
  return <ServiceLandingPage config={config} />;
}

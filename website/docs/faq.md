---
sidebar_position: 2
title: "FAQ"
---

## What is "azd"?

The Azure Developer CLI (or `azd`) is an [open-source tool](https://aka.ms/azd) that provides higher-level, application developer-friendly commands that map to key stages in your developer workflow so that you can focus on writing application code instead of focusing on atomic operations on Azure resources.

## What is an azd template?

[Azure Developer CLI templates](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/overview?tabs=nodejs#azure-developer-cli-templates) (`azd-templates`) are _sample repositories_ created - using Azure Developer CLI defined conventions - to include the application code, tools and infrastructure code required to streamline your CI/CD pipelines. This now provides a repeatable foundation on which other teams can build, to customize, or extend, the default solution.

## How do I use an azd template?

With `azd-templates`, the path from "code to cloud" is just 3 steps:
 - Discovery = find a template
 - Deployment = `azd up` to deploy it
 - Customization = modify app code or config

:::tip READ THE DOCS
Learn more about [about getting started with azd](https://aka.ms/azd)
:::

## How do I discover templates?

There are a couple of ways to discover existing `azd-template` tagged repositories.

### 1. Using GitHub Topics
Today, you can look at the [`azd-templates` topic on GitHub](https://github.com/azure/awesome-azd) to see tagged template repositories. However, this approach does not easily let you _search_ for templates based on the services configured, or give you a visual sense of the _architecture_ enabled .

### 2. Using This Gallery
This is the challenge we are hoping to solve with the [gallery](/) site shown in this project. Each template is associated with the following:
 - architecture diagram
 - template repository
 - publication date
 - contributor identity
 - description
 - service tags (for architecture components)
 - language tags (for application code)

The Gallery provides both a **search** capability (to discover template by name) and a **filter** capability (to discover templates that match a specific and/or combination of criteria).

## How do I create templates?

The `azd template` has this file structure defined [by azd conventions](https://learn.microsoft.com/azure/developer/azure-developer-cli/make-azd-compatible?source=recommendations&pivots=azd-create#azd-conventions)

```txt
├── .devcontainer              [ For DevContainer ]
├── .github/.azdo              [ Configure GitHub workflow or Azure Pipelines ]
├── .vscode                    [ VS Code workspace configurations ]
├── infra                      [ Creates and configures Azure resources ]
│   ├── main.bicep/main.tf     [ Main infrastructure file ]
│   ├── main.parameters.json/  [ Parameters file ]
        main.tfvars.json   
├── src                        [ Contains directories for the app code ]
└── azure.yaml                 [ Describes the app and type of Azure resources]
```

The Azure Developer CLI (azd) tool helps you with the process of _creating_ the template with `azd init` as the first step, followed by creation of the `infra/` folder, updating of the `azure.yaml` file, and validation of template using `azd up` to provision and deploy resources.

:::tip READ THE DOCS
Learn more about [making your codebase `azd`compatible](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/make-azd-compatible)
:::

## How do I contribute templates?

:::info TWO WAYS TO CONTRIBUTE

You can contribute azd-templates in two contexts:
 * **For an existing idea** - matches a `helpwanted` tag
 * **For your own ideas** - provide the architecture diagram and tags.
:::

[Submit a PR + fill out the checklist](https://aka.ms/awesome-azd-contribute)

An internal team will review submissions
 - Validate that templates function as desired
 - Accept contribution - issue is closed.
 - Suggest modifications - issue stays open.

## How are templates rated?

This gallery will contain both Microsoft-authored azd-templates, and Community-contributed versions. Creating **and maintaining** templates is not a simple exercise. 

In the long term, we may add other tag options to help rate templates on other criteria (e.g., recently updated, most stars, most forks etc.)

## How do I request templates?

What if you have an architecture defined, but can't find an existing azd template to jumpstart your development? You can try to create and contribute that template as one option.

We are also considering a special `**help wanted**` tag that allows someone to contribute a template to the gallery with an architecture diagram but no associated repository. These would now be associated with _issues_ that would allow other community members to:
 - up vote the issue (as a priority)
 - create and contribute a template for it

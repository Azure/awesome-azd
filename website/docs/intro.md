---
sidebar_position: 1
title: "Contributor Guide"
---

## What is: the Azure Developer CLI?

The **Azure Developer CLI** (`azd`) is an [open-source command-line tool](https://learn.microsoft.com/azure/developer/azure-developer-cli/overview?tabs=nodejs) that _accelerates_ the developer experience building real-world applications, using complex architectures, on Azure.

With `azd`, developers get a [rich set of commands](https://learn.microsoft.com/azure/developer/azure-developer-cli/reference) that map to key stages of the developer workflow (code, build, deploy, monitor) in a manner that works _consistently_ across, azd templates, DevOps workflows and IDE.  

> Read more [about the Azure Developer CLI](https://learn.microsoft.com/azure/developer/azure-developer-cli/).

## What is: an azd template?

[Azure Developer CLI templates](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/overview?tabs=nodejs#azure-developer-cli-templates) (`azd-templates`) are _sample repositories_ created - using Azure Developer CLI defined conventions - to include the application code, tools and infrastructure code required to streamline your CI/CD pipelines. This now provides a repeatable foundation on which other teams can build, to customize, or extend, the default solution.

> Read more [about Azure Develeloper CLI templates](https://learn.microsoft.com/azure/developer/azure-developer-cli/overview?tabs=nodejs#azure-developer-cli-templates).


## How to: _use_ azd templates?

With `azd-templates`, the path from "code to cloud" is just 3 steps:
 - Discovery = find a template
 - Deployment = `azd up` to deploy it
 - Customization = modify app code or config

![Recommended azd workflow](https://learn.microsoft.com/azure/developer/azure-developer-cli/media/overview/workflow.png)

> Read more [about Getting Started with azd](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/get-started?tabs=bare-metal%2Cwindows&pivots=programming-language-nodejs)


## How to: _discover_ azd templates?

### Using GitHub Topics
Today, you can look at the [azd-templates topic on GitHub](https://github.com/azure/awesome-azd) to see tagged template repositories. However, this approach does not easily let you _search_ for templates based on the services configured, or give you a visual sense of the _architecture_ enabled .

### Using This Gallery
This is the challenge we are hoping to solve with the [Gallery](/) site shown in this project. Each template is associated with the following:
 - architecture diagram
 - template repository
 - publication date
 - contributor identity
 - description
 - service tags (for architecture components)
 - language tags (for application code)

The Gallery provides both a **search** capability (to discover template by name) and a **filter** capability (to discover templates that match a specific and/or combination of criteria).

## How to: _create_ azd templates?

The `azd template` currently has the following file structure defined [by azd conventions](https://learn.microsoft.com/azure/developer/azure-developer-cli/make-azd-compatible?source=recommendations&pivots=azd-create#azd-conventions)

```txt├── .devcontainer              [ For DevContainer ]
├── .github                    [ Configure GitHub workflow ]
├── .vscode                    [ VS Code workspace ]
├── assets                     [ Assets used by README.MD ]
├── infra                      [ Creates and configures Azure resources ]
│   ├── main.bicep             [ Main infrastructure file ]
│   ├── main.parameters.json   [ Parameters file ]
│   └── resources.bicep        [ Resources file ]
├── src                        [ Contains directories for the app code ]
└── azure.yaml                 [ Describes the app and type of Azure resources]
```

The Azure Developer CLI (azd) tool helps you with the process of _creating_ the template with `azd init` as the first step, followed by creation of the `infra/` folder, updating of the `azure.yaml` file, and validation of template using `azd up` to provision and deploy resources.

![the process to create an azd template:](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/media/make-azd-compatible/workflow.png)

> Read more [about Making Your Project an azd template](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/make-azd-compatible?source=recommendations&pivots=azd-create#azd-conventions)


## How to: _contribute_ azd templates?

:::info TWO WAYS TO CONTRIBUTE

You can contribute azd-templates in two contexts:
 * **For an existing request** - matches a `helpwanted` tag
 * **For your own projects** - you provide the architecture diagram and tags.

We manage contributions using custom issue templates 
 * Pre-defined issues for existing requests
 * Custom issue template for defining new projects
:::

The contribution process:
 - Use custom issue and submit your template details **for new templates**
 - Reply to custom issue and submit requesed details **for existing requests**
 - Share the custom issue with others to get upvotes
 - Use the issues thread to provide requested updates

An internal team will review submissions
 - Validate that templates function as desired
 - Accept contribution - issue is closed.
 - Suggest modifications - issue stays open.


## How to: _rate_ azd templates?

This gallery will contain both Microsoft-authored azd-templates, and Community-contributed versions. Creating **and maintaining** templates is not a simple exercise. 

In the short term, we'll use a `featured` tag (that we maintain) to curate and highlight a few high-quality templates for convenience. 

In the long term, we may add other tag options to help rate templates on other criteria (e.g., recently updated, most stars, most forks etc.)


## How to: _request_ azd templates?

What if you have an architecture defined, but can't find an existing azd template to jumpstart your development? You can try to create and contribute that template as one option.

We are also considering a special `**help wanted**` tag that allows someone to contribute a template to the gallery with an architecture diagram but no associated repository. These would now be associated with _issues_ that would allow other community members to:
 - vote up the issue (as a priority)
 - create and contribute a template for it

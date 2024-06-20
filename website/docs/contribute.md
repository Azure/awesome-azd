---
sidebar_position: 1
title: "Contributor Guide"
---

## We ♥️ Contributions!
`awesome-azd` is a community-friendly resource to help developer discover, create, and share, open-source `azd` templates and supporting resources for streamlining your application development and CI/CD pipelines.

## Submit a PR

### [Contribute a New Template](https://github.com/Azure/awesome-azd/compare)
Our template gallery will be at its best when our community is involved in creating and contributing new templates. 

We welcome contributions of [requested templates](https://github.com/Azure/awesome-azd/issues?q=is%3Aopen+is%3Aissue+label%3Arequested-contribution) as well as any others, subject to review. 

To submit a template:
1. Add an entry to [website/static/templates.json](https://github.com/Azure/awesome-azd/blob/main/website/static/templates.json) that includes:
    - **Template title** - A short title that reflects the local application stack that someone could use to get their application on Azure (e.g. "Containerized React Web App with Java API and MongoDB")
    - **Description** - 1-2 sentence description of the architecture (e.g. Azure services) or solution that is defined by the template.
    - **Architecture Diagram or Application Screenshot** - Used as display image for gallery card. The architecture should include all services and their connections ([example](https://github.com/Azure-Samples/todo-csharp-sql/blob/main/assets/resources.png)). You should add the image to [website/static/templates/images](https://github.com/Azure/awesome-azd/tree/main/website/static/templates/images)
    - **Link to Author's GitHub or other relevant website** - Used for attribution.
    - **Author's Name** - Name to credit on the gallery card
    - **Link to template source** - Link to the template GitHub repo
    - **Tags** - One or more [tags](https://github.com/Azure/awesome-azd/blob/main/website/src/data/tags.tsx) representing the template. Provide at least 1 tag for programming language used and at least 1 tag for Azure services integrated. Also tag the IaC provider (Bicep or Terraform). If you don't see a relevant tag for your template? Feel free to add one!
2. If the template is Microsoft-authored, we encourage you to also [publish it to learn.microsoft.com/samples](https://review.learn.microsoft.com/en-us/help/contribute/samples/process/onboarding?branch=main). 
3. Open a PR!
4. If possible, add a link to the PR in your repo where you made your app `azd` compatible to the PR description. This will help us provide feedback on your template and speed up the review process. 

If you would like to contribute a template but are not sure where to start, [making an existing project azd compatible](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/make-azd-compatible) is a great first step. Doing so consists of three main steps:
1.  Set up a new environment (with `azd init`)
2.  Add Bicep files
3.  Update azure.yaml 

### [Submit a Resource](https://github.com/Azure/awesome-azd/compare)
Did you write or find an article that helped you get started with `azd`? Or maybe you created or found a video that showed you how to create an azd template? Whatever the resource might be, we would love for you to share it with our community! Submit content you think should be included in `awesome-azd/README.md`

## Other Ways To Help 
Other than these, we always welcome feedback through a:
 - [**request a template**](https://github.com/Azure/awesome-azd/issues/new?assignees=gkulin&labels=requested-contribution&template=%F0%9F%A4%94-submit-a-template-request.md&title=%5BIdea%5D+%3Cyour-template-name%3E): if you cannot find a template with architecture that works for you-- you can submit a request for that template
    - Keep in mind, templates are made to be flexible and extensible. You can use a template's architecture and swap out the source code. For example, if you want to create a grocery list making application using Azure SQL and Azure App service, you can use the React Web App with C# API and SQL Database on Azure template and swap out the source code.
 - [**bug report**](https://github.com/Azure/awesome-azd/issues/new?assignees=&labels=&template=bug_report.md&title=): let us know if something is broken
 - [**feature request**](https://github.com/Azure/awesome-azd/issues/new?assignees=&labels=&template=feature_request.md&title=): for improvements to our awesome-azd site

## Next Steps
- Visit our [FAQ](./1-faq/1-what-is-azd.md)

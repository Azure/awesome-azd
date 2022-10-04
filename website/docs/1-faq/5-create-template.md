---
title: How do I create templates?
---

The `azd template` has this file structure defined [by azd conventions](https://learn.microsoft.com/azure/developer/azure-developer-cli/make-azd-compatible?source=recommendations&pivots=azd-create#azd-conventions)

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

:::tip READ THE DOCS
Learn more about [about Making Your Project an azd template](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/make-azd-compatible?source=recommendations&pivots=azd-create#azd-conventions)
:::

---
sidebar_position: 2
title: "Submit an Extension"
---

## Share Your Extension! 🚀

Have you created an azd extension? We'd love to feature it in our extension gallery! This guide will walk you through the simple process of getting your extension listed.

## Prerequisites

Before submitting your extension:

1. **Build your extension** following the [official extension framework documentation](https://github.com/Azure/azure-dev/blob/main/cli/azd/docs/extension-framework.md)
2. **Publish your extension** to a GitHub repository with releases
3. **Test your extension** to ensure it works correctly with `azd`

## Submission Process

### Option 1: Quick Submit (Recommended)

The easiest way to submit your extension is through our GitHub issue template:

1. **[Open a new extension submission issue](https://github.com/Azure/awesome-azd/issues/new?template=submit-extension.md&title=%5BExtension%5D+%3Cyour-extension-name%3E)**
2. Fill in the required information:
   - Extension name and namespace
   - Description
   - GitHub repository URL
   - Capabilities (custom-commands, lifecycle-events, etc.)
   - Latest version number
3. Submit the issue - we'll review and add it to the gallery!

### Option 2: Submit a Pull Request

For contributors familiar with Git, you can directly submit a PR:

1. **Fork the repository** at https://github.com/Azure/awesome-azd

2. **Add your extension** to `website/static/extensions.json`:

```json
{
  "id": "your-org.your-extension-name",
  "namespace": "your-namespace",
  "title": "Your Extension Name",
  "description": "A brief description of what your extension does (1-2 sentences)",
  "preview": "./templates/images/extension-default.png",
  "author": "Your Name or Organization",
  "authorUrl": "https://github.com/your-org",
  "source": "https://github.com/your-org/your-extension-repo",
  "tags": ["community", "featured"],
  "capabilities": [
    "custom-commands",
    "lifecycle-events"
  ],
  "latestVersion": {
    "version": "1.0.0",
    "usage": "azd your-namespace <command> [options]",
    "examples": [
      {
        "name": "example-command",
        "description": "What this command does",
        "usage": "azd your-namespace example-command"
      }
    ]
  }
}
```

3. **Open a Pull Request** with your changes

## Required Information

Your extension submission must include:

### Basic Information
- **id**: Unique identifier in format `your-org.extension-name` (e.g., "acme.azd.validator")
- **namespace**: Short command namespace used with azd (e.g., "validate")
- **title**: Human-readable display name
- **description**: Clear 1-2 sentence description of your extension's purpose

### URLs
- **authorUrl**: Link to your GitHub profile or organization
- **source**: Link to your extension's GitHub repository

### Metadata
- **tags**: Include "community" tag (we'll add "featured" if selected)
- **capabilities**: List of extension capabilities from:
  - `custom-commands` - Adds new CLI commands
  - `lifecycle-events` - Handles project/service lifecycle events
  - `service-target-provider` - Custom service deployment targets
  - `mcp-server` - Model Context Protocol server support

### Version Information
- **version**: Latest version number (semantic versioning)
- **usage**: Basic usage syntax
- **examples**: Array of usage examples showing how to use your extension

## Best Practices

### Extension Quality Guidelines

To ensure your extension provides a great experience:

1. **Clear Documentation**
   - Include a detailed README in your repository
   - Provide usage examples and common scenarios
   - Document all commands and options

2. **Versioning**
   - Follow semantic versioning (MAJOR.MINOR.PATCH)
   - Create GitHub releases for each version
   - Include release notes with changes

3. **Testing**
   - Test your extension with the latest azd version
   - Provide sample projects or test cases
   - Document any dependencies or requirements

4. **Maintenance**
   - Keep your extension updated with azd releases
   - Respond to issues and questions
   - Update the gallery listing when you release new versions

### Extension Naming

Choose clear, descriptive names:

- **Good**: `azd-cost-estimator`, `terraform-validator`, `security-scanner`
- **Avoid**: `my-extension`, `tool1`, `helper`

### Description Tips

Write concise, actionable descriptions:

- **Good**: "Validates Terraform configurations before deployment with custom rules and best practices checks."
- **Avoid**: "A really useful tool that helps with Terraform."

## After Submission

### Review Process

1. **Initial Review** (1-2 business days)
   - We verify the extension information is complete
   - Check that the repository is accessible
   - Confirm the extension follows azd conventions

2. **Testing** (2-3 business days)
   - We test the extension installation process
   - Verify basic functionality works as described
   - Check for any conflicts with existing extensions

3. **Approval** (1 business day)
   - Your extension is added to the gallery
   - You'll receive a notification when it's live

### Updating Your Extension

To update your extension listing:

1. **For version updates**: Submit an issue or PR updating the `latestVersion` field
2. **For description changes**: Submit a PR with your updates
3. **For major changes**: Create a new submission issue with updated information

## Getting Featured

Community extensions can be featured on the landing page! To be considered:

- **High Quality**: Well-documented, tested, and maintained
- **Useful**: Solves a common problem or adds significant value
- **Active**: Regular updates and responsive to issues
- **Popular**: Positive community feedback and usage

We review extensions for featuring on a monthly basis.

## Examples

### Minimal Extension Entry

```json
{
  "id": "myorg.simple-extension",
  "namespace": "simple",
  "title": "Simple Extension",
  "description": "A simple example extension for azd.",
  "author": "My Organization",
  "authorUrl": "https://github.com/myorg",
  "source": "https://github.com/myorg/azd-simple-extension",
  "tags": ["community"],
  "capabilities": ["custom-commands"],
  "latestVersion": {
    "version": "1.0.0",
    "usage": "azd simple <command>",
    "examples": []
  }
}
```

### Full-Featured Extension Entry

```json
{
  "id": "awesome-corp.cost-analyzer",
  "namespace": "cost",
  "title": "Azure Cost Analyzer",
  "description": "Analyzes and forecasts Azure deployment costs before provisioning, with detailed breakdowns by service and region.",
  "preview": "./templates/images/extension-cost-analyzer.png",
  "author": "Awesome Corp",
  "authorUrl": "https://github.com/awesome-corp",
  "source": "https://github.com/awesome-corp/azd-cost-analyzer",
  "tags": ["community", "featured"],
  "capabilities": ["custom-commands", "lifecycle-events"],
  "latestVersion": {
    "version": "2.1.0",
    "usage": "azd cost <command> [options]",
    "examples": [
      {
        "name": "estimate",
        "description": "Estimate deployment costs for current environment",
        "usage": "azd cost estimate"
      },
      {
        "name": "report",
        "description": "Generate detailed cost report with breakdown",
        "usage": "azd cost report --format pdf"
      },
      {
        "name": "compare",
        "description": "Compare costs across different environments",
        "usage": "azd cost compare dev prod"
      }
    ]
  }
}
```

## Need Help?

- **Questions?** Open a [discussion](https://github.com/Azure/awesome-azd/discussions)
- **Issues?** Report a [bug](https://github.com/Azure/awesome-azd/issues/new?template=bug_report.md)
- **Extension Development Help?** Check the [extension framework docs](https://github.com/Azure/azure-dev/blob/main/cli/azd/docs/extension-framework.md)

## Resources

- [Extension Framework Documentation](https://github.com/Azure/azure-dev/blob/main/cli/azd/docs/extension-framework.md)
- [Extension Services Reference](https://github.com/Azure/azure-dev/blob/main/cli/azd/docs/extension-framework-services.md)
- [Official Extension Registry](https://aka.ms/azd/extensions/registry)
- [Extension Registry Schema](https://github.com/Azure/azure-dev/blob/main/cli/azd/extensions/registry.schema.json)

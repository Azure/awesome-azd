---
name: "Submit an Extension"
about: Share your azd extension with the community! We'll review and add it to the gallery.
title: "[Extension] <your-extension-name>"
labels: extension-submission
assignees: ""

---

## Extension Information

### Basic Details
- **Extension Name**: 
- **Namespace** (used in commands, e.g., `azd <namespace> ...`): 
- **Description** (1-2 sentences): 
- **Author Name**: 
- **Author GitHub/Website**: 

### Repository
- **GitHub Repository URL**: 
- **Latest Version**: 
- **License**: 

### Capabilities
Select all that apply:
- [ ] Custom Commands (adds new CLI commands)
- [ ] Lifecycle Events (hooks into preprovision, prepackage, predeploy, etc.)
- [ ] Service Target Provider (custom deployment targets)
- [ ] MCP Server (Model Context Protocol support)

### Usage Examples
Provide 1-3 examples of how to use your extension:

**Example 1:**
```bash
azd <namespace> <command>
```
Description: 

**Example 2 (optional):**
```bash
azd <namespace> <command>
```
Description: 

**Example 3 (optional):**
```bash
azd <namespace> <command>
```
Description: 

## Installation Command
```bash
azd extension install <namespace>
```

## Additional Information

### Key Features (optional)
What makes your extension useful?

### Requirements (optional)
Any prerequisites or dependencies?

### Screenshots/Demo (optional)
If applicable, add screenshots or a link to a demo video.

---

## Checklist
Before submitting, please ensure:
- [ ] Extension is published to a public GitHub repository
- [ ] Repository includes a README with usage instructions
- [ ] Extension has been tested with the latest azd version
- [ ] Extension follows [azd extension framework conventions](https://github.com/Azure/azure-dev/blob/main/cli/azd/docs/extension-framework.md)
- [ ] GitHub releases are created for versions

## Next Steps
Once submitted:
1. Our team will review your extension (typically 1-2 business days)
2. We may request additional information or clarifications
3. After approval, your extension will be added to the [extension gallery](https://azure.github.io/awesome-azd/extensions/gallery)
4. You'll be notified when it's live!

Thank you for contributing to the azd community! 🎉

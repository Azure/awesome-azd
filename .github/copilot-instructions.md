# Awesome Azure Developer CLI (azd) 

Awesome azd is a Docusaurus-based website showcasing Azure Developer CLI templates. The site serves as a discovery platform for azd templates, provides contribution guides, and hosts a searchable gallery of community and Microsoft-authored templates.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

Bootstrap, build, and test the repository:

- Ensure Node.js 18+ is available: `node --version` (should show v20.19.5 or later)
- Navigate to website directory: `cd website`
- Install dependencies: `npm ci` -- takes ~15-60 seconds with warnings about deprecated packages (this is normal)
- Run tests: `npm test` -- takes ~1 second. NEVER CANCEL. Set timeout to 30+ seconds.
- Build the website: `npm run build` -- takes ~75 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
- Start development server: `npm run start` -- takes ~30 seconds to compile. NEVER CANCEL. Set timeout to 60+ seconds.
- Serve production build: `npm run serve` -- starts immediately after build

## Critical Timing and Timeout Requirements

- **npm ci**: 15-60 seconds (normal with deprecated package warnings about rimraf, glob, inflight)
- **npm test**: 1 second (set timeout to 30+ seconds)
- **npm run build**: 75 seconds (set timeout to 120+ seconds)  
- **npm run start**: 30 seconds initial compile (set timeout to 60+ seconds)
- **NEVER CANCEL any build or test commands** - they will complete successfully

## Manual Validation Requirements

After making any changes to the website, ALWAYS validate functionality by:

1. Start the development server: `cd website && npm run start`
2. Wait for "Compiled successfully" message
3. Test website accessibility: `curl -f "http://localhost:3000/awesome-azd/"`
4. Navigate to key pages and verify:
   - Homepage displays template gallery correctly
   - Getting Started page loads with video and action cards
   - Contribute page shows documentation
   - All navigation links work

## Repository Structure

Key directories and files:
- `website/` - Main Docusaurus application
  - `src/` - React components, pages, and data
  - `docs/` - Markdown documentation files
  - `static/` - Static assets including `templates.json` (5548 lines)
  - `package.json` - Dependencies and npm scripts
- `.github/workflows/` - CI/CD pipelines (release.yml, test-deploy.yml)
- `README.md` - Project overview and resources
- `GALLERY.md` - Gallery documentation

## Available Commands

All commands must be run from the `website/` directory:

- `npm ci` - Install dependencies (required first step)
- `npm test` - Run Jest tests (validates templates.json against tags)
- `npm run build` - Build production website to `build/` directory
- `npm run start` - Start development server at http://localhost:3000/awesome-azd/
- `npm run serve` - Serve production build locally
- `npm run docusaurus` - Direct Docusaurus CLI access

## Key Technologies

- **Docusaurus 3.7.0** - Static site generator
- **React 18** - UI framework
- **TypeScript** - Type checking
- **Jest** - Testing framework
- **Fluent UI** - Microsoft design system components
- **Node.js 20+** - Runtime requirement

## Template Gallery System

The template gallery is driven by:
- `website/static/templates.json` - Template metadata (5548 lines)
- `website/src/data/tags.tsx` - Tag definitions for filtering
- `website/src/components/gallery/` - Gallery components
- `website/static/templates/images/` - Template preview images

### Template Requirements

Templates must meet these standards to be included in the collection:

**README Requirements:**
- Standard structure with project name, use case, features, and architecture diagram
- Step-by-step deployment and customization instructions
- Getting started section with quick setup options (GitHub Codespaces, Dev Containers, local)
- Clear feature list highlighting AI capabilities
- CI/CD pipeline setup guidance using azd commands

**Security Recommended Practices:**
- Use keyless authentication (Managed Identity preferred or Key Vault) instead of API keys
- Implement Role-Based Access Control (RBAC) for resource access
- Enable data encryption at rest and in transit
- Use Azure Key Vault for secrets management
- Configure network isolation with private endpoints where applicable
- Include monitoring with Azure Monitor and Application Insights
- Add Responsible AI governance controls (content safety filters, etc.)
- Include SECURITY.md file with security reporting procedures

**azure.yaml Metadata Requirements:**
- **name** field (required): Unique app/template name using lowercase, numbers, dashes
- **metadata.template** field (recommended): Template identifier with version (e.g., `app-name@1.0.0`)
- List all Azure services and dependencies
- Include infrastructure as code (Bicep or Terraform) configuration

Example azure.yaml structure:
```yaml
name: my-ai-app
metadata:
  template: my-ai-app@1.0.0
services:
  web:
    project: ./src/web
    language: python
    host: appservice
```

## Contributing Workflow

When making changes:
1. Always run the full validation sequence after changes
2. Test that templates.json changes don't break the test: `npm test`
3. Verify gallery displays correctly through manual browser testing
4. Check that all navigation and filtering works

## Common Development Tasks

**Adding a new template to the gallery:**
1. Add entry to `website/static/templates.json` with required fields
2. Ensure all tags exist in `website/src/data/tags.tsx` (add if needed)
3. Run `npm test` to validate template tags
4. Test gallery display with `npm run start`

**Modifying site content:**
1. Edit files in `website/docs/` for documentation 
2. Edit files in `website/src/pages/` for main pages
3. Test changes with development server
4. Verify navigation and links work correctly

## CI/CD Pipeline

The repository uses GitHub Actions:
- `test-deploy.yml` - Runs automatically on PRs (build + test)
- `release.yml` - **DO NOT RUN** - Manual deployment workflow restricted to maintainers only for deploying to GitHub Pages
- Your changes will be validated by `test-deploy.yml` automatically when you open a PR

## Known Limitations

- No ESLint or Prettier configuration found
- Build warnings about deprecated packages are normal and expected
- External analytics scripts may fail to load in development (this is expected)
- Some external Microsoft resources may be blocked in sandbox environments

## Common File Locations

- Template data: `website/static/templates.json`
- Tag definitions: `website/src/data/tags.tsx`
- Gallery components: `website/src/components/gallery/`
- Documentation: `website/docs/`
- Main pages: `website/src/pages/`
- Site configuration: `website/docusaurus.config.js`

## Contributing Guidelines

When working on contributions:
- Review the [Contributor Guide](../website/docs/contribute.md) for template submission requirements
- Follow the [PR template](./PULL_REQUEST_TEMPLATE.md) when creating pull requests
- Check [SECURITY.md](../SECURITY.md) for security vulnerability reporting procedures
- Use appropriate [issue templates](./ISSUE_TEMPLATE/) for bugs, features, or template requests

## Specialized Copilot Prompts

The [`prompts/` directory](./prompts/) contains specialized prompts for specific tasks:
- [`awesome-azd-template-pr.md`](./prompts/awesome-azd-template-pr.md) - Automated template submission processor for handling new azd template contributions

## External Resources

Key Azure Developer CLI (azd) documentation:
- [azd Overview](https://learn.microsoft.com/azure/developer/azure-developer-cli/overview)
- [azd Quickstart](https://learn.microsoft.com/azure/developer/azure-developer-cli/get-started)
- [azd Reference](https://learn.microsoft.com/azure/developer/azure-developer-cli/reference)
- [Making projects azd compatible](https://learn.microsoft.com/azure/developer/azure-developer-cli/make-azd-compatible)

The build succeeds reliably and the website functions correctly when all steps are followed precisely.
The build succeeds reliably and the website functions correctly when all steps are followed precisely.

## Pull Request Review Guidelines

When reviewing pull requests for this repository, follow these guidelines:

### Changes to templates.json

If the PR makes changes to `website/static/templates.json`, perform the following checks:

1. **Validate Template Syntax**: Review each new template entry to ensure:
   - All required fields are present: `title`, `description`, `preview`, `authorUrl`, `author`, `source`, `tags`, `id`
   - The `id` field is a unique UUID
   - The `preview` path points to an existing image file or uses the default test image
   - The `source` URL is a valid GitHub repository URL
   - JSON syntax is correct (proper quotes, commas, brackets)

2. **Check for "new" Tag**: If a template is being added for the first time or is newly featured:
   - Verify whether the `"new"` tag has been added to the template's `tags` array
   - The "new" tag should be included for templates that are being newly showcased
   - Example: `"tags": ["msft", "new"]` or `"tags": ["community", "new"]`

3. **Validate All Tags**: Ensure all tags used in the template are defined in `website/src/data/tags.tsx`:
   - Check tags in the `tags` array
   - Check tags in the `languages` array
   - Check tags in the `frameworks` array
   - Check tags in the `azureServices` array
   - Check tags in the `IaC` array
   - If any tag is not defined in `tags.tsx`, request that the tag be added to that file first
   - Run `npm test` from the `website/` directory to automatically validate tags against the defined list
   
   **Verify Correct Tag Placement by Category**:
   - Each tag in `tags.tsx` has a `type` field that indicates its category
   - Tags should be placed in the appropriate array based on their `type`:
     - Tags with `type: "Language"` → should ONLY be in the `languages` array
     - Tags with `type: "Framework"` → should ONLY be in the `frameworks` array
     - Tags with `type: "Infrastructure as Code"` → should ONLY be in the `IaC` array
     - Tags with `type: "Service"` AND have `azureIcon` property (Azure services) → should ONLY be in the `azureServices` array
     - Tags with `type: "Service"` WITHOUT `azureIcon` property (non-Azure services) → should be in the `tags` array
     - Special tags (`msft`, `community`, `new`, `popular`, `aicollection`) → should be in the `tags` array
   - Example: `appservice` has `type: "Service"` AND `azureIcon`, so it belongs in `azureServices`, NOT in `tags`
   - Example: `sharepoint` has `type: "Service"` but NO `azureIcon`, so it belongs in `tags`, NOT in `azureServices`
   
   **Check for Duplicate Tags Across Arrays**:
   - Verify that no tag appears in multiple arrays
   - If a tag is duplicated (e.g., `appservice` in both `tags` and `azureServices`):
     - Request removal from the incorrect array
     - Keep it only in the correct array based on its `type` field and presence of `azureIcon`
   - Example: If `appservice` (has `azureIcon`) appears in both `tags` and `azureServices`, suggest removing it from `tags` and keeping it only in `azureServices`
   - Example: If `sharepoint` (no `azureIcon`) appears in both `tags` and `azureServices`, suggest removing it from `azureServices` and keeping it only in `tags`

4. **Testing Requirements Based on Template Type**:
   
   Template type is determined by checking if the `"msft"` tag is present in the template's `tags` array.
   
   **For Community Templates (tags do NOT contain "msft"):**
   - @ mention the manual test team member **@v-xuto** in a PR comment to request testing of the template
   - Example comment: "@v-xuto Please test this community template to ensure it works as expected."
   
   **For Microsoft Templates (tags contain "msft"):**
   - @ mention the **PR author** (use their actual GitHub username) requesting they provide proof of successful testing
   - Request either:
     - A link to a test pipeline that validates the template
     - Screenshots or other proof showing the template deploys successfully
   - Example comment: "@author_username Please provide a test pipeline link or proof of success for this Microsoft-authored template."
   - Note: Replace `author_username` with the actual GitHub username of the PR author (e.g., @johndoe)

5. **Validate "aicollection" Tag Usage**:
   
   If a template includes the `"aicollection"` tag in its `tags` array, verify that the template is actually listed in the AI App Templates gallery at https://azure.github.io/ai-app-templates/.
   
   **Validation Steps**:
   - Visit https://azure.github.io/ai-app-templates/ and search for the template
   - Check if the template's repository URL or template name matches any entry in the AI App Templates gallery
   - The template should be findable either by browsing the gallery or using the search functionality
   
   **If Template is NOT Found in AI App Templates**:
   - Request that the user remove the `"aicollection"` tag from the template entry
   - Example comment: "The `aicollection` tag should only be used for templates that are featured in the AI App Templates gallery at https://azure.github.io/ai-app-templates/. Since this template is not listed there, please remove the `aicollection` tag from the `tags` array."
   
   **If Template IS Found in AI App Templates**:
   - No action needed; the `"aicollection"` tag is appropriate
   
   **Note**: The `"aicollection"` tag is specifically for templates that are part of the curated AI App Templates collection. Templates with AI capabilities that are not in that collection should use other appropriate tags (e.g., `"ai"`, `"openai"`, `"azureopenai"`) instead.

### General PR Review Best Practices

- Always be respectful and constructive in your feedback
- Provide specific examples when requesting changes
- Acknowledge good work and improvements made by contributors
- Run the test suite (`npm test`) to catch issues automatically
- Check that CI/CD workflows pass successfully
- Verify that documentation is updated if the changes affect user-facing features

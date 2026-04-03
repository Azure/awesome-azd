---
name: awesome-azd-template-pr
description: >-
  Process new azd template submissions for the awesome-azd gallery. Use when
  assigned to an issue for adding a new template that includes a reference to
  the template repository. Analyzes the repo, generates a JSON entry for
  templates.json, creates a properly formatted pull request.
---

# Awesome AZD Template Submission Processor

You process new Azure Developer CLI (azd) template submissions for the
awesome-azd repository. When assigned to an issue for adding a new template
that includes a reference to the template repository, you analyze the repo,
generate the JSON entry, and create a pull request.

## Your Role

1. Validate the template repository
2. Generate the appropriate JSON entry for `templates.json`
3. Create properly formatted pull requests
4. Ensure all contribution guidelines are followed
5. Add appropriate tags and metadata

## Repository Analysis

When given a template repository URL, analyze the repository to determine:

### Infrastructure as Code Provider

- Look for `.bicep` files → tag as `bicep`
- Look for `.tf` files → tag as `terraform`

### Programming Languages

Detect languages from repository files and map to tags:

| Files | Tag |
|-------|-----|
| JavaScript | `javascript` |
| TypeScript | `typescript` |
| C# (.cs, .csproj) | `dotnetCsharp` |
| Java | `java` |
| Python | `python` |
| PHP | `php` |
| Ruby | `ruby` |
| Go | `go` |
| PowerShell | `powershell` |

### Frameworks and Tools

Detect from package.json, requirements.txt, project files:

| Framework | Tag |
|-----------|-----|
| React | `reactjs` |
| Vue.js | `vuejs` |
| Angular | `angular` |
| FastAPI | `fastapi` |
| Flask | `flask` |
| Django | `django` |
| Spring | `spring` |
| Blazor | `blazor` |
| Next.js | `nextjs` |
| NestJS | `nestjs` |
| Quarkus | `quarkus` |
| Streamlit | `streamlit` |
| .NET Aspire | `aspire` |

### Azure Services

Analyze bicep/terraform files for Azure resources and map to tags:

| Resource | Tag |
|----------|-----|
| Microsoft.Web/sites | `appservice` |
| Microsoft.App/containerApps | `aca` |
| Microsoft.Web/sites (function) | `functions` |
| Microsoft.ContainerService/managedClusters | `aks` |
| Microsoft.Web/staticSites | `swa` |
| Microsoft.DocumentDB/databaseAccounts | `cosmosdb` |
| Microsoft.Sql/servers | `azuresql` |
| Microsoft.DBforPostgreSQL/servers | `azuredb-postgreSQL` |
| Microsoft.DBforMySQL/servers | `azuredb-mySQL` |
| Microsoft.CognitiveServices/accounts (OpenAI) | `openai` |
| Microsoft.CognitiveServices/accounts | `azureai` |
| Microsoft.Search/searchServices | `aisearch` |
| Microsoft.KeyVault/vaults | `keyvault` |
| Microsoft.Insights/components | `appinsights` |
| Microsoft.OperationalInsights/workspaces | `loganalytics` |
| Microsoft.ServiceBus/namespaces | `servicebus` |
| Microsoft.EventHub/namespaces | `eventhub` |
| Microsoft.Storage/storageAccounts | `azurestorage` |
| Microsoft.Network/virtualNetworks | `vnets` |
| Microsoft.ApiManagement/service | `apim` |
| Microsoft.Cache/redis | `rediscache` |
| Microsoft.ManagedIdentity/userAssignedIdentities | `managedidentity` |

### Special Pattern Detection

- AI-related keywords in README/description → add `ai` tag
- RAG patterns → add `rag` tag
- GPT usage → add `gpt` tag
- Semantic Kernel → add `semantickernel` tag
- LangChain → add `langchain` or `langchain4j`
- Enterprise patterns → add `enterprisepatterns` tag
- Dapr configuration → add `dapr` tag
- Kubernetes manifests → add `kubernetes` tag

### aicollection Tag

The `aicollection` tag is **reserved** for templates in the Microsoft-curated
AI collection. Do NOT automatically add it. Only add if the template is
confirmed to be listed at https://azure.github.io/ai-app-templates/.

### Architecture Image Detection

Check the repository for images in this order:

1. README.md embedded images (architecture diagrams, screenshots)
2. Common image files: `architecture.png`, `diagram.png`, `overview.png`,
   `screenshot.png` (`.jpg`, `.svg` variants)
3. Common directories: `/diagrams/`, `/images/`, `/assets/`, `/docs/`,
   `/pictures/`

Prioritize architecture diagrams over screenshots.

## Author Type Detection

| Condition | Tag |
|-----------|-----|
| Owner is "Azure-Samples" or "Azure" | `msft` |
| Owner is "microsoft" | `msft` |
| Author email contains "@microsoft.com" | `msft` |
| Otherwise | `community` |

## JSON Entry Generation

Generate a JSON entry with this structure:

```json
{
  "title": "[Generated from repository name/description]",
  "description": "[1-2 sentence description of architecture]",
  "preview": "./templates/images/[repository-name].png",
  "authorUrl": "[Author GitHub profile or provided URL]",
  "author": "[Author name from repository or provided]",
  "source": "[Repository URL]",
  "tags": ["[msft/community]", "new"],
  "languages": ["[All detected programming languages]"],
  "frameworks": ["[All detected frameworks]"],
  "azureServices": ["[All detected Azure services in tags.tsx]"],
  "IaC": ["[bicep or terraform]"],
  "id": "[Generated UUID v4]"
}
```

## Processing Steps

### Step 1: Validate Template Repository

1. Check that the repository exists and is accessible
2. Verify it contains `azure.yaml` file (azd compatibility)
3. Ensure it has proper README.md with setup instructions
4. Validate infrastructure files exist (main.bicep or main.tf)

### Step 2: Generate Template Entry

**Title**: Follow the
[contribution guidelines](https://azure.github.io/awesome-azd/docs/contribute/).
Reflect the local application stack and technologies used.

**Description**: Extract from README.md or repository description. Keep to 1-2
sentences focusing on architecture and Azure services.

**Tags**: Include required tags (infrastructure, author type, `new`). Add all
detected technology, service, and pattern tags. Verify all tags exist in the
[official tags list](https://github.com/Azure/awesome-azd/blob/main/website/src/data/tags.tsx).

**UUID**: Generate a new UUID v4. Ensure uniqueness by checking existing
templates.json.

### Step 3: File Updates

**templates.json**: Insert the new entry. Maintain alphabetical order by title.
Ensure valid JSON formatting.

**Image handling**:
- If image found in repo: download to
  `website/static/templates/images/[template-name].png`, set preview path
  accordingly, note in PR that image was sourced from repository.
- If no image found: set preview path, note that image needs to be added by
  contributor.

### Step 4: PR Creation

**PR Title**: `adds the \`[template-name]\` template to the awesome-azd gallery`

**PR Description** must include:
- Changes made (title, description, image source, author, source URL, tags,
  languages, frameworks, Azure services, IaC, UUID)
- Template overview based on repository analysis
- Validation checklist (tests pass, build succeeds, valid JSON, no duplicate
  IDs, required fields present, tags verified)
- `Fixes #[ISSUE_NUMBER]`

## Error Handling

| Error | Comment |
|-------|---------|
| Repository not found | "❌ Repository URL is not accessible." |
| Not azd compatible | "❌ Repository does not appear to be azd compatible (missing azure.yaml)." |
| Missing infrastructure | "❌ No infrastructure files found (main.bicep or main.tf)." |
| Duplicate template | "❌ A template with this repository URL already exists in awesome-azd." |

## Quality Assurance

Before finalizing, verify:
1. JSON is properly formatted with all required fields
2. Tags exist in the
   [official tags list](https://github.com/Azure/awesome-azd/blob/main/website/src/data/tags.tsx)
3. All detected services are properly tagged
4. Description follows contribution guidelines
5. Template meets all awesome-azd contribution requirements

## Response Format

Always respond with:
1. **Analysis Summary**: What was detected
2. **Action Taken**: Files modified and PR created
3. **Next Steps**: What the contributor needs to do next

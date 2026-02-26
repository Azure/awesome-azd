#!/usr/bin/env node

/**
 * AI-powered metadata generation for azd template discovery.
 * Uses GitHub Models (gpt-4o-mini) via GITHUB_TOKEN for quality assessment
 * and structured metadata generation.
 */

// Valid tags from website/src/data/tags.tsx grouped by category
const VALID_TAGS = {
  languages: [
    "javascript", "typescript", "dotnetCsharp", "java", "python",
    "nodejs", "php", "ruby", "go",
  ],
  frameworks: [
    "fastapi", "flask", "django", "nestjs", "spring", "quarkus", "javaee",
    "vuejs", "reactjs", "angular", "streamlit", "semantickernel",
    "microfrontend", "blazor", "rubyonrails", "langchain", "nextjs",
    "kernelmemory", "rag", "langchain4j", "autogen", "chainlit",
  ],
  iac: ["bicep", "terraform"],
  azureServices: [
    "appinsights", "loganalytics", "appservice", "monitor", "keyvault",
    "aca", "functions", "blobstorage", "swa", "servicebus", "vnets",
    "aisearch", "openai", "azureai", "speechservice", "apim", "aks",
    "azurecdn", "frontdoor", "grafana", "azurespringapps", "rediscache",
    "agw", "azurebot", "ade", "eventhub", "azurestorage", "azureappconfig",
    "aifoundry", "apicenter", "eventgrid", "diagnosticsettings", "logicapps",
    "managedidentity", "serviceprincipal", "azuredatafactory", "virtualmachine",
    "sentinel", "trafficmgr", "purview", "backup", "recoveryvault",
    "loadtesting", "hyperv", "fabric", "vmsqlserver", "avset", "bastion",
    "privateEndpoints", "privatelink", "loadbalancer", "cosmosdb", "azuresql",
    "azuredb-postgreSQL", "azuredb-mySQL",
  ],
  tools: [
    "sap", "sapcloudsdk", "sapcap", "thymeleaf", "dall-e", "jupyter",
    "keda", "dapr", "webcomponents", "helm", "gpt", "msal",
    "featuremanagement", "powershell", "dab", "aspire", "mcp",
  ],
  topics: [
    "datascience", "enterprisepatterns", "ai", "platformengineering",
    "promptengineering", "featureExperimentation",
  ],
  databases: [
    "mongodb", "neondb", "prometheus", "pinecone",
  ],
  generalTags: [
    "dataverse", "webapps", "serverlessapi", "sharepoint", "kubernetes",
  ],
};

const GITHUB_MODELS_ENDPOINT = "https://models.github.ai/inference/chat/completions";
const MODEL = "openai/gpt-4o-mini";

async function callGitHubModels(messages) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is required");
  }

  const response = await fetch(GITHUB_MODELS_ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub Models API error (${response.status}): ${error}`);
  }

  const data = await response.json();

  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(
      "GitHub Models returned no content (empty choices or missing message)",
    );
  }

  try {
    return JSON.parse(content);
  } catch (parseErr) {
    throw new Error(
      `Failed to parse AI response as JSON: ${parseErr.message}. Raw content: ${content.substring(0, 200)}`,
    );
  }
}

/**
 * Assess whether a repo is a legitimate, high-quality azd template.
 * Returns { quality: number (1-10), reasoning: string, isLegitimate: boolean }
 */
async function assessTemplateQuality(repoData) {
  const messages = [
    {
      role: "system",
      content: `You are a quality assessor for Azure Developer CLI (azd) templates. 
You evaluate GitHub repositories that contain an azure.yaml file to determine if they are 
legitimate, high-quality templates suitable for a public gallery.

Reject repos that are:
- Personal experiments or learning exercises
- Forks with no meaningful changes
- Test/CI artifacts
- Incomplete or broken templates
- Very low effort (just scaffolding with no real content)

High-quality templates have:
- Clear README with description and setup instructions
- Meaningful infrastructure code (Bicep or Terraform)
- Working application code
- Azure services configured properly
- Good documentation

Respond with JSON: { "quality": <1-10>, "reasoning": "<brief explanation>", "isLegitimate": <boolean> }
A score of 6+ means the template is worth including. isLegitimate should be true only if quality >= 6.`,
    },
    {
      role: "user",
      content: `Evaluate this repository as an azd template:

Repository: ${repoData.fullName}
Description: ${repoData.description || "No description"}
Stars: ${repoData.stars}
Last updated: ${repoData.updatedAt}
Topics: ${(repoData.topics || []).join(", ") || "None"}
Primary language: ${repoData.language || "Unknown"}

azure.yaml content:
${(repoData.azureYaml || "").substring(0, 2000)}

README (first 3000 chars):
${(repoData.readme || "No README found").substring(0, 3000)}`,
    },
  ];

  return callGitHubModels(messages);
}

/**
 * Generate structured template metadata from repo data.
 * Returns metadata object matching templates.json schema.
 */
async function generateTemplateMetadata(repoData) {
  const allValidTags = JSON.stringify(VALID_TAGS, null, 2);

  const messages = [
    {
      role: "system",
      content: `You are a metadata generator for Azure Developer CLI (azd) templates.
Given a GitHub repository with an azure.yaml file, generate structured metadata for a template gallery.

IMPORTANT: You must ONLY use tags from the provided valid tags lists. Do not invent new tags.

Place tags in the correct category arrays:
- "languages": only from the languages list
- "frameworks": only from the frameworks list
- "IaC": only from the iac list (bicep/terraform - check azure.yaml and infra/ folder)
- "azureServices": only from the azureServices list
- "tags": use "community" for non-Microsoft repos, "msft" for Microsoft org repos. Add topic/tool/database/general tags here.

Respond with JSON:
{
  "title": "<concise, descriptive title>",
  "description": "<1-2 sentence description of what the template does>",
  "tags": ["community" or "msft", plus any topic/tool/database/general tags],
  "languages": ["<detected languages from valid list>"],
  "frameworks": ["<detected frameworks from valid list>"],
  "azureServices": ["<detected Azure services from valid list>"],
  "IaC": ["<bicep and/or terraform>"]
}

Valid tags by category:
${allValidTags}`,
    },
    {
      role: "user",
      content: `Generate metadata for this azd template repository:

Repository: ${repoData.fullName}
Owner: ${repoData.owner}
Description: ${repoData.description || "No description"}
Topics: ${(repoData.topics || []).join(", ") || "None"}
Primary language: ${repoData.language || "Unknown"}
All languages: ${JSON.stringify(repoData.languages || {})}
Is Microsoft org: ${repoData.isMicrosoftOrg}

azure.yaml content:
${(repoData.azureYaml || "").substring(0, 2000)}

README (first 4000 chars):
${(repoData.readme || "No README found").substring(0, 4000)}`,
    },
  ];

  return callGitHubModels(messages);
}

module.exports = {
  assessTemplateQuality,
  generateTemplateMetadata,
  VALID_TAGS,
};

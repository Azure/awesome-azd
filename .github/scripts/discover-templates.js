#!/usr/bin/env node

/**
 * Discovers new azd templates on GitHub by searching for repos with azure.yaml.
 * Filters against existing templates, ignore list, and uses AI for quality assessment.
 *
 * Usage: node discover-templates.js
 * Env: GITHUB_TOKEN (required)
 *
 * Outputs JSON array of discovered templates to stdout.
 */

const path = require("path");
const fs = require("fs");
const { assessTemplateQuality, generateTemplateMetadata } = require("./ai-metadata");
const crypto = require("crypto");

const MICROSOFT_ORGS = new Set([
  "azure", "azure-samples", "microsoft", "microsoftdocs",
  "azure-app-service", "azure-for-startups",
]);

const SEARCH_QUERIES = [
  'filename:azure.yaml path:/ language:YAML',
];

const MAX_RESULTS_PER_QUERY = 300;
const API_DELAY_MS = 6000;
const PER_PAGE = 100;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeUrl(url) {
  if (!url) return "";
  return url.toLowerCase().replace(/\/+$/, "").replace(/\.git$/, "");
}

async function githubApi(endpoint, token) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `https://api.github.com${endpoint}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${body}`);
  }

  return response.json();
}

async function searchCode(query, token) {
  const results = [];
  let page = 1;

  while (results.length < MAX_RESULTS_PER_QUERY) {
    await sleep(API_DELAY_MS);
    try {
      const data = await githubApi(
        `/search/code?q=${encodeURIComponent(query)}&per_page=${PER_PAGE}&page=${page}`,
        token
      );

      if (!data.items || data.items.length === 0) break;

      results.push(...data.items);
      if (data.items.length < PER_PAGE) break;
      page++;
    } catch (err) {
      console.error(`Search error on page ${page}: ${err.message}`);
      break;
    }
  }

  return results;
}

async function getRepoDetails(owner, repo, token) {
  return githubApi(`/repos/${owner}/${repo}`, token);
}

async function getFileContent(owner, repo, filePath, token) {
  try {
    const data = await githubApi(
      `/repos/${owner}/${repo}/contents/${filePath}`,
      token
    );
    if (data.content) {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
  } catch {
    return null;
  }
  return null;
}

async function getRepoLanguages(owner, repo, token) {
  try {
    return await githubApi(`/repos/${owner}/${repo}/languages`, token);
  } catch {
    return {};
  }
}

async function checkExistingPRs(owner, repo, searchOwner, searchRepo, token) {
  try {
    const branchName = `discover/template-${searchOwner}-${searchRepo}`;
    const data = await githubApi(
      `/repos/${owner}/${repo}/pulls?state=open&head=${owner}:${branchName}&per_page=1`,
      token
    );
    return data.length > 0;
  } catch {
    return false;
  }
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("GITHUB_TOKEN is required");
    process.exit(1);
  }

  const repoOwner = process.env.REPO_OWNER || "Azure";
  const repoName = process.env.REPO_NAME || "awesome-azd";

  // Load existing templates
  const templatesPath = path.resolve(__dirname, "../../website/static/templates.json");
  const templates = JSON.parse(fs.readFileSync(templatesPath, "utf-8"));
  const existingSources = new Set(templates.map((t) => normalizeUrl(t.source)));

  // Load ignore list
  const ignorePath = path.resolve(__dirname, "../discovery-ignore.json");
  const ignoreList = JSON.parse(fs.readFileSync(ignorePath, "utf-8"));
  const ignoredTemplates = new Set(
    (ignoreList.templates || []).map((entry) => normalizeUrl(entry.source))
  );

  console.log(`Loaded ${existingSources.size} existing templates`);
  console.log(`Loaded ${ignoredTemplates.size} ignored templates`);

  // Search GitHub
  const allResults = [];
  for (const query of SEARCH_QUERIES) {
    console.log(`Searching: ${query}`);
    const results = await searchCode(query, token);
    console.log(`  Found ${results.length} results`);
    allResults.push(...results);
  }

  // Deduplicate by repo
  const seenRepos = new Set();
  const uniqueRepos = [];
  for (const item of allResults) {
    const repoFullName = item.repository.full_name;
    if (seenRepos.has(repoFullName)) continue;
    seenRepos.add(repoFullName);
    uniqueRepos.push(item);
  }

  console.log(`Unique repos found: ${uniqueRepos.length}`);

  const discovered = [];

  for (const item of uniqueRepos) {
    const repoFullName = item.repository.full_name;
    const [owner, repo] = repoFullName.split("/");
    const repoUrl = `https://github.com/${repoFullName}`;

    // Skip if already tracked
    if (existingSources.has(normalizeUrl(repoUrl))) {
      continue;
    }

    // Skip if in ignore list
    if (ignoredTemplates.has(normalizeUrl(repoUrl))) {
      continue;
    }

    // Get repo details for filtering
    await sleep(1000);
    let repoDetails;
    try {
      repoDetails = await getRepoDetails(owner, repo, token);
    } catch (err) {
      console.error(`  Skipping ${repoFullName}: ${err.message}`);
      continue;
    }

    // Filter out forks, archived, and low-quality repos
    if (repoDetails.fork) {
      console.log(`  Skipping ${repoFullName}: fork`);
      continue;
    }
    if (repoDetails.archived) {
      console.log(`  Skipping ${repoFullName}: archived`);
      continue;
    }
    if (repoDetails.stargazers_count < 2) {
      console.log(`  Skipping ${repoFullName}: <2 stars`);
      continue;
    }

    // Check for existing open PR
    const hasOpenPR = await checkExistingPRs(
      repoOwner, repoName, owner, repo, token
    );
    if (hasOpenPR) {
      console.log(`  Skipping ${repoFullName}: open PR exists`);
      continue;
    }

    // Fetch repo content
    console.log(`  Evaluating ${repoFullName}...`);
    const [azureYaml, readme, languages] = await Promise.all([
      getFileContent(owner, repo, "azure.yaml", token),
      getFileContent(owner, repo, "README.md", token),
      getRepoLanguages(owner, repo, token),
    ]);

    if (!azureYaml) {
      console.log(`  Skipping ${repoFullName}: could not read azure.yaml`);
      continue;
    }

    const isMicrosoftOrg = MICROSOFT_ORGS.has(owner.toLowerCase());
    const repoData = {
      fullName: repoFullName,
      owner,
      repo,
      description: repoDetails.description,
      stars: repoDetails.stargazers_count,
      updatedAt: repoDetails.updated_at,
      topics: repoDetails.topics || [],
      language: repoDetails.language,
      languages,
      azureYaml,
      readme,
      isMicrosoftOrg,
      url: repoUrl,
    };

    // AI quality assessment
    try {
      const assessment = await assessTemplateQuality(repoData);
      console.log(
        `  Quality: ${assessment.quality}/10 - ${assessment.reasoning}`
      );

      if (!assessment.isLegitimate || assessment.quality < 6) {
        console.log(`  Skipping ${repoFullName}: low quality`);
        continue;
      }

      // Generate metadata
      const metadata = await generateTemplateMetadata(repoData);

      const templateEntry = {
        title: metadata.title || repoDetails.name,
        description:
          metadata.description || repoDetails.description || "",
        preview: "./templates/images/test.png",
        authorUrl: `https://github.com/${owner}`,
        author: owner,
        source: repoUrl,
        tags: metadata.tags || (isMicrosoftOrg ? ["msft"] : ["community"]),
        id: crypto.randomUUID(),
      };

      // Add optional arrays only if non-empty
      if (metadata.languages && metadata.languages.length > 0) {
        templateEntry.languages = metadata.languages;
      }
      if (metadata.frameworks && metadata.frameworks.length > 0) {
        templateEntry.frameworks = metadata.frameworks;
      }
      if (metadata.azureServices && metadata.azureServices.length > 0) {
        templateEntry.azureServices = metadata.azureServices;
      }
      if (metadata.IaC && metadata.IaC.length > 0) {
        templateEntry.IaC = metadata.IaC;
      }

      discovered.push({
        repoFullName,
        repoUrl,
        quality: assessment.quality,
        reasoning: assessment.reasoning,
        entry: templateEntry,
      });

      console.log(`  ✓ Discovered: ${metadata.title}`);
    } catch (err) {
      console.error(`  AI error for ${repoFullName}: ${err.message}`);
    }
  }

  // Output results
  console.log(`\nTotal discovered: ${discovered.length}`);
  // Write to file for the workflow to consume
  const outputPath = path.resolve(__dirname, "../../discovered-templates.json");
  fs.writeFileSync(outputPath, JSON.stringify(discovered, null, 2));
  console.log(`Results written to ${outputPath}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

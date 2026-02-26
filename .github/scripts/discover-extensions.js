#!/usr/bin/env node

/**
 * Discovers new azd extensions on GitHub by searching for repos with registry.json.
 * Validates using the existing validate-extension.js script and filters against
 * existing extensions and ignore list.
 *
 * Usage: node discover-extensions.js
 * Env: GITHUB_TOKEN (required)
 *
 * Outputs JSON array of discovered extensions to stdout.
 */

const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");

const SEARCH_QUERIES = [
  'filename:registry.json "versions" "capabilities" "artifacts"',
];

const MAX_RESULTS_PER_QUERY = 300;
const API_DELAY_MS = 6000;
const PER_PAGE = 100;

const MICROSOFT_ORGS = new Set([
  "azure", "azure-samples", "microsoft", "microsoftdocs",
]);

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

async function checkExistingPRs(repoOwner, repoName, extensionId, token) {
  try {
    const safeName = extensionId.replace(/[^a-zA-Z0-9.-]/g, "-");
    const branchName = `discover/extension-${safeName}`;
    const data = await githubApi(
      `/repos/${repoOwner}/${repoName}/pulls?state=open&head=${repoOwner}:${branchName}&per_page=1`,
      token
    );
    return data.length > 0;
  } catch {
    return false;
  }
}

function buildRegistryUrl(owner, repo, filePath) {
  // Convert repo path to raw.githubusercontent.com URL
  const branch = "main";
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
}

function validateRegistryWithScript(registryUrl) {
  const scriptPath = path.resolve(
    __dirname,
    "../../website/scripts/validate-extension.js"
  );

  try {
    const output = execFileSync("node", [scriptPath, registryUrl], {
      encoding: "utf-8",
      timeout: 30000,
    });
    return { valid: true, result: JSON.parse(output) };
  } catch (err) {
    return {
      valid: false,
      error: err.stderr || err.stdout || err.message,
    };
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

  // Load existing extensions
  const extensionsPath = path.resolve(
    __dirname,
    "../../website/static/extensions.json"
  );
  const extensions = JSON.parse(fs.readFileSync(extensionsPath, "utf-8"));
  const existingIds = new Set(extensions.map((e) => e.id));
  const existingSources = new Set(
    extensions.map((e) => normalizeUrl(e.source))
  );
  const existingRegistryUrls = new Set(
    extensions.map((e) => normalizeUrl(e.registryUrl))
  );

  // Load ignore list
  const ignorePath = path.resolve(__dirname, "../discovery-ignore.json");
  const ignoreList = JSON.parse(fs.readFileSync(ignorePath, "utf-8"));
  const ignoredExtensions = new Set(
    (ignoreList.extensions || []).map((entry) => normalizeUrl(entry.source))
  );

  console.log(`Loaded ${existingIds.size} existing extensions`);
  console.log(`Loaded ${ignoredExtensions.size} ignored extensions`);

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
    const filePath = item.path;

    // Skip if source already tracked
    if (existingSources.has(normalizeUrl(repoUrl))) {
      continue;
    }

    // Skip if in ignore list
    if (ignoredExtensions.has(normalizeUrl(repoUrl))) {
      continue;
    }

    // Get repo details
    await sleep(1000);
    let repoDetails;
    try {
      repoDetails = await getRepoDetails(owner, repo, token);
    } catch (err) {
      console.error(`  Skipping ${repoFullName}: ${err.message}`);
      continue;
    }

    // Filter forks and archived repos
    if (repoDetails.fork) {
      console.log(`  Skipping ${repoFullName}: fork`);
      continue;
    }
    if (repoDetails.archived) {
      console.log(`  Skipping ${repoFullName}: archived`);
      continue;
    }

    // Build registry URL and check if already tracked
    const registryUrl = buildRegistryUrl(owner, repo, filePath);
    if (existingRegistryUrls.has(normalizeUrl(registryUrl))) {
      console.log(`  Skipping ${repoFullName}: registry URL already tracked`);
      continue;
    }

    console.log(`  Validating ${repoFullName} (${registryUrl})...`);

    // Validate using existing script
    const validation = validateRegistryWithScript(registryUrl);

    if (!validation.valid) {
      console.log(`  Skipping ${repoFullName}: validation failed`);
      continue;
    }

    const validatedExtensions = validation.result;
    if (!Array.isArray(validatedExtensions) || validatedExtensions.length === 0) {
      console.log(`  Skipping ${repoFullName}: no valid extensions in registry`);
      continue;
    }

    for (const ext of validatedExtensions) {
      if (!ext.valid) {
        console.log(`  Skipping extension ${ext.id}: invalid`);
        continue;
      }

      // Check if this extension ID already exists
      if (existingIds.has(ext.id)) {
        console.log(`  Skipping ${ext.id}: already in extensions.json`);
        continue;
      }

      // Check for existing open PR
      const hasOpenPR = await checkExistingPRs(
        repoOwner, repoName, ext.id, token
      );
      if (hasOpenPR) {
        console.log(`  Skipping ${ext.id}: open PR exists`);
        continue;
      }

      const isMicrosoftOrg = MICROSOFT_ORGS.has(owner.toLowerCase());
      const tags = isMicrosoftOrg ? ["msft", "new"] : ["community", "new"];

      const entry = {
        id: ext.id,
        namespace: ext.namespace,
        displayName: ext.displayName,
        description: ext.description,
        author: repoDetails.owner.login,
        authorUrl: `https://github.com/${repoDetails.owner.login}`,
        source: repoUrl,
        registryUrl: registryUrl,
        latestVersion: ext.latestVersion,
        capabilities: ext.capabilities,
        platforms: ext.platforms,
        tags,
        installCommand: `azd extension install ${ext.id}`,
      };

      discovered.push({
        repoFullName,
        repoUrl,
        extensionId: ext.id,
        entry,
      });

      console.log(`  ✓ Discovered extension: ${ext.displayName} (${ext.id})`);
    }
  }

  // Output results
  console.log(`\nTotal discovered: ${discovered.length}`);
  const outputPath = path.resolve(
    __dirname,
    "../../discovered-extensions.json"
  );
  fs.writeFileSync(outputPath, JSON.stringify(discovered, null, 2));
  console.log(`Results written to ${outputPath}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

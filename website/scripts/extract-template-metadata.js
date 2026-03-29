#!/usr/bin/env node

"use strict";

const https = require("https");
const { URL } = require("url");
const yaml = require("js-yaml");
const { validateUrl, safeLookup } = require("./validate-template");
const { sanitize } = require("./update-templates-json");

/**
 * Map GitHub API language names to gallery tag names.
 */
const LANGUAGE_MAP = {
  Python: "python",
  JavaScript: "javascript",
  TypeScript: "typescript",
  Java: "java",
  "C#": "csharp",
  Go: "go",
  Rust: "rust",
  PHP: "php",
  Ruby: "ruby",
  Swift: "swift",
  Kotlin: "kotlin",
  Dart: "dart",
};

/**
 * Map GitHub topics to Azure service gallery tags.
 */
const AZURE_SERVICE_MAP = {
  "azure-openai": "openai",
  "azure-functions": "functions",
  "azure-container-apps": "aca",
  "azure-app-service": "appservice",
  "azure-cosmos-db": "cosmosdb",
  "azure-sql": "azuresql",
  "azure-storage": "storage",
  "azure-key-vault": "keyvault",
  "azure-monitor": "monitor",
  "azure-cognitive-services": "cognitiveservices",
  "azure-search": "aisearch",
  "azure-ai-search": "aisearch",
};

/**
 * GitHub organisations treated as Microsoft-authored.
 */
const MICROSOFT_ORGS = ["azure", "azure-samples", "microsoft"];

const REQUEST_TIMEOUT_MS = 10000;
const MAX_AZURE_YAML_BYTES = 100 * 1024; // 100 KB
const MAX_README_BYTES = 4 * 1024; // 4 KB
const DEFAULT_MAX_BYTES = 512 * 1024; // 512 KB

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

/**
 * HTTPS GET with safeLookup (DNS-rebinding protection), timeout, and size cap.
 *
 * @param {string} url
 * @param {{ maxSize?: number, headers?: Record<string, string> }} [options]
 * @returns {Promise<string>}
 */
function fetchHttps(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const maxSize = options.maxSize || DEFAULT_MAX_BYTES;

    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: "GET",
        timeout: REQUEST_TIMEOUT_MS,
        lookup: safeLookup,
        headers: {
          "User-Agent": "awesome-azd-metadata-extractor",
          ...(options.headers || {}),
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }

        const chunks = [];
        let size = 0;

        res.on("data", (chunk) => {
          size += chunk.length;
          if (size > maxSize) {
            req.destroy();
            reject(new Error(`Response exceeds ${maxSize} byte limit`));
            return;
          }
          chunks.push(chunk);
        });

        res.on("end", () => {
          resolve(Buffer.concat(chunks).toString("utf8"));
        });
      }
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });

    req.on("error", reject);
    req.end();
  });
}

/**
 * HTTPS HEAD request. Resolves to `true` when status is 2xx.
 *
 * @param {string} url
 * @returns {Promise<boolean>}
 */
function headHttps(url) {
  return new Promise((resolve) => {
    const parsed = new URL(url);

    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname,
        method: "HEAD",
        timeout: REQUEST_TIMEOUT_MS,
        lookup: safeLookup,
        headers: { "User-Agent": "awesome-azd-metadata-extractor" },
      },
      (res) => {
        res.resume();
        resolve(res.statusCode >= 200 && res.statusCode < 300);
      }
    );

    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.on("error", () => resolve(false));
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Parse a GitHub repository URL into owner and repo.
 *
 * @param {string} url
 * @returns {{ owner: string, repo: string }}
 */
function parseRepoUrl(url) {
  validateUrl(url, "Repository");

  const parsed = new URL(url);
  if (parsed.hostname !== "github.com") {
    throw new Error("Only GitHub repository URLs are supported");
  }

  const parts = parsed.pathname.replace(/^\/+|\/+$/g, "").split("/");
  if (parts.length < 2 || !parts[0] || !parts[1]) {
    throw new Error(
      "URL must be in the format https://github.com/{owner}/{repo}"
    );
  }

  return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
}

/**
 * Fetch GitHub API metadata (repo info + languages).
 *
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<{ repoData: object, languages: object }>}
 */
async function fetchGitHubApi(owner, repo) {
  const headers = { Accept: "application/vnd.github.v3+json" };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const eo = encodeURIComponent(owner);
  const er = encodeURIComponent(repo);

  const repoData = JSON.parse(
    await fetchHttps(`https://api.github.com/repos/${eo}/${er}`, {
      headers,
      maxSize: DEFAULT_MAX_BYTES,
    })
  );

  let languages = {};
  try {
    languages = JSON.parse(
      await fetchHttps(
        `https://api.github.com/repos/${eo}/${er}/languages`,
        { headers, maxSize: DEFAULT_MAX_BYTES }
      )
    );
  } catch {
    // Languages endpoint may fail — non-fatal
  }

  return { repoData, languages };
}

/**
 * Fetch and parse `azure.yaml` using FAILSAFE_SCHEMA.
 * Tries the given branch first, falls back to main → master when no branch
 * is specified.
 *
 * @param {string} owner
 * @param {string} repo
 * @param {string} [branch]
 * @returns {Promise<object>}
 */
async function fetchAzureYaml(owner, repo, branch) {
  const eo = encodeURIComponent(owner);
  const er = encodeURIComponent(repo);

  let content;
  if (branch) {
    content = await fetchHttps(
      `https://raw.githubusercontent.com/${eo}/${er}/${encodeURIComponent(branch)}/azure.yaml`,
      { maxSize: MAX_AZURE_YAML_BYTES }
    );
  } else {
    try {
      content = await fetchHttps(
        `https://raw.githubusercontent.com/${eo}/${er}/main/azure.yaml`,
        { maxSize: MAX_AZURE_YAML_BYTES }
      );
    } catch {
      content = await fetchHttps(
        `https://raw.githubusercontent.com/${eo}/${er}/master/azure.yaml`,
        { maxSize: MAX_AZURE_YAML_BYTES }
      );
    }
  }

  return yaml.load(content, { schema: yaml.FAILSAFE_SCHEMA });
}

/**
 * Fetch the first `# Heading` from README.md (limited to 4 KB).
 *
 * @param {string} owner
 * @param {string} repo
 * @param {string} [branch]
 * @returns {Promise<string>}
 */
async function fetchReadmeTitle(owner, repo, branch) {
  const eo = encodeURIComponent(owner);
  const er = encodeURIComponent(repo);

  let content;
  if (branch) {
    content = await fetchHttps(
      `https://raw.githubusercontent.com/${eo}/${er}/${encodeURIComponent(branch)}/README.md`,
      { maxSize: MAX_README_BYTES }
    );
  } else {
    try {
      content = await fetchHttps(
        `https://raw.githubusercontent.com/${eo}/${er}/main/README.md`,
        { maxSize: MAX_README_BYTES }
      );
    } catch {
      content = await fetchHttps(
        `https://raw.githubusercontent.com/${eo}/${er}/master/README.md`,
        { maxSize: MAX_README_BYTES }
      );
    }
  }

  const match = content.match(/^#\s+(.+)$/m);
  if (!match) return "";

  return match[1]
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // strip markdown links
    .replace(/[*_`~]/g, "") // strip emphasis / code markers
    .trim();
}

/**
 * Extract all available metadata from a GitHub repository URL.
 *
 * Every sub-fetch is wrapped so that a single failure never blocks the rest.
 *
 * @param {string} repoUrl
 * @returns {Promise<{
 *   title: string,
 *   description: string,
 *   author: string,
 *   authorUrl: string,
 *   authorType: string,
 *   languages: string[],
 *   frameworks: string[],
 *   azureServices: string[],
 *   iacProvider: string,
 * }>}
 */
async function extractMetadata(repoUrl) {
  const { owner, repo } = parseRepoUrl(repoUrl);

  const result = {
    title: "",
    description: "",
    author: "",
    authorUrl: "",
    authorType: "",
    languages: [],
    frameworks: [],
    azureServices: [],
    iacProvider: "",
  };

  let defaultBranch = "main";

  // ---- GitHub API ---------------------------------------------------------
  try {
    const { repoData, languages } = await fetchGitHubApi(owner, repo);

    defaultBranch = repoData.default_branch || "main";
    result.description = sanitize(repoData.description || "", 500);
    result.author = sanitize(
      (repoData.owner && repoData.owner.login) || "",
      100
    );
    result.authorUrl =
      (repoData.owner && repoData.owner.html_url) || "";

    const ownerLogin = (
      (repoData.owner && repoData.owner.login) || ""
    ).toLowerCase();
    result.authorType = MICROSOFT_ORGS.includes(ownerLogin)
      ? "Microsoft"
      : "Community";

    result.languages = Object.keys(languages)
      .filter((lang) => LANGUAGE_MAP[lang])
      .map((lang) => LANGUAGE_MAP[lang]);

    const topics = repoData.topics || [];
    result.azureServices = topics
      .filter((topic) => AZURE_SERVICE_MAP[topic])
      .map((topic) => AZURE_SERVICE_MAP[topic])
      .filter((v, i, a) => a.indexOf(v) === i); // deduplicate
  } catch {
    // API errors are non-fatal — continue with other sources
  }

  // ---- azure.yaml ---------------------------------------------------------
  try {
    const azureYaml = await fetchAzureYaml(owner, repo, defaultBranch);
    if (azureYaml && typeof azureYaml === "object") {
      if (!result.title && azureYaml.name) {
        result.title = sanitize(String(azureYaml.name), 200);
      }

      if (
        azureYaml.services &&
        typeof azureYaml.services === "object"
      ) {
        const hostServiceMap = {
          containerapp: "aca",
          appservice: "appservice",
          function: "functions",
        };
        for (const svc of Object.values(azureYaml.services)) {
          if (svc && typeof svc === "object" && svc.host) {
            const tag = hostServiceMap[String(svc.host)];
            if (tag && !result.azureServices.includes(tag)) {
              result.azureServices.push(tag);
            }
          }
        }
      }
    }
  } catch {
    // azure.yaml not found or invalid — non-fatal
  }

  // ---- README title -------------------------------------------------------
  try {
    const readmeTitle = await fetchReadmeTitle(
      owner,
      repo,
      defaultBranch
    );
    if (!result.title && readmeTitle) {
      result.title = sanitize(readmeTitle, 200);
    }
  } catch {
    // README not available — non-fatal
  }

  // ---- IaC detection ------------------------------------------------------
  try {
    const eo = encodeURIComponent(owner);
    const er = encodeURIComponent(repo);
    const eb = encodeURIComponent(defaultBranch);

    const [hasBicep, hasTerraform] = await Promise.all([
      headHttps(
        `https://raw.githubusercontent.com/${eo}/${er}/${eb}/infra/main.bicep`
      ),
      headHttps(
        `https://raw.githubusercontent.com/${eo}/${er}/${eb}/infra/main.tf`
      ),
    ]);

    if (hasBicep && hasTerraform) {
      result.iacProvider = "Both";
    } else if (hasBicep) {
      result.iacProvider = "Bicep";
    } else if (hasTerraform) {
      result.iacProvider = "Terraform";
    }
  } catch {
    // IaC detection failed — non-fatal
  }

  return result;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------
if (typeof require !== "undefined" && require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error(
      "Usage: node extract-template-metadata.js <github-repo-url>"
    );
    process.exit(1);
  }

  extractMetadata(url)
    .then((metadata) => {
      console.log(JSON.stringify(metadata, null, 2));
    })
    .catch((err) => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
}

module.exports = {
  extractMetadata,
  parseRepoUrl,
  fetchGitHubApi,
  fetchAzureYaml,
  fetchReadmeTitle,
  LANGUAGE_MAP,
  AZURE_SERVICE_MAP,
  MICROSOFT_ORGS,
};

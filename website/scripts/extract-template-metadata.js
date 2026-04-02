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

/**
 * Map dependency-file patterns to gallery framework tags.
 *
 * Each detector lists:
 *   tag      – the gallery tag name (must exist in tags.tsx)
 *   patterns – substrings to search for (case-insensitive)
 *   files    – which dependency files to search in
 */
const FRAMEWORK_DETECTORS = [
  // Python frameworks (check requirements.txt, pyproject.toml)
  { tag: "fastapi", patterns: ["fastapi"], files: ["requirements.txt", "pyproject.toml"] },
  { tag: "flask", patterns: ["flask"], files: ["requirements.txt", "pyproject.toml"] },
  { tag: "django", patterns: ["django"], files: ["requirements.txt", "pyproject.toml"] },
  { tag: "streamlit", patterns: ["streamlit"], files: ["requirements.txt", "pyproject.toml"] },
  { tag: "langchain", patterns: ["langchain"], files: ["requirements.txt", "pyproject.toml"] },
  { tag: "chainlit", patterns: ["chainlit"], files: ["requirements.txt", "pyproject.toml"] },
  { tag: "autogen", patterns: ["autogen", "pyautogen"], files: ["requirements.txt", "pyproject.toml"] },

  // JavaScript/TypeScript frameworks (check package.json)
  { tag: "reactjs", patterns: ['"react"'], files: ["package.json"] },
  { tag: "vuejs", patterns: ['"vue"'], files: ["package.json"] },
  { tag: "angular", patterns: ['"@angular/core"'], files: ["package.json"] },
  { tag: "nextjs", patterns: ['"next"'], files: ["package.json"] },
  { tag: "nestjs", patterns: ['"@nestjs/core"'], files: ["package.json"] },

  // Java frameworks (check pom.xml, build.gradle)
  { tag: "spring", patterns: ["spring-boot", "spring-framework", "org.springframework"], files: ["pom.xml", "build.gradle", "build.gradle.kts"] },
  { tag: "quarkus", patterns: ["quarkus", "io.quarkus"], files: ["pom.xml", "build.gradle", "build.gradle.kts"] },
  { tag: "javaee", patterns: ["jakarta.", "javax.servlet", "jakarta.servlet"], files: ["pom.xml", "build.gradle", "build.gradle.kts"] },
  { tag: "langchain4j", patterns: ["langchain4j"], files: ["pom.xml", "build.gradle", "build.gradle.kts"] },

  // .NET frameworks (detected from topics / README)
  { tag: "blazor", patterns: ["blazor", "Microsoft.AspNetCore.Components"], files: ["package.json"] },
  { tag: "semantickernel", patterns: ["semantic-kernel", "Microsoft.SemanticKernel", "semantic_kernel"], files: ["requirements.txt", "pyproject.toml", "package.json"] },

  // Ruby frameworks
  { tag: "rubyonrails", patterns: ["rails", 'gem "rails"', "gem 'rails'"], files: ["Gemfile"] },

  // AI/ML frameworks (cross-language — detected from topics only)
  { tag: "rag", patterns: ["retrieval", "rag", "vector-search", "embedding"], files: [] },
  { tag: "kernelmemory", patterns: ["kernel-memory", "Microsoft.KernelMemory"], files: ["package.json"] },
];

/**
 * Badge-image hostname patterns to skip when looking for a preview image.
 */
const BADGE_PATTERNS = [
  "shields.io",
  "img.shields.io",
  "badge",
  "codecov.io",
  "travis-ci.org",
  "travis-ci.com",
  "github.com/workflows",
  "github.com/actions",
  "coveralls.io",
  "david-dm.org",
  "snyk.io",
];

const REQUEST_TIMEOUT_MS = 10000;
const MAX_AZURE_YAML_BYTES = 100 * 1024; // 100 KB
const MAX_README_BYTES = 50 * 1024; // 50 KB
const MAX_DEP_FILE_BYTES = 100 * 1024; // 100 KB
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
 * Fetch the full README.md content (up to 50 KB).
 *
 * The content is shared between title extraction and image extraction to
 * avoid a duplicate HTTP request.
 *
 * @param {string} owner
 * @param {string} repo
 * @param {string} [branch]
 * @returns {Promise<string>}
 */
async function fetchReadme(owner, repo, branch) {
  const eo = encodeURIComponent(owner);
  const er = encodeURIComponent(repo);

  if (branch) {
    return fetchHttps(
      `https://raw.githubusercontent.com/${eo}/${er}/${encodeURIComponent(branch)}/README.md`,
      { maxSize: MAX_README_BYTES }
    );
  }

  try {
    return await fetchHttps(
      `https://raw.githubusercontent.com/${eo}/${er}/main/README.md`,
      { maxSize: MAX_README_BYTES }
    );
  } catch {
    return fetchHttps(
      `https://raw.githubusercontent.com/${eo}/${er}/master/README.md`,
      { maxSize: MAX_README_BYTES }
    );
  }
}

/**
 * Extract the first `# Heading` from README content.
 *
 * @param {string} content — raw README.md text
 * @returns {string}
 */
function extractReadmeTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  if (!match) return "";

  return match[1]
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // strip markdown links
    .replace(/[*_`~]/g, "") // strip emphasis / code markers
    .trim();
}

/**
 * Backwards-compatible wrapper — fetches the README and returns the title.
 *
 * @param {string} owner
 * @param {string} repo
 * @param {string} [branch]
 * @returns {Promise<string>}
 */
async function fetchReadmeTitle(owner, repo, branch) {
  const content = await fetchReadme(owner, repo, branch);
  return extractReadmeTitle(content);
}

/**
 * Determine whether a URL looks like a CI/CD badge image.
 *
 * @param {string} url
 * @returns {boolean}
 */
function isBadgeUrl(url) {
  const lower = url.toLowerCase();
  return BADGE_PATTERNS.some((p) => lower.includes(p));
}

/**
 * Convert a (possibly relative) image path to an absolute raw.githubusercontent URL.
 *
 * @param {string} rawUrl  — the URL as written in the README
 * @param {string} owner
 * @param {string} repo
 * @param {string} branch
 * @returns {string}  absolute URL or empty string when invalid
 */
function resolveImageUrl(rawUrl, owner, repo, branch) {
  if (!rawUrl) return "";

  const trimmed = rawUrl.trim();
  if (!trimmed) return "";

  // Absolute URL — use as-is after SSRF validation
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      validateUrl(trimmed, "Preview image");
      return trimmed;
    } catch {
      return "";
    }
  }

  // Relative path → convert to raw.githubusercontent.com
  let relPath = trimmed;

  // Strip query params / fragment
  relPath = relPath.split("?")[0].split("#")[0];

  // Normalise leading ./  ../ or /
  if (relPath.startsWith("./")) {
    relPath = relPath.slice(2);
  } else if (relPath.startsWith("/")) {
    relPath = relPath.slice(1);
  }
  // ../path stays as-is (raw.githubusercontent will resolve it)

  if (!relPath) return "";

  const eo = encodeURIComponent(owner);
  const er = encodeURIComponent(repo);
  const eb = encodeURIComponent(branch);

  // Encode each path segment individually so slashes are preserved
  const encodedPath = relPath
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  return `https://raw.githubusercontent.com/${eo}/${er}/${eb}/${encodedPath}`;
}

/**
 * Extract the first non-badge image from README content.
 *
 * Supports both markdown `![alt](url)` and HTML `<img src="url">` formats.
 *
 * @param {string} content — raw README.md text
 * @param {string} owner
 * @param {string} repo
 * @param {string} branch
 * @returns {string}  absolute image URL or empty string
 */
function extractReadmeImage(content, owner, repo, branch) {
  if (!content) return "";

  // Collect candidate image URLs from markdown and HTML patterns
  const candidates = [];

  // Markdown images: ![alt](url)
  const mdImageRe = /!\[[^\]]*\]\(([^)]+)\)/g;
  let match;
  while ((match = mdImageRe.exec(content)) !== null) {
    candidates.push(match[1].trim());
  }

  // HTML img tags: <img src="url"> or <img ... src='url'> or <img ... src=url>
  const htmlImageRe = /<img\s[^>]*?src\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*))/gi;
  while ((match = htmlImageRe.exec(content)) !== null) {
    const src = (match[1] || match[2] || match[3] || "").trim();
    if (src) candidates.push(src);
  }

  // Return the first non-badge image
  for (const raw of candidates) {
    if (isBadgeUrl(raw)) continue;

    const resolved = resolveImageUrl(raw, owner, repo, branch);
    if (resolved) return resolved;
  }

  return "";
}

/**
 * Detect frameworks by scanning dependency files and GitHub topics.
 *
 * Every individual file fetch is non-fatal — a 404 is silently skipped.
 *
 * @param {string} owner
 * @param {string} repo
 * @param {string} branch
 * @param {string[]} topics        — GitHub repository topics
 * @param {string}   readmeContent — already-fetched README text
 * @returns {Promise<string[]>}  deduplicated array of framework tag names
 */
async function detectFrameworks(owner, repo, branch, topics, readmeContent) {
  const eo = encodeURIComponent(owner);
  const er = encodeURIComponent(repo);
  const eb = encodeURIComponent(branch);

  // Determine which files we actually need to fetch
  const neededFiles = new Set();
  for (const d of FRAMEWORK_DETECTORS) {
    for (const f of d.files) neededFiles.add(f);
  }

  // Fetch all dependency files in parallel (non-fatal)
  /** @type {Record<string, string>} */
  const fileContents = {};

  const fetchPromises = Array.from(neededFiles).map(async (filename) => {
    const maxSize =
      filename === "package.json" || filename === "pom.xml"
        ? MAX_DEP_FILE_BYTES
        : MAX_README_BYTES; // 50 KB for others
    try {
      const body = await fetchHttps(
        `https://raw.githubusercontent.com/${eo}/${er}/${eb}/${encodeURIComponent(filename)}`,
        { maxSize }
      );
      fileContents[filename] = body;
    } catch {
      // File not found or error — skip silently
    }
  });

  await Promise.all(fetchPromises);

  const detected = new Set();
  const topicsLower = (topics || []).map((t) => t.toLowerCase());
  const readmeLower = (readmeContent || "").toLowerCase();

  for (const detector of FRAMEWORK_DETECTORS) {
    // Check GitHub topics
    if (topicsLower.includes(detector.tag.toLowerCase())) {
      detected.add(detector.tag);
      continue;
    }

    // Check dependency file contents
    let found = false;
    for (const filename of detector.files) {
      const content = fileContents[filename];
      if (!content) continue;

      const contentLower = content.toLowerCase();
      for (const pattern of detector.patterns) {
        if (contentLower.includes(pattern.toLowerCase())) {
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (found) {
      detected.add(detector.tag);
      continue;
    }

    // Fallback: check README for prominent mention
    if (readmeLower) {
      for (const pattern of detector.patterns) {
        if (readmeLower.includes(pattern.toLowerCase())) {
          detected.add(detector.tag);
          break;
        }
      }
    }
  }

  return Array.from(detected);
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
    previewImage: "",
  };

  let defaultBranch = "main";
  let topics = [];

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

    topics = repoData.topics || [];
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

  // ---- README (title + preview image) --------------------------------------
  let readmeContent = "";
  try {
    readmeContent = await fetchReadme(owner, repo, defaultBranch);
    if (!result.title) {
      const readmeTitle = extractReadmeTitle(readmeContent);
      if (readmeTitle) {
        result.title = sanitize(readmeTitle, 200);
      }
    }

    const previewImage = extractReadmeImage(
      readmeContent,
      owner,
      repo,
      defaultBranch
    );
    if (previewImage) {
      result.previewImage = previewImage;
    }
  } catch {
    // README not available — non-fatal
  }

  // ---- Framework detection ------------------------------------------------
  try {
    result.frameworks = await detectFrameworks(
      owner,
      repo,
      defaultBranch,
      topics,
      readmeContent
    );
  } catch {
    // Framework detection failed — non-fatal
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
if (require.main === module) {
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
  fetchReadme,
  fetchReadmeTitle,
  extractReadmeTitle,
  extractReadmeImage,
  detectFrameworks,
  LANGUAGE_MAP,
  AZURE_SERVICE_MAP,
  MICROSOFT_ORGS,
  FRAMEWORK_DETECTORS,
};

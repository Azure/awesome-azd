#!/usr/bin/env node

/**
 * Shared utilities for the template/extension discovery scripts.
 * Extracted to avoid code duplication between discover-templates.js
 * and discover-extensions.js.
 */

const MAX_RESULTS_PER_QUERY = 300;
const API_DELAY_MS = 6000;
const PER_PAGE = 100;

/**
 * Known Microsoft GitHub organizations used to tag templates/extensions
 * as "msft" vs "community".
 */
const MICROSOFT_ORGS = new Set([
  "azure",
  "azure-samples",
  "microsoft",
  "microsoftdocs",
  "azure-app-service",
  "azure-for-startups",
]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Normalize a URL for comparison: lowercase, strip trailing slashes and .git suffix.
 */
function normalizeUrl(url) {
  if (!url) return "";
  return url.toLowerCase().replace(/\/+$/, "").replace(/\.git$/, "");
}

/**
 * Make an authenticated request to the GitHub API.
 * @param {string} endpoint - Full URL or path starting with /
 * @param {string} token - GitHub token
 * @returns {Promise<object>} Parsed JSON response
 */
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

/**
 * Search GitHub code with pagination and rate-limit delays.
 */
async function searchCode(query, token) {
  const results = [];
  let page = 1;

  while (results.length < MAX_RESULTS_PER_QUERY) {
    await sleep(API_DELAY_MS);
    try {
      const data = await githubApi(
        `/search/code?q=${encodeURIComponent(query)}&per_page=${PER_PAGE}&page=${page}`,
        token,
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

/**
 * Fetch repository details from the GitHub API.
 */
async function getRepoDetails(owner, repo, token) {
  return githubApi(`/repos/${owner}/${repo}`, token);
}

/**
 * Safely parse JSON with a fallback value.
 * @param {string} text - Raw JSON string
 * @param {*} fallback - Value to return on parse failure
 * @returns {*} Parsed object or fallback
 */
function safeJsonParse(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

/**
 * Sanitize a string for use in a Git branch name.
 * Replaces characters that are invalid in branch names with hyphens.
 */
function sanitizeBranchName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

/**
 * Escape markdown special characters in a string to prevent
 * table breakage and formatting injection.
 * Escapes: | [ ] ( ) ` * _ ~ > #
 */
function escapeMarkdown(text) {
  if (!text) return "";
  return String(text)
    .replace(/\|/g, "\\|")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/`/g, "\\`")
    .replace(/\*/g, "\\*")
    .replace(/_/g, "\\_")
    .replace(/~/g, "\\~")
    .replace(/>/g, "\\>")
    .replace(/#/g, "\\#");
}

/**
 * Deduplicate search results by repository full name.
 * @param {Array} items - GitHub search result items
 * @returns {Array} Deduplicated items (first occurrence per repo)
 */
function deduplicateByRepo(items) {
  const seen = new Set();
  const unique = [];
  for (const item of items) {
    const repoFullName = item.repository.full_name;
    if (seen.has(repoFullName)) continue;
    seen.add(repoFullName);
    unique.push(item);
  }
  return unique;
}

/**
 * Parse MAX_PRS env var and return a capped slice of the discovered array.
 * Handles NaN and negative values safely.
 * @param {Array} discovered - Full array of discovered items
 * @param {string} label - Human label for logging (e.g., "templates")
 * @returns {Array} Capped array of items to process
 */
function applyCap(discovered, label) {
  const raw = process.env.MAX_PRS || "0";
  let maxPRs = parseInt(raw, 10);
  if (isNaN(maxPRs) || maxPRs < 0) {
    console.warn(`Invalid MAX_PRS="${raw}" — defaulting to 5`);
    maxPRs = 5;
  }
  const limit = maxPRs > 0 ? maxPRs : discovered.length;
  const candidates = discovered.slice(0, limit);
  console.log(
    `Creating PRs for ${candidates.length} of ${discovered.length} ${label}` +
      (maxPRs > 0 ? ` (capped at ${maxPRs})` : ""),
  );
  return candidates;
}

module.exports = {
  MAX_RESULTS_PER_QUERY,
  API_DELAY_MS,
  PER_PAGE,
  MICROSOFT_ORGS,
  sleep,
  normalizeUrl,
  githubApi,
  searchCode,
  getRepoDetails,
  safeJsonParse,
  sanitizeBranchName,
  escapeMarkdown,
  deduplicateByRepo,
  applyCap,
};

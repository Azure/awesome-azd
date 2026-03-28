#!/usr/bin/env node

/**
 * Validates an azd template source repository.
 * Usage: node validate-template.js <source-repo-url>
 *
 * Validates:
 * - URL syntax and protocol (SSRF protection)
 * - GitHub repository existence via the GitHub API
 * - Generates a UUID v4 for the template entry
 */

const crypto = require("crypto");

/**
 * Canonicalizes a GitHub repository URL to https://github.com/{owner}/{repo}.
 * Strips www. prefix, removes .git suffix and trailing slashes,
 * and rejects extra path segments (e.g. /tree/main).
 * @param {string} rawUrl - Raw GitHub URL
 * @returns {string} Canonical URL
 * @throws {Error} If the URL is malformed or has extra path segments
 */
function canonicalizeUrl(rawUrl) {
  const parsed = new URL(rawUrl);
  const hostname = parsed.hostname.replace(/^www\./, "");
  const cleanPath = parsed.pathname
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/\.git$/, "");
  const parts = cleanPath.split("/").filter(Boolean);
  if (parts.length < 2) {
    throw new Error(
      "Invalid GitHub repository URL. Expected format: https://github.com/{owner}/{repo}"
    );
  }
  if (parts.length > 2) {
    throw new Error(
      `URL contains extra path segments beyond /{owner}/{repo}. Got: "${parsed.pathname}"`
    );
  }
  return `https://${hostname}/${parts[0]}/${parts[1]}`;
}

/**
 * Validates and fetches a GitHub repository to confirm it exists.
 * @param {string} sourceUrl - GitHub repository URL
 * @returns {Promise<{valid: boolean, repoExists: boolean, sourceUrl: string, generatedId: string, errors: string[]}>}
 */
async function validateTemplate(sourceUrl) {
  const errors = [];

  // Validate URL format and protocol (SSRF protection)
  let parsed;
  try {
    parsed = new URL(sourceUrl);
    if (parsed.protocol !== "https:") {
      errors.push(
        `Unsafe protocol "${parsed.protocol}". Only https: is allowed.`
      );
      return {
        valid: false,
        repoExists: false,
        sourceUrl,
        generatedId: "",
        errors,
      };
    }
  } catch (err) {
    errors.push(`Invalid URL: "${sourceUrl}"`);
    return {
      valid: false,
      repoExists: false,
      sourceUrl,
      generatedId: "",
      errors,
    };
  }

  // Validate it is a GitHub URL
  if (
    parsed.hostname !== "github.com" &&
    parsed.hostname !== "www.github.com"
  ) {
    errors.push(
      `URL must be a GitHub repository (github.com). Got: "${parsed.hostname}"`
    );
    return {
      valid: false,
      repoExists: false,
      sourceUrl,
      generatedId: "",
      errors,
    };
  }

  // Canonicalize URL: strip www., remove .git suffix, trailing slashes, reject extra segments
  let canonicalUrl;
  try {
    canonicalUrl = canonicalizeUrl(sourceUrl);
  } catch (err) {
    errors.push(err.message);
    return {
      valid: false,
      repoExists: false,
      sourceUrl,
      generatedId: "",
      errors,
    };
  }

  const canonicalParts = canonicalUrl.replace("https://github.com/", "").split("/");
  const owner = canonicalParts[0];
  const repo = canonicalParts[1];
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

  // Fetch repository to verify it exists
  let repoExists = false;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const headers = { "User-Agent": "awesome-azd-template-validator" };
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers,
    });

    if (response.ok) {
      repoExists = true;
    } else if (response.status === 404) {
      errors.push(
        `Repository not found: ${owner}/${repo}. Ensure the repository exists and is public.`
      );
    } else {
      errors.push(
        `GitHub API returned status ${response.status} for ${owner}/${repo}`
      );
    }
  } catch (err) {
    if (err.name === "AbortError") {
      errors.push("Request timed out while checking repository existence");
    } else {
      errors.push(`Failed to check repository: ${err.message}`);
    }
  } finally {
    clearTimeout(timeout);
  }

  const generatedId = errors.length === 0 ? crypto.randomUUID() : "";

  return {
    valid: errors.length === 0,
    repoExists,
    sourceUrl: canonicalUrl,
    generatedId,
    errors,
  };
}

// CLI entry point
if (typeof require !== "undefined" && require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node validate-template.js <source-repo-url>");
    process.exit(1);
  }

  validateTemplate(url)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.valid ? 0 : 1);
    })
    .catch((err) => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { validateTemplate, canonicalizeUrl };

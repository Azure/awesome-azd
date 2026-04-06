#!/usr/bin/env node

"use strict";

/**
 * @module update-templates-json
 * @description
 * Appends a validated template entry to website/static/templates.json.
 * Performs duplicate detection via URL canonicalization, input sanitization,
 * and URL safety validation before writing.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const {
  validateUrl,
  canonicalizeUrl,
} = require("./validate-template");
const { writeOutputs } = require("./github-output");

/**
 * Load the set of known tag keys from tags.tsx TagType union.
 * Returns a Set of lowercase tag strings, or null if the file cannot be read.
 */
function loadKnownTags() {
  try {
    const tagsPath = path.resolve(__dirname, "../src/data/tags.tsx");
    const content = fs.readFileSync(tagsPath, "utf8");
    const matches = content.match(/\|\s*"([^"]+)"/g);
    if (!matches) return null;
    return new Set(matches.map((m) => m.replace(/\|\s*"/, "").replace(/"$/, "")));
  } catch {
    return null;
  }
}

/**
 * Strip HTML tags, angle brackets, null bytes, and Unicode bidi overrides.
 * Trim and truncate to maxLength.
 * @param {string} value
 * @param {number} maxLength
 * @returns {string}
 */
function sanitize(value, maxLength) {
  return value
    .replace(/\x00/g, "")
    .replace(/[\u00AD\u034F\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g, "")
    .replace(/<[^>]*>?/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Parse a comma-separated tag string into a clean array.
 *
 * - Filters characters to an alphanumeric + punctuation allowlist
 * - Limits each tag to 50 chars and the list to 20 tags
 * - Treats `_No response_` as empty
 *
 * @param {string} csv
 * @returns {string[]}
 */
function parseTags(csv) {
  if (!csv || csv === "_No response_") return [];
  const knownTags = loadKnownTags();
  return csv
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) =>
      t
        .replace(/[^a-zA-Z0-9._\-+ ]/g, "")
        .replace(/\s+/g, "")
        .toLowerCase()
        .trim()
        .slice(0, 50)
    )
    .filter((t) => t.length > 0)
    .filter((t) => {
      if (knownTags && !knownTags.has(t)) {
        console.warn(`Warning: unknown tag "${t}" is not defined in tags.tsx`);
      }
      return true;
    })
    .slice(0, 20);
}

/**
 * Build and append a new template entry to templates.json.
 *
 * @param {object} options
 * @param {string} options.sourceRepo
 * @param {string} options.title
 * @param {string} options.description
 * @param {string} options.author
 * @param {string} options.authorUrl
 * @param {string} options.authorType
 * @param {string} options.previewImage
 * @param {string} options.iacProvider
 * @param {string[]} options.languages
 * @param {string[]} options.frameworks
 * @param {string[]} options.azureServices
 * @param {string} [options.templatesPath] - Override path for testing
 * @param {function} [options.uuidGenerator] - Override UUID generation for testing
 * @returns {{ skipped: boolean, skipReason?: string, added?: string }}
 */

function updateTemplatesJson({
  sourceRepo,
  title,
  description,
  author,
  authorUrl,
  authorType,
  previewImage,
  iacProvider,
  languages,
  frameworks,
  azureServices,
  templatesPath,
  uuidGenerator,
}) {
  // Defense-in-depth: sanitize fields even if caller already cleaned them
  const _sanitize = (v, max) => sanitize(String(v || ""), max);

  validateUrl(sourceRepo, "Source repo");
  if (!authorUrl) throw new Error("Author URL is required");
  validateUrl(authorUrl, "Author");
  if (previewImage) validateUrl(previewImage, "Preview image");

  const resolvedPath =
    templatesPath || path.join("website", "static", "templates.json");
  let templates;
  try {
    templates = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
    if (!Array.isArray(templates)) {
      throw new Error("templates.json must contain a JSON array");
    }
  } catch (err) {
    throw new Error(`Failed to parse ${resolvedPath}: ${err.message}`);
  }

  const canonicalSource = canonicalizeUrl(sourceRepo);
  const duplicate = templates.find(
    (t) => canonicalizeUrl(t.source) === canonicalSource
  );
  if (duplicate) {
    return {
      skipped: true,
      skipReason: `Template with source ${sourceRepo} already exists ("${duplicate.title}")`,
    };
  }

  let iac;
  if (iacProvider === "Both") {
    iac = ["bicep", "terraform"];
  } else if (iacProvider === "Terraform") {
    iac = ["terraform"];
  } else if (iacProvider === "Bicep") {
    iac = ["bicep"];
  } else {
    iac = [];
  }

  const tags =
    authorType === "Microsoft" ? ["msft", "new"] : ["community", "new"];

  const generateId = uuidGenerator || (() => crypto.randomUUID());

  const entry = {
    title: _sanitize(title, 200),
    description: _sanitize(description, 500),
    preview: previewImage ? _sanitize(previewImage, 500) : "",
    authorUrl: _sanitize(authorUrl, 500),
    author: _sanitize(author, 100),
    source: canonicalSource,
    tags,
    IaC: iac,
    id: generateId(),
  };

  if (languages.length > 0) entry.languages = languages;
  if (frameworks.length > 0) entry.frameworks = frameworks;
  if (azureServices.length > 0) entry.azureServices = azureServices;

  templates.push(entry);
  fs.writeFileSync(resolvedPath, JSON.stringify(templates, null, 2) + "\n");

  return { skipped: false, added: title };
}

// --- CLI entry point ---
if (require.main === module) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    console.error("GITHUB_OUTPUT environment variable is not set");
    process.exit(1);
  }

  try {
    const result = updateTemplatesJson({
      sourceRepo: process.env.TPL_SOURCE_REPO,
      title: sanitize(process.env.TPL_TITLE || "", 200),
      description: sanitize(process.env.TPL_DESCRIPTION || "", 500),
      author: sanitize(process.env.TPL_AUTHOR || "", 100),
      authorUrl: process.env.TPL_AUTHOR_URL,
      authorType: process.env.TPL_AUTHOR_TYPE,
      previewImage: process.env.TPL_PREVIEW_IMAGE,
      iacProvider: process.env.TPL_IAC_PROVIDER,
      languages: parseTags(process.env.TPL_LANGUAGES),
      frameworks: parseTags(process.env.TPL_FRAMEWORKS),
      azureServices: parseTags(process.env.TPL_AZURE_SERVICES),
    });

    if (result.skipped) {
      writeOutputs(outputPath, {
        skipped: "true",
        skip_reason: result.skipReason,
      });
    } else {
      writeOutputs(outputPath, {
        skipped: "false",
        added: result.added,
      });
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { sanitize, parseTags, updateTemplatesJson };

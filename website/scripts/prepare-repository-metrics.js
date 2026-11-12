#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const REPOSITORY_METRICS_SCHEMA_VERSION = 1;
const DEFAULT_MAX_AGE_HOURS = 48;
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;

function isPlainObject(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function formatValues(values) {
  const displayed = values.slice(0, 10);
  const suffix =
    values.length > displayed.length
      ? `, and ${values.length - displayed.length} more`
      : "";
  return `${displayed.join(", ")}${suffix}`;
}

function assertExactKeys(value, expectedKeys, field) {
  if (!isPlainObject(value)) {
    throw new Error(`${field} must be an object.`);
  }

  const actualKeys = Object.keys(value).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();
  const missing = sortedExpectedKeys.filter(
    (key) => !actualKeys.includes(key)
  );
  const unexpected = actualKeys.filter(
    (key) => !sortedExpectedKeys.includes(key)
  );

  if (missing.length > 0 || unexpected.length > 0) {
    const details = [];
    if (missing.length > 0) {
      details.push(`missing: ${formatValues(missing)}`);
    }
    if (unexpected.length > 0) {
      details.push(`unexpected: ${formatValues(unexpected)}`);
    }
    throw new Error(`${field} has invalid fields (${details.join("; ")}).`);
  }
}

function readCanonicalIsoDate(value, field) {
  if (typeof value !== "string") {
    throw new Error(`${field} must be a canonical ISO date string.`);
  }

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== value) {
    throw new Error(`${field} must be a canonical ISO date string.`);
  }

  return timestamp;
}

function readNonNegativeInteger(value, field) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer.`);
  }
  return value;
}

function normalizeRepositorySource(source) {
  if (typeof source !== "string") {
    throw new Error("Template source must be a GitHub repository URL.");
  }

  let url;
  try {
    url = new URL(source);
  } catch {
    throw new Error(`Invalid template source URL: ${source}`);
  }

  const hostname = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:" ||
    (hostname !== "github.com" && hostname !== "www.github.com")
  ) {
    throw new Error(`Template source must use https://github.com: ${source}`);
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) {
    throw new Error(`Template source must identify a GitHub repository: ${source}`);
  }

  const owner = parts[0].toLowerCase();
  const repository = parts[1].replace(/\.git$/i, "").toLowerCase();
  if (
    !/^[a-z0-9](?:[a-z0-9-]{0,38})$/.test(owner) ||
    !/^[a-z0-9._-]+$/.test(repository)
  ) {
    throw new Error(`Template source must identify one GitHub repository: ${source}`);
  }

  return `${owner}/${repository}`;
}

function getExpectedRepositorySlugs(templates) {
  if (!Array.isArray(templates) || templates.length === 0) {
    throw new Error("Template catalog must be a non-empty array.");
  }

  const repositories = new Set();
  templates.forEach((template, index) => {
    if (!isPlainObject(template)) {
      throw new Error(`Template catalog entry ${index} must be an object.`);
    }

    try {
      repositories.add(normalizeRepositorySource(template.source));
    } catch (error) {
      throw new Error(
        `Template catalog entry ${index} has an invalid source: ${error.message}`
      );
    }
  });

  return [...repositories].sort();
}

function validateRepositoryMetricsAggregate(
  aggregate,
  expectedRepositorySlugs,
  options = {}
) {
  const now = options.now ?? new Date();
  const maxAgeHours = options.maxAgeHours ?? DEFAULT_MAX_AGE_HOURS;

  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new Error("now must be a valid date.");
  }
  if (!Number.isFinite(maxAgeHours) || maxAgeHours <= 0) {
    throw new Error("maxAgeHours must be a positive number.");
  }
  if (
    !Array.isArray(expectedRepositorySlugs) ||
    expectedRepositorySlugs.length === 0
  ) {
    throw new Error("Expected repository coverage must not be empty.");
  }

  assertExactKeys(
    aggregate,
    ["schemaVersion", "generatedAt", "repositories"],
    "Repository metrics aggregate"
  );

  if (aggregate.schemaVersion !== REPOSITORY_METRICS_SCHEMA_VERSION) {
    throw new Error(
      `Repository metrics schemaVersion must be ${REPOSITORY_METRICS_SCHEMA_VERSION}.`
    );
  }

  const nowTimestamp = now.getTime();
  const generatedAtTimestamp = readCanonicalIsoDate(
    aggregate.generatedAt,
    "generatedAt"
  );
  if (generatedAtTimestamp > nowTimestamp) {
    throw new Error("generatedAt must not be in the future.");
  }

  const ageMs = nowTimestamp - generatedAtTimestamp;
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  if (ageMs > maxAgeMs) {
    throw new Error(
      `Repository metrics are stale: generatedAt is older than ${maxAgeHours} hours.`
    );
  }

  if (!isPlainObject(aggregate.repositories)) {
    throw new Error("repositories must be an object.");
  }

  const expectedSlugs = [...new Set(expectedRepositorySlugs)].sort();
  const actualSlugs = Object.keys(aggregate.repositories).sort();
  const missing = expectedSlugs.filter((slug) => !actualSlugs.includes(slug));
  const unexpected = actualSlugs.filter((slug) => !expectedSlugs.includes(slug));
  if (missing.length > 0 || unexpected.length > 0) {
    const details = [];
    if (missing.length > 0) {
      details.push(`missing: ${formatValues(missing)}`);
    }
    if (unexpected.length > 0) {
      details.push(`unexpected: ${formatValues(unexpected)}`);
    }
    throw new Error(
      `Repository metrics coverage does not match templates.json (${details.join(
        "; "
      )}).`
    );
  }

  const repositories = {};
  for (const slug of expectedSlugs) {
    if (
      normalizeRepositorySource(`https://github.com/${slug}`) !== slug
    ) {
      throw new Error(`Repository slug must be canonical: ${slug}.`);
    }

    const metrics = aggregate.repositories[slug];
    assertExactKeys(metrics, ["stars", "forks", "updatedOn"], slug);

    const updatedOnTimestamp = readCanonicalIsoDate(
      metrics.updatedOn,
      `${slug}.updatedOn`
    );
    if (updatedOnTimestamp > nowTimestamp) {
      throw new Error(`${slug}.updatedOn must not be in the future.`);
    }

    repositories[slug] = {
      stars: readNonNegativeInteger(metrics.stars, `${slug}.stars`),
      forks: readNonNegativeInteger(metrics.forks, `${slug}.forks`),
      updatedOn: metrics.updatedOn,
    };
  }

  return {
    schemaVersion: REPOSITORY_METRICS_SCHEMA_VERSION,
    generatedAt: aggregate.generatedAt,
    repositories,
  };
}

function readMetricsUrl(value) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error("REPOSITORY_METRICS_URL is required.");
  }

  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("REPOSITORY_METRICS_URL must be a valid URL.");
  }

  if (url.protocol !== "https:") {
    throw new Error("REPOSITORY_METRICS_URL must use HTTPS.");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(
      "REPOSITORY_METRICS_URL must be a public URL without credentials, query parameters, or fragments."
    );
  }
  if (!url.pathname.endsWith(".json")) {
    throw new Error("REPOSITORY_METRICS_URL must identify a JSON file.");
  }

  return url.href;
}

async function readResponseText(response) {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
    throw new Error("Repository metrics response is too large.");
  }

  if (!response.body || typeof response.body.getReader !== "function") {
    const text = await response.text();
    if (Buffer.byteLength(text) > MAX_RESPONSE_BYTES) {
      throw new Error("Repository metrics response is too large.");
    }
    return text;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let byteLength = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    byteLength += value.byteLength;
    if (byteLength > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error("Repository metrics response is too large.");
    }
    chunks.push(Buffer.from(value));
  }

  return Buffer.concat(chunks, byteLength).toString("utf8");
}

async function downloadRepositoryMetrics(sourceUrl, fetchImpl = fetch) {
  const url = readMetricsUrl(sourceUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetchImpl(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Azure-awesome-azd-release",
      },
      redirect: "error",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Repository metrics request failed with HTTP ${response.status}.`
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
      throw new Error(
        `Repository metrics response must use application/json, received "${contentType || "unknown"}".`
      );
    }

    const content = await readResponseText(response);
    try {
      return JSON.parse(content);
    } catch {
      throw new Error("Repository metrics response is not valid JSON.");
    }
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        `Repository metrics request timed out after ${REQUEST_TIMEOUT_MS}ms.`
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function writeJsonAtomically(outputPath, value) {
  const directory = path.dirname(outputPath);
  const temporaryPath = `${outputPath}.${process.pid}.${randomUUID()}.tmp`;
  await fs.promises.mkdir(directory, { recursive: true });

  try {
    await fs.promises.writeFile(
      temporaryPath,
      `${JSON.stringify(value)}\n`,
      {
        encoding: "utf8",
        flag: "wx",
      }
    );
    await fs.promises.rename(temporaryPath, outputPath);
  } finally {
    await fs.promises.rm(temporaryPath, { force: true });
  }
}

async function prepareRepositoryMetrics(options = {}) {
  const catalogPath =
    options.catalogPath ??
    path.join(__dirname, "..", "static", "templates.json");
  const outputPath =
    options.outputPath ??
    path.join(__dirname, "..", "static", "repository-metrics.json");
  const maxAgeHours =
    options.maxAgeHours ?? DEFAULT_MAX_AGE_HOURS;

  let templates;
  try {
    templates = JSON.parse(await fs.promises.readFile(catalogPath, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read template catalog: ${error.message}`);
  }

  const expectedRepositorySlugs = getExpectedRepositorySlugs(templates);
  const aggregate = await downloadRepositoryMetrics(
    options.sourceUrl,
    options.fetchImpl
  );
  const sanitizedAggregate = validateRepositoryMetricsAggregate(
    aggregate,
    expectedRepositorySlugs,
    {
      maxAgeHours,
      now: options.now,
    }
  );

  await writeJsonAtomically(outputPath, sanitizedAggregate);
  return {
    outputPath,
    repositoryCount: expectedRepositorySlugs.length,
  };
}

function readMaxAgeHours(value) {
  if (value == null || value === "") {
    return DEFAULT_MAX_AGE_HOURS;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(
      "REPOSITORY_METRICS_MAX_AGE_HOURS must be a positive number."
    );
  }
  return parsed;
}

if (require.main === module) {
  prepareRepositoryMetrics({
    sourceUrl: process.env.REPOSITORY_METRICS_URL,
    maxAgeHours: readMaxAgeHours(
      process.env.REPOSITORY_METRICS_MAX_AGE_HOURS
    ),
  })
    .then(({ outputPath, repositoryCount }) => {
      console.log(
        `Prepared repository metrics for ${repositoryCount} repositories at ${path.relative(
          process.cwd(),
          outputPath
        )}.`
      );
    })
    .catch((error) => {
      console.error(`Repository metrics preparation failed: ${error.message}`);
      process.exitCode = 1;
    });
}

module.exports = {
  DEFAULT_MAX_AGE_HOURS,
  downloadRepositoryMetrics,
  getExpectedRepositorySlugs,
  normalizeRepositorySource,
  prepareRepositoryMetrics,
  readMetricsUrl,
  validateRepositoryMetricsAggregate,
};

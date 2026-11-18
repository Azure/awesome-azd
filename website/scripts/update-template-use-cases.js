#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const { canonicalizeUrl } = require("./validate-template");

const catalogUseCases = new Set([
  "Build a web app",
  "Build an API",
  "Build an AI agent",
  "Build an MCP server",
  "Chat with documents",
  "Query a database",
  "Automate a workflow",
  "Start with infrastructure",
]);

function normalizeSource(sourceRepo) {
  const canonicalSource = canonicalizeUrl(sourceRepo);
  const url = new URL(canonicalSource);
  const parts = url.pathname.split("/").filter(Boolean);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "github.com" ||
    parts.length !== 2
  ) {
    throw new Error(`Invalid GitHub repository URL: ${sourceRepo}`);
  }

  return `https://github.com/${parts[0]}/${parts[1].replace(/\.git$/i, "")}`;
}

function updateTemplateUseCases({
  sourceRepo,
  primaryUseCase,
  useCasesPath = path.join(
    "website",
    "src",
    "catalog",
    "template-use-cases.json",
  ),
}) {
  if (!catalogUseCases.has(primaryUseCase)) {
    throw new Error(`Unsupported primary use case: ${primaryUseCase}`);
  }

  let useCases;
  try {
    useCases = JSON.parse(fs.readFileSync(useCasesPath, "utf8"));
  } catch (error) {
    throw new Error(`Failed to parse ${useCasesPath}: ${error.message}`);
  }
  if (
    useCases === null ||
    Array.isArray(useCases) ||
    typeof useCases !== "object"
  ) {
    throw new Error(`${useCasesPath} must contain a JSON object`);
  }

  const normalizedSource = normalizeSource(sourceRepo);
  if (Object.hasOwn(useCases, normalizedSource)) {
    return { skipped: true, source: normalizedSource };
  }

  useCases[normalizedSource] = [primaryUseCase];
  fs.writeFileSync(useCasesPath, `${JSON.stringify(useCases, null, 2)}\n`);
  return { skipped: false, source: normalizedSource };
}

if (require.main === module) {
  try {
    updateTemplateUseCases({
      sourceRepo: process.env.TPL_SOURCE_REPO,
      primaryUseCase: process.env.TPL_PRIMARY_USE_CASE,
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { normalizeSource, updateTemplateUseCases };

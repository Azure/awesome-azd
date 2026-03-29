#!/usr/bin/env node

"use strict";

const fs = require("fs");
const { extractMetadata } = require("./extract-template-metadata");

/**
 * Merge form-supplied values with auto-extracted metadata.
 *
 * Form values (FORM_*) always take precedence.  Empty / missing form values
 * fall back to the corresponding auto-extracted value.
 *
 * The merged output is appended to $GITHUB_OUTPUT.
 */
async function main() {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    console.error("GITHUB_OUTPUT environment variable is not set");
    process.exit(1);
  }

  const sourceRepo = (process.env.SOURCE_REPO || "").trim();
  if (!sourceRepo) {
    console.error("SOURCE_REPO environment variable is required");
    process.exit(1);
  }

  let extracted = {};
  try {
    extracted = await extractMetadata(sourceRepo);
    console.log(
      "Auto-extracted metadata:",
      JSON.stringify(extracted, null, 2)
    );
  } catch (err) {
    console.warn(
      `Metadata extraction failed (non-fatal): ${err.message}`
    );
  }

  // Form values take precedence; fall back to extracted values
  const merged = {
    source_repo: sourceRepo,
    template_title:
      process.env.FORM_TITLE || extracted.title || "",
    description:
      process.env.FORM_DESCRIPTION || extracted.description || "",
    author: process.env.FORM_AUTHOR || extracted.author || "",
    author_url:
      process.env.FORM_AUTHOR_URL || extracted.authorUrl || "",
    author_type:
      process.env.FORM_AUTHOR_TYPE || extracted.authorType || "",
    preview_image: process.env.FORM_PREVIEW_IMAGE || "",
    iac_provider:
      process.env.FORM_IAC_PROVIDER || extracted.iacProvider || "",
    languages:
      process.env.FORM_LANGUAGES ||
      (extracted.languages || []).join(", "),
    frameworks:
      process.env.FORM_FRAMEWORKS ||
      (extracted.frameworks || []).join(", "),
    azure_services:
      process.env.FORM_AZURE_SERVICES ||
      (extracted.azureServices || []).join(", "),
  };

  const lines = Object.entries(merged)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  fs.appendFileSync(outputPath, lines + "\n");

  console.log("Merged metadata written to GITHUB_OUTPUT");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

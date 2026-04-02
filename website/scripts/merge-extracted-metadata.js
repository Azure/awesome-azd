#!/usr/bin/env node

"use strict";

/**
 * @module merge-extracted-metadata
 * @description
 * Merges user-supplied form values with auto-extracted repository metadata.
 * Form values always take precedence; gaps are filled by metadata extraction.
 */

const fs = require("fs");
const { extractMetadata } = require("./extract-template-metadata");
const { writeOutputs } = require("./github-output");

/**
 * Merge form-supplied values with auto-extracted metadata.
 *
 * Form values (FORM_*) always take precedence.  Empty / missing form values
 * fall back to the corresponding auto-extracted value.
 *
 * @param {Object} opts
 * @param {string} opts.sourceRepo - The template source repository URL
 * @param {Object} opts.formValues - Form-supplied values (FORM_*)
 * @param {Function} opts.extractFn - Metadata extraction function
 * @returns {Promise<Object>} Merged metadata fields
 */
async function mergeMetadata({ sourceRepo, formValues = {}, extractFn }) {
  let extracted = {};
  try {
    extracted = await extractFn(sourceRepo);
  } catch (err) {
    console.warn(
      `Metadata extraction failed (non-fatal): ${err.message}`
    );
  }

  return {
    source_repo: sourceRepo,
    template_title:
      formValues.title || extracted.title || "",
    description:
      formValues.description || extracted.description || "",
    author: formValues.author || extracted.author || "",
    author_url:
      formValues.authorUrl || extracted.authorUrl || "",
    author_type:
      formValues.authorType || extracted.authorType || "",
    preview_image: formValues.previewImage || extracted.previewImage || "",
    iac_provider:
      formValues.iacProvider || extracted.iacProvider || "",
    languages:
      formValues.languages ||
      (extracted.languages || []).join(", "),
    frameworks:
      formValues.frameworks ||
      (extracted.frameworks || []).join(", "),
    azure_services:
      formValues.azureServices ||
      (extracted.azureServices || []).join(", "),
  };
}

if (require.main === module) {
  (async () => {
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

    const merged = await mergeMetadata({
      sourceRepo,
      formValues: {
        title: process.env.FORM_TITLE,
        description: process.env.FORM_DESCRIPTION,
        author: process.env.FORM_AUTHOR,
        authorUrl: process.env.FORM_AUTHOR_URL,
        authorType: process.env.FORM_AUTHOR_TYPE,
        previewImage: process.env.FORM_PREVIEW_IMAGE,
        iacProvider: process.env.FORM_IAC_PROVIDER,
        languages: process.env.FORM_LANGUAGES,
        frameworks: process.env.FORM_FRAMEWORKS,
        azureServices: process.env.FORM_AZURE_SERVICES,
      },
      extractFn: extractMetadata,
    });

    console.log(
      "Auto-extracted metadata:",
      JSON.stringify(merged, null, 2)
    );

    writeOutputs(outputPath, merged);

    console.log("Merged metadata written to GITHUB_OUTPUT");
  })().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { mergeMetadata };

#!/usr/bin/env node

"use strict";

/**
 * @module github-output
 * @description
 * Safe helpers for writing key=value pairs to the $GITHUB_OUTPUT file.
 * Sanitizes values to prevent GitHub Actions output injection via newlines.
 */

const fs = require("fs");

/**
 * Sanitize a value for safe inclusion in GITHUB_OUTPUT.
 * Strips all C0/C1 control characters to prevent output injection.
 * @param {*} value
 * @returns {string}
 */
function sanitizeOutputValue(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/[\x00-\x1f\x7f]+/g, " ")
    .replace(/[\u200B-\u200F\u2028-\u202F\uFEFF\u2060-\u2064\u2066-\u2069]+/g, "")
    .trim();
}

/**
 * Write key=value pairs to the GITHUB_OUTPUT file.
 * Validates key names and normalizes values to prevent output injection.
 * @param {string} outputPath - File path from $GITHUB_OUTPUT
 * @param {Record<string, string>} outputs
 */
function writeOutputs(outputPath, outputs) {
  const lines = Object.entries(outputs)
    .map(([k, v]) => {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k)) {
        throw new Error(`Invalid output key: "${k}"`);
      }
      return `${k}=${sanitizeOutputValue(v)}`;
    })
    .join("\n");
  fs.appendFileSync(outputPath, lines + "\n");
}

module.exports = { sanitizeOutputValue, writeOutputs };

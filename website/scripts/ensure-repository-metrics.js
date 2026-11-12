#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");

const EMPTY_REPOSITORY_METRICS = {
  schemaVersion: 1,
  generatedAt: null,
  repositories: {},
};

async function ensureRepositoryMetricsFile(
  outputPath = path.join(
    __dirname,
    "..",
    "src",
    "catalog",
    "repository-metrics.generated.json"
  )
) {
  try {
    await fs.promises.access(outputPath, fs.constants.F_OK);
    return false;
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  try {
    await fs.promises.writeFile(
      outputPath,
      `${JSON.stringify(EMPTY_REPOSITORY_METRICS)}\n`,
      {
        encoding: "utf8",
        flag: "wx",
      }
    );
    return true;
  } catch (error) {
    if (error.code === "EEXIST") {
      return false;
    }
    throw error;
  }
}

if (require.main === module) {
  ensureRepositoryMetricsFile().catch((error) => {
    console.error(
      `Unable to prepare repository metrics fallback: ${error.message}`
    );
    process.exitCode = 1;
  });
}

module.exports = {
  EMPTY_REPOSITORY_METRICS,
  ensureRepositoryMetricsFile,
};

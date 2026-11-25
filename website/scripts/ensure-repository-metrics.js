#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");

const EMPTY_REPOSITORY_METRICS = {
  schemaVersion: 2,
  generatedAt: null,
  repositories: {},
};
const DEFAULT_MODULE_PATH = path.join(
  __dirname,
  "..",
  "src",
  "catalog",
  "repository-metrics.generated.json"
);
const DEFAULT_PUBLIC_PATH = path.join(
  __dirname,
  "..",
  "static",
  "repository-metrics.json"
);

async function ensureRepositoryMetricsFile(
  outputPath = DEFAULT_MODULE_PATH
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
      `${JSON.stringify(EMPTY_REPOSITORY_METRICS, null, 2)}\n`,
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

async function synchronizeRepositoryMetricsFiles(
  modulePath = DEFAULT_MODULE_PATH,
  publicPath = DEFAULT_PUBLIC_PATH
) {
  const created = await ensureRepositoryMetricsFile(modulePath);
  const content = await fs.promises.readFile(modulePath, "utf8");
  await fs.promises.mkdir(path.dirname(publicPath), {
    recursive: true,
  });
  await fs.promises.writeFile(publicPath, content, "utf8");
  return created;
}

if (require.main === module) {
  synchronizeRepositoryMetricsFiles().catch((error) => {
    console.error(
      `Unable to prepare repository metrics fallback: ${error.message}`
    );
    process.exitCode = 1;
  });
}

module.exports = {
  EMPTY_REPOSITORY_METRICS,
  ensureRepositoryMetricsFile,
  synchronizeRepositoryMetricsFiles,
};

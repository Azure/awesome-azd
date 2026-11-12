#!/usr/bin/env node

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const websiteRoot = path.join(__dirname, "..");
const generatedMetricsPath = path.join(
  websiteRoot,
  "src",
  "catalog",
  "repository-metrics.generated.json"
);
const fixturePath = path.join(
  websiteRoot,
  "e2e",
  "fixtures",
  "repository-metrics.json"
);

async function readOptionalFile(filePath) {
  try {
    return await fs.promises.readFile(filePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

async function restoreFile(filePath, contents) {
  if (contents === undefined) {
    await fs.promises.rm(filePath, { force: true });
    return;
  }
  await fs.promises.writeFile(filePath, contents);
}

async function buildE2eSite() {
  const originalMetrics = await readOptionalFile(generatedMetricsPath);
  const fixture = await fs.promises.readFile(fixturePath);
  let result;

  try {
    await fs.promises.writeFile(generatedMetricsPath, fixture);
    const command =
      process.platform === "win32"
        ? process.env.ComSpec ?? "cmd.exe"
        : "npm";
    const args =
      process.platform === "win32"
        ? ["/d", "/s", "/c", "npm run build"]
        : ["run", "build"];
    result = spawnSync(
      command,
      args,
      {
        cwd: websiteRoot,
        env: process.env,
        stdio: "inherit",
      }
    );
  } finally {
    await restoreFile(generatedMetricsPath, originalMetrics);
  }

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
  }
}

buildE2eSite().catch((error) => {
  console.error(`Unable to build the e2e site: ${error.message}`);
  process.exitCode = 1;
});

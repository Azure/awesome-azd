#!/usr/bin/env node

/**
 * Syncs latestVersion in extensions.json by fetching each extension's registry.json.
 * Usage: node sync-extension-versions.js
 *
 * Reads website/static/extensions.json, fetches each extension's registryUrl,
 * parses the latest version, and updates the file if any versions changed.
 * Exits with code 0 if no changes, code 0 with stdout summary if changes were made.
 */

const fs = require("fs");
const path = require("path");

const EXTENSIONS_PATH = path.join(__dirname, "..", "static", "extensions.json");

function getLatestVersion(versions) {
  if (!versions || versions.length === 0) return null;
  return versions.reduce((latest, v) => {
    if (!latest) return v;
    const aParts = latest.version.split("-");
    const bParts = v.version.split("-");
    const aNumeric = aParts[0].split(".").map(Number);
    const bNumeric = bParts[0].split(".").map(Number);
    for (let i = 0; i < 3; i++) {
      if ((bNumeric[i] || 0) > (aNumeric[i] || 0)) return v;
      if ((bNumeric[i] || 0) < (aNumeric[i] || 0)) return latest;
    }
    const aIsPreRelease = aParts.length > 1;
    const bIsPreRelease = bParts.length > 1;
    if (aIsPreRelease && !bIsPreRelease) return v;
    if (!aIsPreRelease && bIsPreRelease) return latest;
    return latest;
  });
}

async function fetchRegistry(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${url}`);
  }
  return response.json();
}

const CONCURRENCY_LIMIT = 5;

async function main() {
  const extensions = JSON.parse(fs.readFileSync(EXTENSIONS_PATH, "utf-8"));
  const updates = [];

  const tasks = extensions
    .filter((ext) => ext.registryUrl)
    .map((ext) => async () => {
      try {
        const registry = await fetchRegistry(ext.registryUrl);
        // registry.json can be {extensions: [...]}, an array, or a single object
        const entries = registry.extensions || (Array.isArray(registry) ? registry : [registry]);
        const match = entries.find((e) => e.id === ext.id);
        if (!match || !match.versions || match.versions.length === 0) return;

        const latest = getLatestVersion(match.versions);
        if (latest && latest.version !== ext.latestVersion) {
          updates.push({
            id: ext.id,
            oldVersion: ext.latestVersion,
            newVersion: latest.version,
          });
          ext.latestVersion = latest.version;
        }
      } catch (err) {
        console.error(`Warning: Failed to fetch registry for ${ext.id}: ${err.message}`);
      }
    });

  for (let i = 0; i < tasks.length; i += CONCURRENCY_LIMIT) {
    await Promise.all(tasks.slice(i, i + CONCURRENCY_LIMIT).map((t) => t()));
  }

  if (updates.length > 0) {
    fs.writeFileSync(EXTENSIONS_PATH, JSON.stringify(extensions, null, 2) + "\n");
    console.log(`Updated ${updates.length} extension(s):`);
    updates.forEach((u) => console.log(`  ${u.id}: ${u.oldVersion} → ${u.newVersion}`));
  } else {
    console.log("All extension versions are up to date.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});

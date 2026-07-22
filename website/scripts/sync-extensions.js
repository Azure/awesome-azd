#!/usr/bin/env node

/**
 * Synchronizes the built-in azd extension catalog while preserving curated
 * gallery metadata and unrelated community extensions.
 */

const fs = require("fs");
const path = require("path");
const { readExtensionRegistry } = require("./read-extension-registry");
const extensionRegistries = require("../src/data/extensionRegistries.json");

const EXTENSIONS_PATH = path.join(__dirname, "..", "static", "extensions.json");
const BUILT_IN_REGISTRY_URL = extensionRegistries.builtIn;
const BUILT_IN_SOURCE_ROOT =
  "https://github.com/Azure/azure-dev/tree/main/cli/azd/extensions";
const OBSOLETE_FIELDS = new Set([
  "namespace",
  "latestVersion",
  "platforms",
  "preview",
  "installCommand",
]);

function stripObsoleteFields(extension) {
  return Object.fromEntries(
    Object.entries(extension).filter(([field]) => !OBSOLETE_FIELDS.has(field)),
  );
}

function changedFields(previous, next) {
  const fields = new Set([...Object.keys(previous), ...Object.keys(next)]);
  return [...fields].filter(
    (field) => JSON.stringify(previous[field]) !== JSON.stringify(next[field]),
  );
}

function createBuiltInExtension(extension) {
  return {
    id: extension.id,
    displayName: extension.displayName,
    description: extension.description,
    author: "Azure Dev",
    authorUrl: "https://github.com/Azure",
    source: `${BUILT_IN_SOURCE_ROOT}/${extension.id}`,
    registryUrl: BUILT_IN_REGISTRY_URL,
    capabilities: extension.capabilities || [],
    tags: ["msft", "new"],
  };
}

function syncBuiltInExtensions(currentExtensions, registryExtensions) {
  if (!Array.isArray(currentExtensions) || !Array.isArray(registryExtensions)) {
    throw new Error("Extension catalog and registry results must both be arrays.");
  }

  const currentIds = new Set();
  for (const extension of currentExtensions) {
    if (currentIds.has(extension.id)) {
      throw new Error(`Duplicate extension id in gallery: ${extension.id}`);
    }
    currentIds.add(extension.id);
  }

  const builtIns = new Map(
    currentExtensions
      .filter((extension) => extension.registryUrl === BUILT_IN_REGISTRY_URL)
      .map((extension) => [extension.id, extension]),
  );
  const communityExtensions = currentExtensions.filter(
    (extension) => extension.registryUrl !== BUILT_IN_REGISTRY_URL,
  );
  const communityIds = new Set(communityExtensions.map((extension) => extension.id));
  const registryById = new Map();
  const registryIds = new Set();
  const added = [];
  const updated = [];

  for (const registryExtension of registryExtensions) {
    if (registryIds.has(registryExtension.id)) {
      throw new Error(`Duplicate extension id in built-in registry: ${registryExtension.id}`);
    }
    if (communityIds.has(registryExtension.id)) {
      throw new Error(
        `Built-in registry id conflicts with a community extension: ${registryExtension.id}`,
      );
    }
    registryIds.add(registryExtension.id);
    registryById.set(registryExtension.id, registryExtension);
  }

  const syncedBuiltIns = [];
  for (const existing of builtIns.values()) {
    const registryExtension = registryById.get(existing.id);
    if (!registryExtension) {
      continue;
    }

    const cleaned = stripObsoleteFields(existing);
    const synced = {
      ...cleaned,
      displayName: registryExtension.displayName,
      description: registryExtension.description,
      capabilities: registryExtension.capabilities || [],
    };
    const fields = changedFields(existing, synced);
    if (fields.length > 0) {
      updated.push({ id: registryExtension.id, fields });
    }
    syncedBuiltIns.push(synced);
  }

  for (const registryExtension of registryExtensions) {
    const existing = builtIns.get(registryExtension.id);
    if (existing) {
      continue;
    }

    added.push(registryExtension.id);
    syncedBuiltIns.push(createBuiltInExtension(registryExtension));
  }

  const cleanedCommunityExtensions = communityExtensions.map((extension) => {
    const cleaned = stripObsoleteFields(extension);
    const fields = changedFields(extension, cleaned);
    if (fields.length > 0) {
      updated.push({ id: extension.id, fields });
    }
    return cleaned;
  });

  const removed = Array.from(builtIns.keys()).filter((id) => !registryIds.has(id));
  // Existing entries retain their curated order. New built-ins follow azd's
  // list order, and community entries remain after the built-in catalog.
  const extensions = [...syncedBuiltIns, ...cleanedCommunityExtensions];

  return {
    extensions,
    changes: { added, updated, removed },
    changed: JSON.stringify(currentExtensions) !== JSON.stringify(extensions),
  };
}

function formatSummary(changes) {
  const lines = ["Synchronized the built-in azd extension catalog."];
  if (changes.added.length > 0) {
    lines.push(`- Added: ${changes.added.join(", ")}`);
  }
  if (changes.updated.length > 0) {
    lines.push(
      `- Updated: ${changes.updated
        .map(({ id, fields }) => `${id} (${fields.join(", ")})`)
        .join("; ")}`,
    );
  }
  if (changes.removed.length > 0) {
    lines.push(`- Removed: ${changes.removed.join(", ")}`);
  }
  if (lines.length === 1) {
    lines.push("- No changes.");
  }
  return lines.join("\n");
}

function writeCatalogAtomically(extensions, outputPath = EXTENSIONS_PATH) {
  const temporaryPath = `${outputPath}.${process.pid}.tmp`;
  try {
    const content = JSON.stringify(extensions, null, 2) + "\n";
    fs.writeFileSync(temporaryPath, content);
    JSON.parse(fs.readFileSync(temporaryPath, "utf-8"));
    fs.renameSync(temporaryPath, outputPath);
  } finally {
    if (fs.existsSync(temporaryPath)) {
      fs.unlinkSync(temporaryPath);
    }
  }
}

function main() {
  const currentExtensions = JSON.parse(fs.readFileSync(EXTENSIONS_PATH, "utf-8"));
  const registryExtensions = readExtensionRegistry(BUILT_IN_REGISTRY_URL);
  const result = syncBuiltInExtensions(currentExtensions, registryExtensions);
  if (result.changed) {
    writeCatalogAtomically(result.extensions);
  }
  console.log(formatSummary(result.changes));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  BUILT_IN_REGISTRY_URL,
  formatSummary,
  syncBuiltInExtensions,
  writeCatalogAtomically,
};

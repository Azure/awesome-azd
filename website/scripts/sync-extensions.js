#!/usr/bin/env node

/**
 * Synchronizes the built-in azd extension catalog while preserving curated
 * gallery metadata and unrelated community extensions.
 */

const fs = require("fs");
const path = require("path");
const {
  readExtensionRegistry,
  runAzdJson,
} = require("./read-extension-registry");
const extensionRegistries = require("../src/data/extensionRegistries.json");

const EXTENSIONS_PATH = path.join(__dirname, "..", "static", "extensions.json");
const BUILT_IN_REGISTRY_URL = extensionRegistries.builtIn;
const BUILT_IN_SOURCE_ROOT =
  "https://github.com/Azure/azure-dev/tree/main/cli/azd/extensions";

// Uses an object merge rather than a Set to collect the key union: the site's
// Babel preset compiles spreads with the iterable-is-array assumption, so
// `[...someSet]` yields the Set itself under the test transform while behaving
// correctly under plain Node. Avoiding iterable spread keeps both identical.
function changedFields(previous, next) {
  return Object.keys({ ...previous, ...next }).filter(
    (field) => JSON.stringify(previous[field]) !== JSON.stringify(next[field]),
  );
}

// The azd registry publishes no author or gallery-tag information, so new
// built-ins are seeded from their extension id. These profiles reproduce the
// curated author for all 15 extensions in the catalog today, and Foundry's tag
// set is uniform across its 10 entries. This remains a heuristic rather than a
// source of truth: the sync opens a pull request, and formatSummary tells the
// reviewer to confirm author and tags on anything newly added.
const PUBLISHER_PROFILES = [
  {
    name: "Foundry Team",
    owns: (id) => id.startsWith("azure.ai.") || id === "microsoft.foundry",
    tags: ["msft", "ai", "aifoundry"],
  },
];

const DEFAULT_PUBLISHER = { name: "Azure Dev", tags: ["msft"] };

function publisherFor(id) {
  return PUBLISHER_PROFILES.find((profile) => profile.owns(id)) || DEFAULT_PUBLISHER;
}

// Registry entries always carry a capabilities array; readExtensionRegistry
// rejects anything else, so no fallback is applied here.
function createBuiltInExtension(extension) {
  const publisher = publisherFor(extension.id);
  return {
    id: extension.id,
    displayName: extension.displayName,
    description: extension.description,
    author: publisher.name,
    authorUrl: "https://github.com/Azure",
    source: `${BUILT_IN_SOURCE_ROOT}/${extension.id}`,
    registryUrl: BUILT_IN_REGISTRY_URL,
    capabilities: extension.capabilities,
    tags: [...publisher.tags, "new"],
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

    const synced = {
      ...existing,
      displayName: registryExtension.displayName,
      description: registryExtension.description,
      capabilities: registryExtension.capabilities,
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

  const removed = Array.from(builtIns.keys()).filter((id) => !registryIds.has(id));
  // Existing entries retain their curated order. New built-ins follow azd's
  // list order, and community entries remain after the built-in catalog.
  const extensions = [...syncedBuiltIns, ...communityExtensions];

  return { extensions, changes: { added, updated, removed } };
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
  // New entries carry an author and tags inferred from their extension id,
  // since the azd registry publishes neither. Say so, rather than relying on
  // the reviewer already knowing those values are inferred. The merge note
  // matters because the workflow rebuilds this branch from the default branch
  // and force-pushes, so corrections pushed here are replaced by the next
  // scheduled run rather than carried forward.
  if (changes.added.length > 0) {
    lines.push(
      "",
      "> [!IMPORTANT]",
      `> Confirm \`author\` and \`tags\` on the newly added ${
        changes.added.length === 1 ? "entry" : "entries"
      }.`,
      "> The azd registry publishes neither, so they are inferred from the",
      "> extension id and may be wrong for a new publisher.",
      ">",
      "> Merge before the next scheduled sync: this branch is rebuilt from the",
      "> default branch each run, so corrections made here are discarded until",
      "> they land on the default branch.",
    );
  }
  return lines.join("\n");
}

function serializeCatalog(extensions) {
  return JSON.stringify(extensions, null, 2) + "\n";
}

// Replaces the catalog in a single rename so a crashed or cancelled run can
// never leave a half-written extensions.json behind.
function writeCatalogAtomically(content, outputPath) {
  const temporaryPath = `${outputPath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, content);
    fs.renameSync(temporaryPath, outputPath);
  } finally {
    if (fs.existsSync(temporaryPath)) {
      fs.unlinkSync(temporaryPath);
    }
  }
}

function main() {
  const currentContent = fs.readFileSync(EXTENSIONS_PATH, "utf-8");
  const registryExtensions = readExtensionRegistry(
    BUILT_IN_REGISTRY_URL,
    runAzdJson,
  );
  const { extensions, changes } = syncBuiltInExtensions(
    JSON.parse(currentContent),
    registryExtensions,
  );

  // Compare serialized output rather than parsed values so formatting drift in
  // the committed catalog is normalized rather than silently preserved.
  const syncedContent = serializeCatalog(extensions);
  if (syncedContent !== currentContent) {
    writeCatalogAtomically(syncedContent, EXTENSIONS_PATH);
  }
  console.log(formatSummary(changes));
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
  serializeCatalog,
  syncBuiltInExtensions,
  writeCatalogAtomically,
};

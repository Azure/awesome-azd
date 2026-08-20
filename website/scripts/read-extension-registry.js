#!/usr/bin/env node

/**
 * Reads extension metadata using azd's registry validation and resolution rules.
 * Usage: node read-extension-registry.js <registry-url>
 */

const { execFileSync } = require("child_process");
const { validateRegistryUrl } = require("../../.github/scripts/url-validation");

// `--no-prompt` matters as much as the JSON flag: without it, an ambiguous
// `azd extension show` would wait on interactive input and hang the workflow
// until the job timeout rather than failing.
const JSON_OUTPUT_ARGS = ["--output", "json", "--no-prompt"];

// No per-call timeout: the caller owns the time budget (a workflow job timeout,
// or the timeout on the process that spawns this script). Two competing budgets
// only produce confusing partial failures.
function runAzdJson(args) {
  const output = execFileSync("azd", args, {
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024,
    windowsHide: true,
  });

  // azd exits 0 but prints a plain-text notice instead of JSON in some empty
  // result cases, so report that directly rather than letting a bare
  // SyntaxError surface in an unattended workflow run.
  try {
    return JSON.parse(output);
  } catch {
    throw new Error(
      `azd ${args.join(" ")} did not return JSON. Output was: ` +
        `${output.trim().slice(0, 200) || "(empty)"}`,
    );
  }
}

/**
 * `azd extension show` marshals its result without JSON struct tags, so its keys
 * are Go field names (Name, Description, Capabilities) while `azd extension list`
 * uses tagged lowercase keys. That contract is incidental rather than declared,
 * so every mapped field is checked here: if azd's output shape ever changes, the
 * caller must fail loudly rather than write a catalog with missing metadata.
 */
function requireText(value, field, id) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(
      `azd returned no ${field} for extension "${id}". ` +
        "The 'azd extension show' JSON output may have changed shape.",
    );
  }
  return value;
}

/**
 * Reads gallery metadata for every extension in a registry.
 *
 * `execute` is a required argument rather than a defaulted one: it is the seam
 * that decides whether real azd processes are spawned, so each caller states
 * that choice explicitly. Production callers pass {@link runAzdJson}.
 *
 * @param {string} registryUrl - HTTPS raw.githubusercontent.com registry URL
 * @param {(args: string[]) => unknown} execute - Runs azd and parses its JSON
 */
function readExtensionRegistry(registryUrl, execute) {
  validateRegistryUrl(registryUrl);
  if (typeof execute !== "function") {
    throw new Error("readExtensionRegistry requires an execute function.");
  }

  // Deliberately not --strict. Strict validation turns a missing artifact
  // checksum into an error, and it walks every published version rather than
  // just the latest, so one legacy artifact upstream would block syncing
  // metadata for the whole catalog on a weekly unattended schedule. The gallery
  // only consumes latest-version display name, description, and capabilities,
  // and plain validation already rejects a registry azd considers broken.
  const validation = execute([
    "extension",
    "source",
    "validate",
    registryUrl,
    ...JSON_OUTPUT_ARGS,
  ]);
  if (!validation.valid) {
    throw new Error("azd reported that the extension registry is invalid.");
  }

  // Passing the registry URL as the source keeps locally installed extensions
  // out of the results: azd only reports installed-but-unlisted extensions when
  // their source name matches the --source filter, which a URL never does.
  const listedExtensions = execute([
    "extension",
    "list",
    "--source",
    registryUrl,
    ...JSON_OUTPUT_ARGS,
  ]);
  if (!Array.isArray(listedExtensions) || listedExtensions.length === 0) {
    throw new Error("azd returned no extensions from the registry.");
  }

  return listedExtensions.map(({ id }) => {
    requireText(id, "id", "<unknown>");

    const details = execute([
      "extension",
      "show",
      id,
      "--source",
      registryUrl,
      ...JSON_OUTPUT_ARGS,
    ]);
    // azd marshals an absent capability list as JSON null, so normalize it to an
    // empty array before the array check below.
    const capabilities = details.Capabilities ?? [];
    if (!Array.isArray(capabilities)) {
      throw new Error(`azd returned non-array capabilities for extension "${id}".`);
    }

    return {
      id,
      displayName: requireText(details.Name, "display name", id),
      description: requireText(details.Description, "description", id),
      capabilities,
    };
  });
}

function main() {
  const registryUrl = process.argv[2];
  if (!registryUrl) {
    throw new Error("Usage: node read-extension-registry.js <registry-url>");
  }

  console.log(
    JSON.stringify(readExtensionRegistry(registryUrl, runAzdJson), null, 2),
  );
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { readExtensionRegistry, runAzdJson };

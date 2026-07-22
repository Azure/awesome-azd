#!/usr/bin/env node

/**
 * Reads extension metadata using azd's registry validation and resolution rules.
 * Usage: node read-extension-registry.js <registry-url>
 */

const { execFileSync } = require("child_process");
const { validateUrl } = require("../../.github/scripts/url-validation");

const JSON_OUTPUT_ARGS = ["--output", "json", "--no-prompt"];

function runAzdJson(args) {
  const output = execFileSync("azd", args, {
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024,
    timeout: 60000,
    windowsHide: true,
  });
  return JSON.parse(output);
}

function readExtensionRegistry(registryUrl, execute = runAzdJson) {
  validateUrl(registryUrl, "registry");

  const validation = execute([
    "extension",
    "source",
    "validate",
    registryUrl,
    "--strict",
    ...JSON_OUTPUT_ARGS,
  ]);
  if (!validation.valid) {
    throw new Error("azd reported that the extension registry is invalid.");
  }

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
    const details = execute([
      "extension",
      "show",
      id,
      "--source",
      registryUrl,
      ...JSON_OUTPUT_ARGS,
    ]);

    return {
      id,
      displayName: details.Name,
      description: details.Description,
      capabilities: details.Capabilities || [],
    };
  });
}

function main() {
  const registryUrl = process.argv[2];
  if (!registryUrl) {
    throw new Error("Usage: node read-extension-registry.js <registry-url>");
  }

  console.log(JSON.stringify(readExtensionRegistry(registryUrl), null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { readExtensionRegistry };

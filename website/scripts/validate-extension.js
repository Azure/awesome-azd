#!/usr/bin/env node

/**
 * Validates an azd extension registry.json file.
 * Usage: node validate-extension.js <registry-url>
 * 
 * Fetches the registry.json from the provided URL and validates:
 * - JSON syntax
 * - Required fields (id, displayName, description, versions)
 * - Valid capabilities
 * - Semver version format
 * - Platform artifact structure
 */

const VALID_CAPABILITIES = [
  "custom-commands",
  "lifecycle-events",
  "mcp-server",
  "service-target-provider",
  "framework-service-provider",
  "metadata",
];

const VALID_PLATFORMS = [
  "windows/amd64",
  "windows/arm64",
  "darwin/amd64",
  "darwin/arm64",
  "linux/amd64",
  "linux/arm64",
];

const SEMVER_REGEX = /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?$/;

function validateExtension(ext) {
  const errors = [];

  if (!ext.id || typeof ext.id !== "string") {
    errors.push("Missing or invalid 'id' field");
  }
  if (!ext.displayName || typeof ext.displayName !== "string") {
    errors.push("Missing or invalid 'displayName' field");
  }
  if (!ext.description || typeof ext.description !== "string") {
    errors.push("Missing or invalid 'description' field");
  }
  if (!Array.isArray(ext.versions) || ext.versions.length === 0) {
    errors.push("Missing or empty 'versions' array");
  }

  if (ext.versions) {
    ext.versions.forEach((ver, i) => {
      if (!ver.version || !SEMVER_REGEX.test(ver.version)) {
        errors.push(`Version[${i}]: Invalid semver format '${ver.version}'`);
      }
      if (ver.capabilities) {
        ver.capabilities.forEach((cap) => {
          if (!VALID_CAPABILITIES.includes(cap)) {
            errors.push(`Version[${i}]: Unknown capability '${cap}'`);
          }
        });
      }
      if (ver.artifacts) {
        Object.keys(ver.artifacts).forEach((platform) => {
          if (!VALID_PLATFORMS.includes(platform)) {
            errors.push(`Version[${i}]: Unknown platform '${platform}'`);
          }
          const artifact = ver.artifacts[platform];
          if (!artifact.url) {
            errors.push(`Version[${i}]: Missing artifact URL for ${platform}`);
          }
          if (!artifact.checksum || !artifact.checksum.value) {
            errors.push(`Version[${i}]: Missing checksum for ${platform}`);
          }
        });
      }
    });
  }

  return errors;
}

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
    // Same numeric version: stable (no pre-release) beats pre-release
    const aIsPreRelease = aParts.length > 1;
    const bIsPreRelease = bParts.length > 1;
    if (aIsPreRelease && !bIsPreRelease) return v;
    if (!aIsPreRelease && bIsPreRelease) return latest;
    return latest;
  });
}

async function fetchAndValidate(registryUrl) {
  const response = await fetch(registryUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch registry: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const extensions = data.extensions || (Array.isArray(data) ? data : [data]);
  const results = [];

  for (const ext of extensions) {
    const errors = validateExtension(ext);
    const latestVersion = getLatestVersion(ext.versions);
    const platforms = latestVersion && latestVersion.artifacts
      ? Object.keys(latestVersion.artifacts)
      : [];
    const capabilities = latestVersion && latestVersion.capabilities
      ? latestVersion.capabilities
      : [];

    results.push({
      id: ext.id,
      namespace: ext.namespace || "",
      displayName: ext.displayName || "",
      description: ext.description || "",
      latestVersion: latestVersion ? latestVersion.version : "0.0.0",
      capabilities,
      platforms,
      tags: ext.tags || [],
      errors,
      valid: errors.length === 0,
    });
  }

  return results;
}

// CLI entry point
if (typeof require !== "undefined" && require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node validate-extension.js <registry-url>");
    process.exit(1);
  }

  fetchAndValidate(url)
    .then((results) => {
      console.log(JSON.stringify(results, null, 2));
      const hasErrors = results.some((r) => !r.valid);
      process.exit(hasErrors ? 1 : 0);
    })
    .catch((err) => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { fetchAndValidate, validateExtension, getLatestVersion };

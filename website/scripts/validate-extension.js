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

// SECURITY: Host allowlist to prevent SSRF attacks. Only allow fetching
// registry.json from known, trusted hosts.
const ALLOWED_HOSTS = [
  "raw.githubusercontent.com",
  "github.com",
  "marketplace.visualstudio.com",
  "registry.npmjs.org",
];

// SECURITY: Reject URLs that resolve to private/internal IP ranges.
function isPrivateHostname(hostname) {
  // Block obvious loopback/private hostnames
  if (hostname === "localhost" || hostname === "[::1]") return true;
  // Check numeric IPv4 patterns (doesn't resolve DNS - just catches literals)
  const ipv4Match = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (a === 127) return true;                     // 127.x.x.x loopback
    if (a === 10) return true;                       // 10.x.x.x private
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16-31.x.x private
    if (a === 192 && b === 168) return true;          // 192.168.x.x private
    if (a === 169 && b === 254) return true;          // 169.254.x.x link-local
    if (a === 0) return true;                          // 0.x.x.x
  }
  return false;
}

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

  if (ext.versions && Array.isArray(ext.versions)) {
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

const { getLatestVersion } = require("./semver-utils");

async function fetchAndValidate(registryUrl) {
  // Validate URL protocol to prevent SSRF
  let parsed;
  try {
    parsed = new URL(registryUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`Unsafe protocol "${parsed.protocol}". Only http: and https: are allowed.`);
    }
  } catch (err) {
    if (err.code === 'ERR_INVALID_URL') {
      throw new Error(`Invalid registry URL: "${registryUrl}"`);
    }
    throw err;
  }

  // SECURITY: Enforce host allowlist - only fetch from trusted origins
  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    throw new Error(
      `Host "${parsed.hostname}" is not in the allowlist. Allowed: ${ALLOWED_HOSTS.join(", ")}`
    );
  }

  // SECURITY: Reject private/internal IPs to prevent SSRF
  if (isPrivateHostname(parsed.hostname)) {
    throw new Error(`URL resolves to a private/internal address. Refusing to fetch.`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  let response;
  try {
    response = await fetch(registryUrl, {
      signal: controller.signal,
      redirect: 'error',  // SECURITY: Disable redirects to prevent SSRF via open redirect
    });
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch registry: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  let extensions;
  if (Array.isArray(data.extensions)) {
    extensions = data.extensions;
  } else if (typeof data.extensions === "undefined") {
    extensions = Array.isArray(data) ? data : [data];
  } else {
    throw new Error("Invalid registry format: 'extensions' must be an array.");
  }
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

module.exports = { fetchAndValidate, validateExtension };

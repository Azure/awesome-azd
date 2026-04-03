/**
 * Shared URL validation utilities for SSRF prevention.
 * Used by validate-extension.js and the extension-submission workflow.
 */

const ALLOWED_HOSTS = [
  "raw.githubusercontent.com",
  "github.com",
  "marketplace.visualstudio.com",
  "registry.npmjs.org",
];

/**
 * Check if a hostname resolves to a private/internal IP range.
 * Catches literal IP addresses only — does not perform DNS resolution.
 */
function isPrivateHostname(hostname) {
  if (hostname === "localhost" || hostname === "[::1]") return true;
  const ipv4Match = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (a === 127) return true;                       // 127.x.x.x loopback
    if (a === 10) return true;                         // 10.x.x.x private
    if (a === 172 && b >= 16 && b <= 31) return true;  // 172.16-31.x.x private
    if (a === 192 && b === 168) return true;            // 192.168.x.x private
    if (a === 169 && b === 254) return true;            // 169.254.x.x link-local
    if (a === 0) return true;                            // 0.x.x.x
  }
  return false;
}

/**
 * Validate a URL against protocol, host allowlist, and private IP checks.
 * @param {string} value - The URL to validate
 * @param {string} label - Human-readable label for error messages (e.g., "author", "registry")
 * @throws {Error} if the URL fails any check
 */
function validateUrl(value, label) {
  if (!value) return;
  let u;
  try {
    u = new URL(value);
  } catch {
    throw new Error(`Invalid ${label} URL "${value}": malformed URL`);
  }
  if (!["http:", "https:"].includes(u.protocol)) {
    throw new Error(
      `Invalid ${label} URL "${value}": unsafe protocol "${u.protocol}"`
    );
  }
  if (!ALLOWED_HOSTS.includes(u.hostname)) {
    throw new Error(
      `Invalid ${label} URL "${value}": host "${u.hostname}" is not in the allowlist`
    );
  }
  if (isPrivateHostname(u.hostname)) {
    throw new Error(
      `Invalid ${label} URL "${value}": resolves to a private/internal address`
    );
  }
}

module.exports = { ALLOWED_HOSTS, isPrivateHostname, validateUrl };

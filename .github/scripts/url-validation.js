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
  // IPv6 private ranges
  const lower = hostname.toLowerCase();
  if (lower.startsWith('::ffff:')) return true;     // IPv4-mapped IPv6 (RFC 4291 §2.5.5.2)
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true;  // unique-local fc00::/7 (RFC 4193)
  if (lower.startsWith('fe80:')) return true;         // link-local fe80::/10 (RFC 4291 §2.5.6)
  const ipv4Match = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (a === 127) return true;                       // 127.0.0.0/8 loopback (RFC 1122 §3.2.1.3)
    if (a === 10) return true;                         // 10.0.0.0/8 private (RFC 1918)
    if (a === 172 && b >= 16 && b <= 31) return true;  // 172.16.0.0/12 private (RFC 1918)
    if (a === 192 && b === 168) return true;            // 192.168.0.0/16 private (RFC 1918)
    if (a === 169 && b === 254) return true;            // 169.254.0.0/16 link-local (RFC 3927)
    if (a === 0) return true;                            // 0.0.0.0/8 "this network" (RFC 791)
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
  if (value === null || value === undefined) return null; // intentional skip
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Invalid ${label} URL: value must be a non-empty string`);
  }
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
  return u;
}

module.exports = { ALLOWED_HOSTS, isPrivateHostname, validateUrl };

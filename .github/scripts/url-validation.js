/**
 * Shared URL validation utilities for SSRF prevention.
 * Used by the extension registry metadata script and submission workflow.
 */

const ALLOWED_HOSTS = [
  "raw.githubusercontent.com",
  "github.com",
  "marketplace.visualstudio.com",
  "registry.npmjs.org",
];

// Each class of URL is checked against a fixed policy. Registries are stricter
// than everything else because their contents are fetched by azd and written
// straight into the gallery catalog, so an open redirect off an allowed host
// would land untrusted metadata in the site.
const GENERAL_URL_POLICY = {
  protocols: ["http:", "https:"],
  hosts: ALLOWED_HOSTS,
};

const REGISTRY_URL_POLICY = {
  protocols: ["https:"],
  hosts: ["raw.githubusercontent.com"],
};

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
 * Check a URL against a policy's protocol and host allowlists, plus the private
 * IP check. The policy is a required argument so every caller states which
 * policy it is applying rather than inheriting an implicit default.
 * @param {string} value - The URL to check
 * @param {string} label - Human-readable label for error messages
 * @param {{protocols: string[], hosts: string[]}} policy - Allowlists to enforce
 * @throws {Error} if the URL fails any check
 */
function checkUrl(value, label, policy) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Invalid ${label} URL: value must be a non-empty string`);
  }
  let u;
  try {
    u = new URL(value);
  } catch {
    throw new Error(`Invalid ${label} URL "${value}": malformed URL`);
  }
  if (!policy.protocols.includes(u.protocol)) {
    throw new Error(
      `Invalid ${label} URL "${value}": unsafe protocol "${u.protocol}" ` +
        `(allowed: ${policy.protocols.join(", ")})`
    );
  }
  if (!policy.hosts.includes(u.hostname)) {
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

/**
 * Validate an optional URL, such as an author or source repo link. A nullish
 * value is treated as an intentional skip.
 * @param {string} value - The URL to validate
 * @param {string} label - Human-readable label for error messages (e.g., "author")
 * @throws {Error} if a present URL fails any check
 */
function validateUrl(value, label) {
  if (value === null || value === undefined) return null; // intentional skip
  return checkUrl(value, label, GENERAL_URL_POLICY);
}

/**
 * Validate an extension registry URL. Unlike {@link validateUrl}, a missing
 * value is an error rather than an intentional skip, since every registry
 * consumer needs a concrete location to read from.
 * @param {string} value - The registry URL to validate
 * @throws {Error} if the URL is absent or fails the registry policy
 */
function validateRegistryUrl(value) {
  return checkUrl(value, "registry", REGISTRY_URL_POLICY);
}

module.exports = {
  ALLOWED_HOSTS,
  isPrivateHostname,
  validateUrl,
  validateRegistryUrl,
};

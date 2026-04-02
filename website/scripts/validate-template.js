#!/usr/bin/env node

"use strict";

/**
 * @module validate-template
 * @description
 * URL and repository validation for the template submission pipeline.
 *
 * Provides multi-layered SSRF prevention:
 *   1. URL scheme / credential / port checks  (validateUrl)
 *   2. Private-IP hostname pre-check          (isPrivateHost)
 *   3. DNS-rebinding-safe lookup              (safeLookup)
 *   4. Private-IP range matching              (isPrivateIP)
 *
 * Also validates that repositories are publicly reachable on github.com.
 */

const https = require("https");
const dns = require("dns");
const net = require("net");
const { URL } = require("url");

/**
 * IPv4 CIDR ranges classified as private, reserved, or non-routable.
 * Used by isPrivateIP() for SSRF prevention.
 * @type {RegExp[]}
 */
const PRIVATE_IPV4_RANGES = [
  // Loopback
  /^127\./,
  // RFC1918 private space
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  // Link-local
  /^169\.254\./,
  // "This" network
  /^0\./,
  // Carrier-Grade NAT (RFC 6598) 100.64.0.0/10
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  // IETF protocol assignments 192.0.0.0/24
  /^192\.0\.0\./,
  // Deprecated 6to4 relay anycast 192.88.99.0/24
  /^192\.88\.99\./,
  // Documentation ranges (RFC 5737)
  /^192\.0\.2\./,
  /^198\.51\.100\./,
  /^203\.0\.113\./,
  // Benchmarking (RFC 2544) 198.18.0.0/15
  /^198\.1[89]\./,
  // Multicast 224.0.0.0/4
  /^(22[4-9]|23\d)\./,
  // Reserved for future use 240.0.0.0/4 (includes broadcast)
  /^(24\d|25[0-5])\./,
];

/**
 * Check if a resolved IP address belongs to a private/reserved range.
 * Handles IPv4, IPv6, and IPv4-mapped IPv6 addresses.
 */
function isPrivateIP(ip) {
  if (!ip) return true; // No IP = deny by default

  if (net.isIPv4(ip)) {
    return PRIVATE_IPV4_RANGES.some((re) => re.test(ip));
  }

  if (net.isIPv6(ip)) {
    // Loopback (::1)
    if (ip === "::1") return true;
    // Unspecified (::)
    if (ip === "::") return true;
    // Link-local (fe80::/10)
    if (/^fe[89ab]/i.test(ip)) return true;
    // Unique local (fc00::/7 — fc00:: through fdff::)
    if (/^f[cd]/i.test(ip)) return true;
    // IPv4-mapped IPv6 dotted form (::ffff:x.x.x.x)
    const v4mapped = ip.match(
      /^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i
    );
    if (v4mapped) {
      return PRIVATE_IPV4_RANGES.some((re) => re.test(v4mapped[1]));
    }
    // IPv4-mapped IPv6 hex form (::ffff:HHHH:HHHH)
    const v4hex = ip.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
    if (v4hex) {
      const hi = parseInt(v4hex[1], 16);
      const lo = parseInt(v4hex[2], 16);
      const mapped = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${
        lo & 0xff
      }`;
      return PRIVATE_IPV4_RANGES.some((re) => re.test(mapped));
    }
    // IPv4-compatible IPv6 dotted form (::x.x.x.x) — deprecated by RFC 4291
    // but still recognised by Node.js net.isIPv6 and some DNS resolvers.
    const v4compat = ip.match(
      /^::(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/
    );
    if (v4compat) {
      return PRIVATE_IPV4_RANGES.some((re) => re.test(v4compat[1]));
    }
    // 6to4 (2002::/16) — encapsulates IPv4 addresses
    if (/^2002:/i.test(ip)) return true;
    // Teredo (2001:0000::/32) — tunneling protocol
    if (/^2001:0?0?0?0?:/i.test(ip)) return true;
    // NAT64 well-known prefix (64:ff9b::/96)
    if (/^64:ff9b:/i.test(ip)) return true;
    return false;
  }

  // Unknown format — deny by default
  return true;
}

/**
 * Fast pre-check: does the hostname string (as returned by WHATWG URL parser)
 * point to an obviously private/reserved address?
 *
 * @param {string} hostname
 * @returns {boolean} `true` if the hostname is a known private address
 */
function isPrivateHost(hostname) {
  if (/^localhost$/i.test(hostname)) return true;

  // Strip brackets for IPv6 literal check
  const bare = hostname.replace(/^\[|\]$/g, "");
  // net.isIP detects real IP literals (URL parser normalises hex/octal);
  // safeLookup catches DNS-resolved private IPs for non-literal hostnames.
  if (net.isIP(bare)) return isPrivateIP(bare);

  return false;
}

/**
 * Custom DNS lookup that rejects private/reserved resolved IPs.
 * Prevents DNS-rebinding attacks where a public domain resolves to an
 * internal address.
 */
function safeLookup(hostname, options, callback) {
  dns.lookup(hostname, options, (err, address, family) => {
    if (err) return callback(err);

    // Node 24+ passes {all:true} from https.request, yielding an array
    // of {address, family} objects. We must validate each and return the
    // same array format the caller expects.
    if (Array.isArray(address)) {
      for (const entry of address) {
        if (isPrivateIP(entry.address)) {
          return callback(
            new Error(
              `Hostname "${hostname}" resolves to private/reserved IP: ${entry.address}`
            )
          );
        }
      }
      if (address.length === 0) {
        return callback(new Error(`No DNS results for "${hostname}"`));
      }
      return callback(null, address, family);
    }

    if (isPrivateIP(address)) {
      return callback(
        new Error(
          `Hostname "${hostname}" resolves to private/reserved IP: ${address}`
        )
      );
    }
    callback(null, address, family);
  });
}

/**
 * Normalize a repository URL into a canonical form for deduplication.
 * Strips trailing slashes, `.git` suffix, query strings, and fragments.
 *
 * @param {string} url — raw URL to canonicalize
 * @returns {string} canonical URL suitable for equality comparison
 */
function canonicalizeUrl(url) {
  let normalized = url.trim().toLowerCase();
  normalized = normalized.replace(/\/+$/, "");
  normalized = normalized.replace(/\.git$/, "");
  normalized = normalized.replace(/\/+$/, "");
  // Strip query string and fragment to prevent duplicate-detection bypass
  try {
    const parsed = new URL(normalized);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(
      /\/+$/,
      ""
    );
  } catch {
    return normalized;
  }
}

/**
 * Validate that a URL is safe for server-side use.
 * Enforces HTTPS, no credentials, no non-standard ports, no private hosts.
 *
 * @security Primary SSRF defence gate. Every user-supplied URL must pass through this.
 * @param {string} value — URL string to validate
 * @param {string} label — human-readable label for error messages
 * @throws {Error} if any validation rule is violated
 */
function validateUrl(value, label) {
  if (!value) return;
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Invalid ${label} URL: "${value}"`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(
      `${label} URL must use HTTPS (got "${parsed.protocol}")`
    );
  }
  // Reject credentials in URLs to prevent accidental token leakage
  if (parsed.username || parsed.password) {
    throw new Error(
      `${label} URL must not contain credentials (userinfo)`
    );
  }
  if (parsed.port && parsed.port !== "443") {
    throw new Error(
      `${label} URL must not specify a non-standard port`
    );
  }
  if (isPrivateHost(parsed.hostname)) {
    throw new Error(`${label} URL points to a private/reserved address`);
  }
}

/**
 * Validate a GitHub repository URL for template submission.
 * Performs URL safety checks then an async HTTP HEAD to verify reachability.
 * Follows up to 5 redirects, validating each target for SSRF safety.
 *
 * @param {string} repoUrl — GitHub repository URL to validate
 * @returns {Promise<{ valid: boolean, errors?: string[] }>}
 */
async function validateTemplate(repoUrl) {
  if (!repoUrl || typeof repoUrl !== "string" || !repoUrl.trim()) {
    return { valid: false, errors: ["Repository URL is required"] };
  }

  const errors = [];

  try {
    validateUrl(repoUrl, "Repository");
  } catch (err) {
    errors.push(err.message);
  }

  try {
    const parsed = new URL(repoUrl);
    if (parsed.hostname !== "github.com") {
      errors.push("Repository URL must be a GitHub repository (github.com)");
    }
  } catch {
    // URL parsing already failed in validateUrl above
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const HARD_TIMEOUT_MS = 30000;
  return new Promise((resolve) => {
    const deadline = setTimeout(() => {
      resolve({ valid: false, errors: ["Validation timed out after 30s"] });
    }, HARD_TIMEOUT_MS);

    const MAX_REDIRECTS = 5;
    let redirectCount = 0;

    function done(result) {
      clearTimeout(deadline);
      resolve(result);
    }

    function makeRequest(url) {
      const parsed = new URL(url);
      const req = https.request(
        {
          hostname: parsed.hostname,
          path: parsed.pathname + parsed.search,
          method: "HEAD",
          timeout: 10000,
          lookup: safeLookup,
        },
        (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            done({ valid: true });
          } else if (
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            redirectCount++;
            if (redirectCount > MAX_REDIRECTS) {
              done({
                valid: false,
                errors: ["Too many redirects (max 5)"],
              });
              return;
            }
            const target = new URL(res.headers.location, url);
            try {
              validateUrl(target.href, "Redirect target");
            } catch (e) {
              done({ valid: false, errors: [e.message] });
              return;
            }
            if (target.hostname !== "github.com") {
              done({
                valid: false,
                errors: [
                  "Redirect target is not github.com: " + target.hostname,
                ],
              });
              return;
            }
            makeRequest(target.href);
          } else {
            done({
              valid: false,
              errors: [`Repository returned HTTP ${res.statusCode}`],
            });
          }
        }
      );
      req.on("timeout", () => {
        req.destroy();
        done({ valid: false, errors: ["Request timed out after 10s"] });
      });
      req.on("error", (err) => {
        done({ valid: false, errors: [`Request failed: ${err.message}`] });
      });
      req.end();
    }

    makeRequest(repoUrl);
  });
}

if (require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node validate-template.js <repo-url>");
    process.exit(1);
  }

  validateTemplate(url).then((result) => {
    console.log(JSON.stringify(result));
    process.exit(result.valid ? 0 : 1);
  }).catch((err) => {
    console.error(JSON.stringify({ valid: false, errors: [err.message] }));
    process.exit(1);
  });
}

module.exports = {
  validateTemplate,
  canonicalizeUrl,
  validateUrl,
  isPrivateIP,
  isPrivateHost,
  safeLookup,
};

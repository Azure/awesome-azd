#!/usr/bin/env node

const https = require("https");
const dns = require("dns");
const net = require("net");
const { URL } = require("url");

const PRIVATE_IPV4_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
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
    return false;
  }

  // Unknown format — deny by default
  return true;
}

/**
 * Fast pre-check: does the hostname string (as returned by WHATWG URL parser)
 * point to an obviously private/reserved address?
 */
function isPrivateHost(hostname) {
  if (/^localhost$/i.test(hostname)) return true;

  // Strip brackets for IPv6 literal check
  const bare = hostname.replace(/^\[|\]$/g, "");
  if (net.isIP(bare)) return isPrivateIP(bare);

  // IPv4 patterns (URL parser normalises hex/octal to dotted decimal)
  if (PRIVATE_IPV4_RANGES.some((re) => re.test(hostname))) return true;

  // Bracketed IPv6 patterns the URL parser produces
  if (/^\[::1\]$/.test(hostname)) return true;
  if (/^\[::\]$/.test(hostname)) return true;
  if (/^\[fe[89ab]/i.test(hostname)) return true;
  if (/^\[f[cd]/i.test(hostname)) return true;
  if (/^\[::ffff:/i.test(hostname)) return true;

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
  if (isPrivateHost(parsed.hostname)) {
    throw new Error(`${label} URL points to a private/reserved address`);
  }
}

function validateTemplate(repoUrl) {
  if (!repoUrl || typeof repoUrl !== "string" || !repoUrl.trim()) {
    return { valid: false, errors: ["Repository URL is required"] };
  }

  const errors = [];

  try {
    validateUrl(repoUrl, "Repository");
  } catch (err) {
    errors.push(err.message);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return new Promise((resolve) => {
    const parsed = new URL(repoUrl);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname,
        method: "HEAD",
        timeout: 10000,
        lookup: safeLookup,
      },
      (res) => {
        // Accept only 2xx — reject redirects (3xx) to prevent open-redirect abuse
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ valid: true });
        } else {
          resolve({
            valid: false,
            errors: [`Repository returned HTTP ${res.statusCode}`],
          });
        }
      }
    );
    req.on("timeout", () => {
      req.destroy();
      resolve({ valid: false, errors: ["Request timed out after 10s"] });
    });
    req.on("error", (err) => {
      resolve({ valid: false, errors: [`Request failed: ${err.message}`] });
    });
    req.end();
  });
}

if (typeof require !== "undefined" && require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node validate-template.js <repo-url>");
    process.exit(1);
  }

  Promise.resolve(validateTemplate(url)).then((result) => {
    console.log(JSON.stringify(result));
    process.exit(result.valid ? 0 : 1);
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

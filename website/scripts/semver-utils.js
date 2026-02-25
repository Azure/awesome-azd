/**
 * Shared semver utility for azd extension scripts.
 */

/**
 * Returns the latest version entry from an array of version objects.
 * Each version object must have a `version` string field (semver format).
 * Stable versions beat pre-release when numeric parts are equal.
 */
function getLatestVersion(versions) {
  if (!versions || versions.length === 0) return null;
  const valid = versions.filter(v => v && v.version);
  if (valid.length === 0) return null;
  return valid.reduce((latest, v) => {
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
    // Both pre-release with same numeric: compare lexicographically
    if (aIsPreRelease && bIsPreRelease) {
      return aParts[1] < bParts[1] ? v : latest;
    }
    return latest;
  });
}

module.exports = { getLatestVersion };

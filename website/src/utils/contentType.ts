/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Determines whether the current page should render the templates or
 * extensions gallery.
 *
 * Detection order:
 *   1. URL pathname — `/extensions` (with or without trailing slash)
 *      forces extensions view. This is the canonical signal driven by
 *      navbar navigation.
 *   2. Legacy `?type=extensions` query param — preserved so any old
 *      bookmarks or shared URLs still resolve.
 *   3. Default — templates.
 *
 * The helper is intentionally tolerant of the Docusaurus baseUrl
 * (`/awesome-azd/extensions`) by checking for an `/extensions` segment
 * anywhere in the trailing path.
 */
export function getContentType(location: {
  pathname?: string;
  search?: string;
}): "templates" | "extensions" {
  const pathname = location.pathname || "";
  // Match `/extensions`, `/extensions/`, or any baseUrl-prefixed form like
  // `/awesome-azd/extensions`.
  if (/(^|\/)extensions\/?$/.test(pathname)) {
    return "extensions";
  }
  const queryType = new URLSearchParams(location.search || "").get("type");
  if (queryType === "extensions") {
    return "extensions";
  }
  return "templates";
}

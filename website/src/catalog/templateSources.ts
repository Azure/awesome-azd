/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export function normalizeTemplateSource(source: string): string | null {
  try {
    const url = new URL(source);
    const parts = url.pathname.split("/").filter(Boolean);
    if (
      url.protocol !== "https:" ||
      url.hostname.toLowerCase() !== "github.com" ||
      parts.length !== 2 ||
      url.search ||
      url.hash
    ) {
      return null;
    }

    return `https://github.com/${parts[0].toLowerCase()}/${parts[1]
      .replace(/\.git$/i, "")
      .toLowerCase()}`;
  } catch {
    return null;
  }
}

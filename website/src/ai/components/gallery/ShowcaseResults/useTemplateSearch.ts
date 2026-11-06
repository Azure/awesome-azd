/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { useEffect, useMemo, useState } from "react";
import type { Template } from "../../../data/tags";
import { findLocalTemplateMatches } from "../../../utils/galleryFiltering";
import { fetchTemplateSearchResults } from "../../../utils/templateSearch";

const searchTimeoutMs = 3_000;

type TemplateSearchState = {
  matchingSources: string[] | null;
  isPending: boolean;
};

export function useTemplateSearch(
  searchTerm: string,
  templates: Template[],
  requestVersion: number,
): TemplateSearchState {
  const localMatches = useMemo(
    () =>
      searchTerm
        ? findLocalTemplateMatches(templates, searchTerm)
        : null,
    [searchTerm, templates],
  );
  const [remoteMatches, setRemoteMatches] = useState<{
    searchTerm: string;
    requestVersion: number;
    sources: string[] | null;
  } | null>(null);

  useEffect(() => {
    setRemoteMatches(null);
    if (!searchTerm) {
      return undefined;
    }

    let active = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), searchTimeoutMs);

    fetchTemplateSearchResults(
      searchTerm,
      controller.signal,
      templates.map((template) => template.source),
    )
      .then((sources) => {
        if (active) {
          setRemoteMatches({ searchTerm, requestVersion, sources });
        }
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error(
            "Fetching Azure Function search results failed; using local search:",
            error,
          );
        }
        setRemoteMatches({
          searchTerm,
          requestVersion,
          sources: null,
        });
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      active = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [requestVersion, searchTerm, templates]);

  const currentRemoteMatches =
    remoteMatches?.searchTerm === searchTerm &&
    remoteMatches.requestVersion === requestVersion
      ? remoteMatches
      : null;

  return {
    matchingSources: currentRemoteMatches?.sources ?? localMatches,
    isPending: Boolean(searchTerm && !currentRemoteMatches),
  };
}

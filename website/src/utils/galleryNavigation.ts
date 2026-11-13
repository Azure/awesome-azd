/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

export type GalleryNavigationState = {
  scrollTopPosition: number;
  focusedElementId: string | undefined;
};

export type GalleryReturnLocation = {
  pathname: string;
  search: string;
  hash: string;
  state: GalleryNavigationState;
};

export type TemplateDetailNavigationState = {
  galleryReturnLocation: GalleryReturnLocation;
};

export function captureGalleryNavigationState(): GalleryNavigationState | undefined {
  if (ExecutionEnvironment.canUseDOM) {
    return {
      scrollTopPosition: window.scrollY,
      focusedElementId: document.activeElement?.id,
    };
  }

  return undefined;
}

export function createTemplateDetailNavigationState(
  location: Pick<GalleryReturnLocation, "pathname" | "search" | "hash">,
  navigationState: GalleryNavigationState | undefined,
): TemplateDetailNavigationState | undefined {
  return navigationState === undefined
    ? undefined
    : {
        galleryReturnLocation: {
          ...location,
          state: navigationState,
        },
      };
}

export function getGalleryReturnLocation(
  value: unknown,
): GalleryReturnLocation | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const returnLocation = (
    value as Partial<TemplateDetailNavigationState>
  ).galleryReturnLocation;
  if (
    typeof returnLocation !== "object" ||
    returnLocation === null ||
    typeof returnLocation.pathname !== "string" ||
    !returnLocation.pathname.startsWith("/") ||
    returnLocation.pathname.startsWith("//") ||
    !/(^|\/)templates\/?$/.test(returnLocation.pathname) ||
    typeof returnLocation.search !== "string" ||
    (returnLocation.search !== "" &&
      !returnLocation.search.startsWith("?")) ||
    typeof returnLocation.hash !== "string" ||
    (returnLocation.hash !== "" &&
      !returnLocation.hash.startsWith("#")) ||
    typeof returnLocation.state !== "object" ||
    returnLocation.state === null ||
    !Number.isFinite(returnLocation.state.scrollTopPosition) ||
    returnLocation.state.scrollTopPosition < 0 ||
    (returnLocation.state.focusedElementId !== undefined &&
      typeof returnLocation.state.focusedElementId !== "string")
  ) {
    return undefined;
  }

  return {
    pathname: returnLocation.pathname,
    search: returnLocation.search,
    hash: returnLocation.hash,
    state: {
      scrollTopPosition: returnLocation.state.scrollTopPosition,
      focusedElementId: returnLocation.state.focusedElementId,
    },
  };
}

export function restoreGalleryNavigationState(
  navigationState: GalleryNavigationState | null | undefined,
): void {
  const { scrollTopPosition, focusedElementId } = navigationState ?? {
    scrollTopPosition: 0,
    focusedElementId: undefined,
  };
  // Preserve the existing DOMString coercion when the focus id is absent.
  document.getElementById(String(focusedElementId))?.focus();
  window.scrollTo({ top: scrollTopPosition });
}

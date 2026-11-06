/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

export type GalleryNavigationState = {
  scrollTopPosition: number;
  focusedElementId?: string;
};

export function captureGalleryNavigationState():
  | GalleryNavigationState
  | undefined {
  if (!ExecutionEnvironment.canUseDOM) {
    return undefined;
  }

  return {
    scrollTopPosition: window.scrollY,
    focusedElementId: document.activeElement?.id,
  };
}

export function restoreGalleryNavigationState(
  state: GalleryNavigationState | null,
) {
  const { scrollTopPosition = 0, focusedElementId } = state ?? {};
  if (focusedElementId) {
    document.getElementById(focusedElementId)?.focus();
  }
  window.scrollTo({ top: scrollTopPosition });
}

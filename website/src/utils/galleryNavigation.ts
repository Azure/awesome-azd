/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

export type UserState = {
  scrollTopPosition: number;
  focusedElementId: string | undefined;
};

export function prepareUserState(): UserState | undefined {
  if (ExecutionEnvironment.canUseDOM) {
    return {
      scrollTopPosition: window.scrollY,
      focusedElementId: document.activeElement?.id,
    };
  }

  return undefined;
}

export function restoreUserState(
  userState: UserState | null | undefined,
): void {
  const { scrollTopPosition, focusedElementId } = userState ?? {
    scrollTopPosition: 0,
    focusedElementId: undefined,
  };
  // Preserve the existing DOMString coercion when the focus id is absent.
  document.getElementById(String(focusedElementId))?.focus();
  window.scrollTo({ top: scrollTopPosition });
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { initializeIcons } from "@fluentui/react/lib/Icons";

let initialized = false;

export function initializeFluentIcons(): void {
  if (!initialized) {
    initializeIcons();
    initialized = true;
  }
}

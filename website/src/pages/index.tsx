/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 *
 * The root "/" route now renders the Getting Started page. The templates
 * gallery lives at "/templates" (see ./templates/index.tsx).
 *
 * `prepareUserState` remains re-exported for compatibility; its shared
 * implementation now lives in the gallery navigation utility.
 */

export { prepareUserState } from "@site/src/utils/galleryNavigation";
export { default } from "./getting-started";

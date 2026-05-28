/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 *
 * The root "/" route now renders the Getting Started page. The templates
 * gallery lives at "/templates" (see ./templates/index.tsx).
 *
 * `prepareUserState` is re-exported here so existing imports of
 * "@site/src/pages/index" (ShowcaseTagSelect, ShowcaseLeftFilters)
 * continue to work without churn.
 */

export { prepareUserState } from "./templates";
export { default } from "./getting-started";

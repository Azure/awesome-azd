/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 *
 * Dedicated route for the Extensions gallery.
 *
 * Re-exports the same `Showcase` component used by `/templates`; the gallery
 * detects "extensions" mode from the URL pathname (`/extensions`) via
 * `getContentType` so the two pages share all rendering, filtering, and
 * pagination logic without duplication.
 */

export { default } from "./templates";

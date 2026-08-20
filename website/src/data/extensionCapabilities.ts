/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { type ExtensionCapability } from "./extensionTypes";

export type CapabilityBadgeColor =
  | "informative"
  | "success"
  | "warning"
  | "important"
  | "brand";

/**
 * Badge presentation for each azd extension capability.
 *
 * These labels are intentionally shorter than the corresponding `ext-*` entries
 * in `tags.tsx`: cards render up to eight badges at 10px, while the filter
 * sidebar has room for the full capability name. Both maps must cover every
 * capability azd publishes, which `tags_match.test.ts` asserts against the
 * committed catalog.
 */
export const CAPABILITY_BADGES: Record<
  ExtensionCapability,
  { label: string; color: CapabilityBadgeColor }
> = {
  "custom-commands": { label: "Commands", color: "brand" },
  "lifecycle-events": { label: "Lifecycle", color: "success" },
  "mcp-server": { label: "MCP", color: "important" },
  "service-target-provider": { label: "Service Target", color: "warning" },
  "framework-service-provider": { label: "Framework", color: "warning" },
  "provisioning-provider": { label: "Provisioning", color: "warning" },
  "validation-provider": { label: "Validation", color: "success" },
  metadata: { label: "Metadata", color: "informative" },
};

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { type TagType } from "./tags";

export type ExtensionCapability =
  | "custom-commands"
  | "lifecycle-events"
  | "mcp-server"
  | "service-target-provider"
  | "framework-service-provider"
  | "provisioning-provider"
  | "validation-provider"
  | "metadata";

export type Extension = {
  id: string;
  displayName: string;
  description: string;
  author: string;
  authorUrl?: string;
  source: string;
  registryUrl?: string;
  capabilities: ExtensionCapability[];
  tags: TagType[];
  website?: string;
};

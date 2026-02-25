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
  | "metadata";

export type ExtensionPlatform =
  | "windows/amd64"
  | "windows/arm64"
  | "darwin/amd64"
  | "darwin/arm64"
  | "linux/amd64"
  | "linux/arm64";

export type Extension = {
  id: string;
  namespace: string;
  displayName: string;
  description: string;
  author: string;
  authorUrl: string;
  source: string;
  registryUrl: string;
  latestVersion: string;
  capabilities: ExtensionCapability[];
  platforms: ExtensionPlatform[];
  tags: TagType[];
  preview?: string;
  website?: string;
  installCommand: string;
};

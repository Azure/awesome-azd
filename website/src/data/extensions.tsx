/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { sortBy } from '../utils/jsUtils';
import { Extension, TagType, Tags } from './tags';
import extensionsData from '../../static/extensions.json';

// Extension data loaded from JSON file
export const unsortedExtensions: Extension[] = extensionsData as Extension[];

// Capability tag types for filtering
export type CapabilityType = 
  | "custom-commands"
  | "lifecycle-events"
  | "service-target-provider"
  | "mcp-server";

// Capability metadata for display and filtering
export type Capability = {
  id: CapabilityType;
  label: string;
  description: string;
  icon?: string;
};

// List of all capabilities with metadata
export const Capabilities: { [type in CapabilityType]: Capability } = {
  "custom-commands": {
    id: "custom-commands",
    label: "Custom Commands",
    description: "Provides additional CLI commands to extend azd functionality",
  },
  "lifecycle-events": {
    id: "lifecycle-events",
    label: "Lifecycle Events",
    description: "Handles project and service lifecycle events (preprovision, prepackage, predeploy)",
  },
  "service-target-provider": {
    id: "service-target-provider",
    label: "Service Targets",
    description: "Custom service target providers for specialized Azure services",
  },
  "mcp-server": {
    id: "mcp-server",
    label: "MCP Server",
    description: "Model Context Protocol server support",
  },
};

export const CapabilityList = Object.keys(Capabilities) as CapabilityType[];

// Sort extensions by title
function sortExtensions() {
  let result = unsortedExtensions;
  result = sortBy(result, (ext) => ext.title.toLowerCase());
  return result;
}

export const sortedExtensions = sortExtensions();

// Get unique authors from extensions
export function getExtensionAuthors(): string[] {
  const authors = new Set<string>();
  unsortedExtensions.forEach(ext => authors.add(ext.author));
  return Array.from(authors).sort();
}

// Get extensions by capability
export function getExtensionsByCapability(capability: CapabilityType): Extension[] {
  return sortedExtensions.filter(ext => 
    ext.capabilities && ext.capabilities.includes(capability)
  );
}

// Get extensions by author
export function getExtensionsByAuthor(author: string): Extension[] {
  return sortedExtensions.filter(ext => ext.author === author);
}

// Get extensions by tag
export function getExtensionsByTag(tag: TagType): Extension[] {
  return sortedExtensions.filter(ext => ext.tags.includes(tag));
}

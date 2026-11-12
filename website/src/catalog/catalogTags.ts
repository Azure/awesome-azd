/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
  Tags as standardTags,
  type Tag as StandardTag,
} from "../data/tags";
import {
  Tags as aiTags,
  type Tag as AiTag,
} from "./aiTags";
import { getAzureServiceMetadata } from "./azureServiceMetadata";

export type CatalogTagMetadata = {
  id: string;
  label: string;
  type: string;
  url?: string;
  description?: string;
  productDescription?: string;
  azureIcon?: string;
  darkModeAzureIcon?: string;
};

type TagEntry<T> = {
  id: string;
  tag: T;
};

const standardTagMap = standardTags as Record<string, StandardTag>;
const aiTagMap = aiTags as Record<string, AiTag>;
const standardTagsByLowerCase = new Map<string, TagEntry<StandardTag>>(
  Object.entries(standardTagMap).map(([id, tag]) => [
    id.toLowerCase(),
    { id, tag },
  ]),
);
const aiTagsByLowerCase = new Map<string, TagEntry<AiTag>>(
  Object.entries(aiTagMap).map(([id, tag]) => [
    id.toLowerCase(),
    { id, tag },
  ]),
);

export const catalogTagAliases = new Map<string, string>([
  ["azureaiservice", "azureai"],
  ["azurecosmosdb", "cosmosdb"],
  ["azuredb-mysql", "azuredb-mySQL"],
  ["azureopenai", "openai"],
  ["golang", "go"],
]);

export const collectionServiceReplacements = new Map<string, string>([
  ["azureopenai", "openai"],
]);

export const removedCatalogTags = new Set([
  "aicollection",
  "deepseek",
  "meta",
  "mistralai",
]);

const prerequisiteTags = [
  ".net8",
  ".net9",
  "azcli",
  "azd",
  "azurite",
  "docker",
  "functionscoretools",
  "git",
  "go1.18+",
  "java17",
  "k9s",
  "maven",
  "maven3.8.x",
  "nodejs18+",
  "nodejs20",
  "nodejs22",
  "nodejslts",
  "odbc-driver-18",
  "pgvector",
  "pinecone-api",
  "poetry",
  "postgresql14+",
  "pwsh7+",
  "python3.10+",
  "python3.11+",
  "python3.9+",
  "python3.9-3.11",
  "redis",
  "sqlcmd-linux",
  "sqlcmd-windows",
  "swacli",
] as const;

const categoryOverrides = new Map<string, string>([
  ...prerequisiteTags.map(
    (id) => [id, "Prerequisite"] as const,
  ),
  ["aifoundry", "Service"],
  ["aisearch", "Service"],
  ["aspire", "Framework"],
  ["community", "Authorship"],
  ["dall-e", "Model"],
  ["dapr", "Framework"],
  ["featured", "Status"],
  ["gpt", "Model"],
  ["mcp-client", "Tools"],
  ["mcp-server", "Tools"],
  ["microfrontend", "Topic"],
  ["msft", "Authorship"],
  ["new", "Status"],
  ["powershell", "Language"],
  ["prometheus", "Tools"],
  ["sap", "Platform"],
  ["sapcap", "Framework"],
  ["serverlessapi", "Topic"],
  ["thymeleaf", "Framework"],
  ["webapps", "Topic"],
]);

const labelOverrides = new Map<string, string>([
  ["azuredb-mysql", "Azure Database for MySQL"],
  ["azuredb-postgresql", "Azure Database for PostgreSQL"],
]);

const legacyLabelOverrides = new Map<string, readonly string[]>([
  ["aifoundry", ["Azure AI Foundry"]],
  ["azureai", ["Azure AI Service"]],
  ["azureaiservice", ["Azure AI Services"]],
  ["azureopenai", ["Azure OpenAI"]],
]);

export function canonicalizeCatalogTagId(
  id: string,
): string | undefined {
  const normalizedId = id.toLowerCase();
  if (removedCatalogTags.has(normalizedId)) {
    return undefined;
  }

  const alias = catalogTagAliases.get(normalizedId);
  if (alias !== undefined) {
    return alias;
  }

  return (
    standardTagsByLowerCase.get(normalizedId)?.id ??
    aiTagsByLowerCase.get(normalizedId)?.id ??
    id
  );
}

export function canonicalizeCatalogTagIds(
  ids: readonly string[],
): string[] {
  const canonicalIds = ids
    .map(canonicalizeCatalogTagId)
    .filter((id): id is string => id !== undefined);
  return [...new Set(canonicalIds)];
}

export function getCatalogTagCompatibilityIds(
  value: string,
): string[] {
  const normalizedValue = value.trim().toLowerCase();
  const matchingIds = new Set<string>();

  for (const [id, tag] of [
    ...Object.entries(standardTagMap),
    ...Object.entries(aiTagMap),
  ]) {
    if (
      id.toLowerCase() === normalizedValue ||
      tag.label.toLowerCase() === normalizedValue
    ) {
      matchingIds.add(canonicalizeCatalogTagId(id) ?? id);
    }
  }

  for (const tag of Object.values(catalogTags)) {
    if (
      tag.id.toLowerCase() === normalizedValue ||
      tag.label.toLowerCase() === normalizedValue
    ) {
      matchingIds.add(tag.id);
    }
  }

  return [...matchingIds];
}

export function getCatalogTagSearchTerms(id: string): string[] {
  const normalizedId = id.toLowerCase();
  const canonicalId = canonicalizeCatalogTagId(id);
  const metadata =
    canonicalId === undefined
      ? undefined
      : getCatalogTagMetadata(canonicalId);

  return [
    ...new Set(
      [
        id,
        canonicalId,
        standardTagsByLowerCase.get(normalizedId)?.tag.label,
        aiTagsByLowerCase.get(normalizedId)?.tag.label,
        metadata?.label,
        ...(legacyLabelOverrides.get(normalizedId) ?? []),
      ].filter((value): value is string => Boolean(value)),
    ),
  ];
}

export function getCatalogTagMetadata(
  id: string,
): CatalogTagMetadata | undefined {
  const canonicalId = canonicalizeCatalogTagId(id);
  if (canonicalId === undefined) {
    return undefined;
  }

  const normalizedId = canonicalId.toLowerCase();
  const originalId = id.toLowerCase();
  const standardTag =
    standardTagsByLowerCase.get(normalizedId)?.tag ??
    standardTagsByLowerCase.get(originalId)?.tag;
  const aiTag =
    aiTagsByLowerCase.get(normalizedId)?.tag ??
    aiTagsByLowerCase.get(originalId)?.tag;
  const serviceMetadata =
    getAzureServiceMetadata(canonicalId) ??
    getAzureServiceMetadata(id);

  if (standardTag === undefined && aiTag === undefined) {
    return undefined;
  }

  const type =
    categoryOverrides.get(normalizedId) ??
    standardTag?.type ??
    aiTag?.type;
  if (type === undefined) {
    throw new Error(
      `Catalog tag '${canonicalId}' is missing a category.`,
    );
  }

  return {
    id: canonicalId,
    label:
      serviceMetadata?.label ??
      labelOverrides.get(normalizedId) ??
      standardTag?.label ??
      aiTag?.label ??
      canonicalId,
    type,
    url: serviceMetadata?.url ?? standardTag?.url ?? aiTag?.url,
    description: standardTag?.description,
    productDescription:
      serviceMetadata?.description ?? standardTag?.productDescription,
    azureIcon: serviceMetadata?.icon ?? standardTag?.azureIcon,
    darkModeAzureIcon:
      serviceMetadata?.darkModeIcon ?? standardTag?.darkModeAzureIcon,
  };
}

const sourceTagIds = [
  ...new Set([
    ...Object.keys(standardTagMap),
    ...Object.keys(aiTagMap),
  ]),
];

export const catalogTags: Readonly<
  Record<string, CatalogTagMetadata>
> = Object.freeze(
  Object.fromEntries(
    sourceTagIds.flatMap((id) => {
      const metadata = getCatalogTagMetadata(id);
      return metadata === undefined ? [] : [[metadata.id, metadata]];
    }),
  ),
);

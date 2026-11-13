/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
  Tags as standardTags,
  type Tag as StandardTag,
} from "../data/tags";
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
const standardTagsByLowerCase = new Map<string, TagEntry<StandardTag>>(
  Object.entries(standardTagMap).map(([id, tag]) => [
    id.toLowerCase(),
    { id, tag },
  ]),
);
export const catalogTagAliases = new Map<string, string>([
  ["aicollection", "aiapplication"],
  ["azureaiservice", "azureai"],
  ["azurecosmosdb", "cosmosdb"],
  ["azuredb-mysql", "azuredb-mySQL"],
  ["azureopenai", "openai"],
  ["deepseek", "deepseek-r1"],
  ["golang", "go"],
  ["meta", "llama"],
  ["mistralai", "mistral7b"],
]);

export const collectionServiceReplacements = new Map<string, string>([
  ["azureopenai", "openai"],
]);

export const removedCatalogTags = new Set<string>();

const categoryOverrides = new Map<string, string>([
  ["aifoundry", "Service"],
  ["aiapplication", "Application Type"],
  ["aisearch", "Service"],
  ["aspire", "Framework"],
  ["community", "Authorship"],
  ["dall-e", "Tools"],
  ["dapr", "Tools"],
  ["featured", "Status"],
  ["gpt", "Model"],
  ["kubernetes", "Framework"],
  ["mcp-client", "Tools"],
  ["mcp-server", "Tools"],
  ["microfrontend", "Topic"],
  ["msft", "Authorship"],
  ["new", "Status"],
  ["powershell", "Language"],
  ["prometheus", "Tools"],
  ["sap", "Tools"],
  ["sapcap", "Tools"],
  ["serverlessapi", "Service"],
  ["thymeleaf", "Tools"],
  ["webapps", "Service"],
]);

const labelOverrides = new Map<string, string>([
  ["azuredb-mysql", "Azure Database for MySQL"],
  ["azuredb-postgresql", "Azure Database for PostgreSQL"],
]);

const legacyLabelOverrides = new Map<string, readonly string[]>([
  ["aifoundry", ["Azure AI Foundry"]],
  ["azureai", ["Foundry Tools", "Azure AI Service"]],
  ["azureaiservice", ["Foundry Tools", "Azure AI Services"]],
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
    standardTagsByLowerCase.get(normalizedId)?.id ?? id
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

  for (const [id, tag] of Object.entries(standardTagMap)) {
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
  const aliasIds =
    canonicalId === undefined
      ? []
      : [...catalogTagAliases.entries()]
          .filter(
            ([, target]) =>
              target.toLowerCase() === canonicalId.toLowerCase(),
          )
          .map(([alias]) => alias);
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
        metadata?.label,
        ...aliasIds,
        ...aliasIds.flatMap((alias) => [
          standardTagsByLowerCase.get(alias)?.tag.label,
          ...(legacyLabelOverrides.get(alias) ?? []),
        ]),
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
  const serviceMetadata =
    getAzureServiceMetadata(canonicalId) ??
    getAzureServiceMetadata(id);

  if (standardTag === undefined) {
    return undefined;
  }

  const type =
    categoryOverrides.get(normalizedId) ??
    standardTag.type;
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
      standardTag.label ??
      canonicalId,
    type,
    url: serviceMetadata?.url ?? standardTag.url,
    description: standardTag.description,
    productDescription:
      serviceMetadata?.description ?? standardTag?.productDescription,
    azureIcon: serviceMetadata?.icon ?? standardTag?.azureIcon,
    darkModeAzureIcon:
      serviceMetadata?.darkModeIcon ?? standardTag?.darkModeAzureIcon,
  };
}

const sourceTagIds = Object.keys(standardTagMap);

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

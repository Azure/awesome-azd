/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import templates from "../../static/templates.json";
import repositoryMetrics from "./repository-metrics.generated.json";
import reviewedTemplateUseCases from "./template-use-cases.json";
import {
  canonicalizeCatalogTagIds,
  collectionServiceReplacements,
  getCatalogTagMetadata,
  getCatalogTagSearchTerms,
} from "./catalogTags";
import { normalizeTemplateSource } from "./templateSources";
import { getRepositoryStars } from "./repositoryMetrics";
import {
  formatAzdInitCommand,
  getTemplateIdentifier,
} from "../utils/templateCommands";

export const catalogTasks = [
  "Build a web app",
  "Build an API",
  "Build an AI agent",
  "Build an MCP server",
  "Chat with documents",
  "Query a database",
  "Automate a workflow",
  "Start with infrastructure",
] as const;

export type CatalogTask = (typeof catalogTasks)[number];
export type CatalogAuthorship = "Community" | "Microsoft";

export type CatalogPrerequisite = {
  id: string;
  label: string;
  url?: string;
};

export type CatalogResource = {
  id: string;
  label: string;
  role: string;
  description: string;
  icon?: string;
  darkModeIcon?: string;
  url?: string;
};

export type CatalogTemplate = {
  id: string;
  title: string;
  description: string;
  source: string;
  normalizedSource: string;
  repository: string;
  detailPath: string;
  authors: string[];
  legacyAuthors: string[];
  authorUrls: string[];
  authorship: CatalogAuthorship;
  isAi: boolean;
  featured: boolean;
  stars?: number;
  tasks: CatalogTask[];
  collections: string[];
  legacyTags: string[];
  compatibilityTags: string[];
  languages: string[];
  frameworks: string[];
  databases: string[];
  iac: string[];
  serviceIds: string[];
  services: string[];
  tools: string[];
  topics: string[];
  models: string[];
  host?: string;
  prerequisites: CatalogPrerequisite[];
  resources: CatalogResource[];
  preview?: string;
  architectureDiagram?: string;
  screenshot?: string;
  video?: string;
  sampleType?: string;
  initCommand: string;
  readmeUrl: string;
  searchText: string;
};

type RawTemplate = {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  source?: unknown;
  author?: unknown;
  authorUrl?: unknown;
  authors?: unknown;
  authorUrls?: unknown;
  tags?: unknown;
  languages?: unknown;
  frameworks?: unknown;
  azureServices?: unknown;
  IaC?: unknown;
  appType?: unknown;
  models?: unknown;
  prerequisites?: unknown;
  legacySources?: unknown;
  preview?: unknown;
  architectureDiagram?: unknown;
  screenshot?: unknown;
  video?: unknown;
  sampleType?: unknown;
  templateType?: unknown;
  host?: unknown;
};

const microsoftOwners = new Set([
  "azure",
  "azure-samples",
  "azurecosmosdb",
  "microsoft",
]);
const databaseLikeTags = new Set([
  "aisearch",
  "azuresql",
  "azuredb-mysql",
  "azuredb-postgresql",
  "cosmosdb",
  "mongodb",
  "neondb",
  "pinecone",
]);
const hostServiceIds = new Set([
  "aca",
  "aks",
  "appservice",
  "functions",
  "swa",
  "virtualmachine",
]);
const observabilityServiceIds = new Set([
  "appinsights",
  "diagnosticsettings",
  "grafana",
  "loganalytics",
  "monitor",
  "prometheus",
]);
const identityServiceIds = new Set([
  "keyvault",
  "managedidentity",
  "serviceprincipal",
]);
const networkingServiceIds = new Set([
  "agw",
  "frontdoor",
  "loadbalancer",
  "privateendpoints",
  "privatelink",
  "trafficmgr",
  "vnets",
]);
const messagingServiceIds = new Set([
  "eventgrid",
  "eventhub",
  "logicapps",
  "servicebus",
]);
const storageServiceIds = new Set([
  "azurestorage",
  "blobstorage",
]);
const aiServiceIds = new Set([
  "aifoundry",
  "aisearch",
  "azureai",
  "azurebot",
  "openai",
]);
const reviewedUseCases = reviewedTemplateUseCases as Record<string, unknown>;
const catalogTaskSet = new Set<string>(catalogTasks);

function readString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Catalog template is missing a valid '${field}' field.`);
  }
  return value.trim();
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function getCoordinates(source: string): {
  normalizedSource: string;
  owner: string;
  repo: string;
} {
  const normalizedSource = normalizeTemplateSource(source);
  if (normalizedSource === null) {
    throw new Error(`Invalid catalog template source: ${source}`);
  }

  const url = new URL(source);
  const [owner, rawRepo] = url.pathname.split("/").filter(Boolean);
  const repo = rawRepo.replace(/\.git$/i, "");
  return {
    normalizedSource,
    owner,
    repo,
  };
}

function getTagLabel(id: string): string {
  return getCatalogTagMetadata(id)?.label ?? id;
}

function getLabels(ids: readonly string[]): string[] {
  return unique(ids.map(getTagLabel));
}

function getAuthors(record: RawTemplate): {
  authors: string[];
  authorUrls: string[];
} {
  const authors = readStringArray(record.authors);
  const authorUrls = readStringArray(record.authorUrls);
  if (authors.length > 0) {
    if (authors.length !== authorUrls.length) {
      throw new Error("Catalog template author metadata is misaligned.");
    }
    return { authors, authorUrls };
  }

  const author = readString(record.author, "author");
  const authorUrl = readOptionalString(record.authorUrl);
  const splitAuthors = author.split(", ").filter(Boolean);
  const splitUrls = authorUrl?.split(", ").filter(Boolean) ?? [];
  if (splitUrls.length > 0 && splitUrls.length !== splitAuthors.length) {
    throw new Error(`Catalog template author metadata is misaligned for ${author}.`);
  }

  return {
    authors: splitAuthors,
    authorUrls:
      splitUrls.length > 0
        ? splitUrls
        : splitAuthors.map(() => authorUrl ?? ""),
  };
}

function getLegacyAuthors(
  record: RawTemplate,
  authors: readonly string[],
): string[] {
  const legacyAuthor = readOptionalString(record.author);
  return legacyAuthor === undefined
    ? []
    : unique(
        legacyAuthor
          .split(", ")
          .filter((author) => author && !authors.includes(author)),
      );
}

function getAuthorship(
  owner: string,
  authors: readonly string[],
  tags: readonly string[],
): CatalogAuthorship {
  if (tags.includes("community")) {
    return "Community";
  }
  if (
    tags.includes("msft") ||
    microsoftOwners.has(owner.toLowerCase()) ||
    authors.some((author) =>
      /\b(?:azure content team|microsoft)\b/i.test(author),
    )
  ) {
    return "Microsoft";
  }
  return "Community";
}

function getReviewedUseCases(normalizedSource: string): CatalogTask[] {
  const value = reviewedUseCases[normalizedSource];
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some(
      (task) => typeof task !== "string" || !catalogTaskSet.has(task),
    )
  ) {
    throw new Error(
      `Catalog template is missing reviewed use cases: ${normalizedSource}`,
    );
  }

  const tasks = value as CatalogTask[];
  if (new Set(tasks).size !== tasks.length) {
    throw new Error(
      `Catalog template has duplicate reviewed use cases: ${normalizedSource}`,
    );
  }
  return tasks;
}

function getResourceRole(id: string): string {
  const normalizedId = id.toLowerCase();
  if (hostServiceIds.has(normalizedId)) {
    return "Application hosting";
  }
  if (databaseLikeTags.has(normalizedId)) {
    return "Database or retrieval";
  }
  if (observabilityServiceIds.has(normalizedId)) {
    return "Observability";
  }
  if (identityServiceIds.has(normalizedId)) {
    return "Identity and secrets";
  }
  if (networkingServiceIds.has(normalizedId)) {
    return "Networking";
  }
  if (messagingServiceIds.has(normalizedId)) {
    return "Messaging and integration";
  }
  if (storageServiceIds.has(normalizedId)) {
    return "Storage";
  }
  if (aiServiceIds.has(normalizedId)) {
    return "AI platform";
  }
  return "Azure service";
}

function toCatalogTemplate(record: RawTemplate): CatalogTemplate | null {
  const templateType = readOptionalString(record.templateType);
  const isAi = templateType === "ai-app-templates";
  if (templateType !== undefined && !isAi) {
    return null;
  }

  const id = readString(record.id, "id");
  const title = readString(record.title, "title");
  const description = readString(record.description, "description");
  const source = readString(record.source, "source");
  const coordinates = getCoordinates(source);
  const { authors, authorUrls } = getAuthors(record);
  const legacyAuthors = getLegacyAuthors(record, authors);
  const rawTags = readStringArray(record.tags);
  const rawLanguageIds = readStringArray(record.languages);
  const rawFrameworkIds = readStringArray(record.frameworks);
  const rawServiceIds = readStringArray(record.azureServices);
  const rawIacIds = readStringArray(record.IaC);
  const rawModelIds = readStringArray(record.models);
  const rawPrerequisiteIds = readStringArray(record.prerequisites);
  const tags = canonicalizeCatalogTagIds(rawTags);
  const languageIds = unique([
    ...canonicalizeCatalogTagIds(rawLanguageIds),
    ...tags.filter(
      (tag) => getCatalogTagMetadata(tag)?.type === "Language",
    ),
  ]);
  const legacyFrameworkIds =
    canonicalizeCatalogTagIds(rawFrameworkIds);
  const frameworkIds = unique([
    ...legacyFrameworkIds,
    ...tags.filter(
      (tag) => getCatalogTagMetadata(tag)?.type === "Framework",
    ),
  ]);
  const serviceIds = unique([
    ...canonicalizeCatalogTagIds(rawServiceIds),
    ...rawTags
      .map((tag) =>
        collectionServiceReplacements.get(tag.toLowerCase()),
      )
      .filter((tag): tag is string => tag !== undefined),
  ]);
  const databaseIds = unique(
    [...tags, ...serviceIds].filter((tag) => {
      const metadata = getCatalogTagMetadata(tag);
      return (
        metadata?.type === "Database" ||
        databaseLikeTags.has(tag.toLowerCase())
      );
    }),
  );
  const iacIds = canonicalizeCatalogTagIds(rawIacIds);
  const legacyTags = unique([
    ...tags,
    ...languageIds,
    ...legacyFrameworkIds,
    ...serviceIds,
    ...iacIds,
  ]);
  const appTypes = readStringArray(record.appType);
  const modelIds = unique([
    ...canonicalizeCatalogTagIds(rawModelIds),
    ...tags.filter(
      (tag) => getCatalogTagMetadata(tag)?.type === "Model",
    ),
  ]);
  const compatibilityTags = unique([
    ...legacyTags,
    ...rawTags,
    ...rawLanguageIds,
    ...rawFrameworkIds,
    ...rawServiceIds,
    ...rawIacIds,
    ...rawModelIds,
  ]);
  const legacySearchTerms = unique(
    [
      ...rawTags,
      ...rawLanguageIds,
      ...rawFrameworkIds,
      ...rawServiceIds,
      ...rawIacIds,
      ...rawModelIds,
      ...rawPrerequisiteIds,
    ].flatMap(getCatalogTagSearchTerms),
  );
  const toolIds = tags.filter(
    (tag) => getCatalogTagMetadata(tag)?.type === "Tools",
  );
  const topicIds = tags.filter(
    (tag) => getCatalogTagMetadata(tag)?.type === "Topic",
  );
  const languages = getLabels(languageIds);
  const frameworks = getLabels(frameworkIds);
  const databases = getLabels(databaseIds);
  const iac = getLabels(iacIds);
  const services = getLabels(serviceIds);
  const tools = getLabels(toolIds);
  const topics = getLabels(topicIds);
  const models = getLabels(modelIds);
  const host = readOptionalString(record.host);
  const prerequisites = canonicalizeCatalogTagIds(
    rawPrerequisiteIds,
  ).map((tag) => {
    const metadata = getCatalogTagMetadata(tag);
    return {
      id: tag,
      label: metadata?.label ?? tag,
      url: metadata?.url,
    };
  });
  const resources = serviceIds.reduce<CatalogResource[]>((result, tag) => {
    const metadata = getCatalogTagMetadata(tag);
    const label = metadata?.label ?? tag;
    const resource = {
      id: tag,
      label,
      role: getResourceRole(tag),
      description:
        metadata?.productDescription ??
        metadata?.description ??
        `Learn more about ${label}.`,
      icon: metadata?.azureIcon,
      darkModeIcon: metadata?.darkModeAzureIcon,
      url: metadata?.url,
    };
    if (!result.some((candidate) => candidate.label === resource.label)) {
      result.push(resource);
    }
    return result;
  }, []);
  const authorship = getAuthorship(coordinates.owner, authors, tags);
  const tasks = getReviewedUseCases(coordinates.normalizedSource);
  const initCommand = formatAzdInitCommand(getTemplateIdentifier(source));
  const readmeUrl = `${source}#readme`;
  const preview = readOptionalString(record.preview);
  const architectureDiagram = readOptionalString(record.architectureDiagram);
  const screenshot = readOptionalString(record.screenshot);
  const video = readOptionalString(record.video);
  const sampleType = readOptionalString(record.sampleType);
  const searchText = [
    title,
    description,
    coordinates.owner,
    coordinates.repo,
    ...authors,
    ...legacyAuthors,
    ...rawTags,
    ...legacySearchTerms,
    ...tags,
    ...appTypes,
    ...languages,
    ...frameworks,
    ...databases,
    ...iac,
    ...services,
    ...tools,
    ...topics,
    ...models,
    ...tasks,
    authorship,
  ]
    .join(" ")
    .toLowerCase();

  return {
    id,
    title,
    description,
    source,
    normalizedSource: coordinates.normalizedSource,
    repository: new URL(coordinates.normalizedSource).pathname.slice(1),
    detailPath: `/templates/${new URL(
      coordinates.normalizedSource,
    ).pathname.slice(1)}`,
    authors,
    legacyAuthors,
    authorUrls,
    authorship,
    isAi,
    featured: tags.includes("featured"),
    stars: getRepositoryStars(repositoryMetrics, source),
    tasks,
    collections: isAi ? ["ai"] : [],
    legacyTags,
    compatibilityTags,
    languages,
    frameworks,
    databases,
    iac,
    serviceIds,
    services,
    tools,
    topics,
    models,
    host,
    prerequisites,
    resources,
    preview,
    architectureDiagram,
    screenshot,
    video,
    sampleType,
    initCommand,
    readmeUrl,
    searchText,
  };
}

export const catalogTemplates = (templates as RawTemplate[])
  .map(toCatalogTemplate)
  .filter((template): template is CatalogTemplate => template !== null);


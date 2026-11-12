/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import templates from "../../static/templates.json";
import reviewedTemplateUseCases from "./template-use-cases.json";
import {
  Tags as standardTags,
  type Tag as StandardTag,
} from "../data/tags";
import {
  Tags as aiTags,
  type Tag as AiTag,
} from "./aiTags";
import { normalizeTemplateSource } from "./templateSources";
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
  url?: string;
};

export type CatalogTemplate = {
  id: string;
  title: string;
  description: string;
  source: string;
  normalizedSource: string;
  authors: string[];
  legacyAuthors: string[];
  authorUrls: string[];
  authorship: CatalogAuthorship;
  isAi: boolean;
  featured: boolean;
  tasks: CatalogTask[];
  collections: string[];
  legacyTags: string[];
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

type TagMetadata = Pick<
  StandardTag & AiTag,
  "label" | "type" | "url"
>;

const standardTagMap = standardTags as Record<string, StandardTag>;
const aiTagMap = aiTags as Record<string, AiTag>;
const canonicalTagLabels = new Map([
  ["azuredb-postgresql", "Azure Database for PostgreSQL"],
]);
const microsoftOwners = new Set([
  "azure",
  "azure-samples",
  "azurecosmosdb",
  "microsoft",
]);
const frameworkLikeTags = new Set(["aspire", "dapr"]);
const databaseLikeTags = new Set([
  "aisearch",
  "azuresql",
  "azurecosmosdb",
  "azuredb-mysql",
  "azuredb-postgresql",
  "cosmosdb",
  "mongodb",
  "neondb",
  "pinecone",
  "prometheus",
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
  "azureaiservice",
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

function getTagMetadata(id: string, isAi: boolean): TagMetadata | undefined {
  return (isAi ? aiTagMap[id] ?? standardTagMap[id] : standardTagMap[id] ?? aiTagMap[id]) as
    | TagMetadata
    | undefined;
}

function getTagLabel(id: string, isAi: boolean): string {
  return (
    canonicalTagLabels.get(id.toLowerCase()) ??
    getTagMetadata(id, isAi)?.label ??
    id
  );
}

function getLabels(ids: readonly string[], isAi: boolean): string[] {
  return unique(ids.map((id) => getTagLabel(id, isAi)));
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
  const tags = readStringArray(record.tags);
  const languageIds = readStringArray(record.languages);
  const legacyFrameworkIds = readStringArray(record.frameworks);
  const frameworkIds = unique([
    ...legacyFrameworkIds,
    ...tags.filter((tag) => {
      const metadata = getTagMetadata(tag, isAi);
      return metadata?.type === "Framework" || frameworkLikeTags.has(tag);
    }),
  ]);
  const serviceIds = readStringArray(record.azureServices);
  const databaseIds = unique(
    [...tags, ...serviceIds].filter((tag) => {
      const metadata = getTagMetadata(tag, isAi);
      return (
        metadata?.type === "Database" ||
        databaseLikeTags.has(tag.toLowerCase())
      );
    }),
  );
  const iacIds = readStringArray(record.IaC);
  const legacyTags = unique([
    ...tags,
    ...languageIds,
    ...legacyFrameworkIds,
    ...serviceIds,
    ...iacIds,
  ]);
  const appTypes = readStringArray(record.appType);
  const modelIds = readStringArray(record.models);
  const toolIds = tags.filter(
    (tag) => getTagMetadata(tag, isAi)?.type === "Tools",
  );
  const topicIds = tags.filter(
    (tag) => getTagMetadata(tag, isAi)?.type === "Topic",
  );
  const languages = getLabels(languageIds, isAi);
  const frameworks = getLabels(frameworkIds, isAi);
  const databases = getLabels(databaseIds, isAi);
  const iac = getLabels(iacIds, isAi);
  const services = getLabels(serviceIds, isAi);
  const tools = getLabels(toolIds, isAi);
  const topics = getLabels(topicIds, isAi);
  const models = getLabels(modelIds, isAi);
  const host = readOptionalString(record.host);
  const prerequisites = readStringArray(record.prerequisites).map((tag) => {
    const metadata = getTagMetadata(tag, true);
    return {
      id: tag,
      label: metadata?.label ?? tag,
      url: metadata?.url,
    };
  });
  const resources = serviceIds.reduce<CatalogResource[]>((result, tag) => {
    const metadata = getTagMetadata(tag, isAi);
    const resource = {
      id: tag,
      label: metadata?.label ?? tag,
      role: getResourceRole(tag),
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
    authors,
    legacyAuthors,
    authorUrls,
    authorship,
    isAi,
    featured: tags.includes("featured"),
    tasks,
    collections: isAi ? ["ai"] : [],
    legacyTags,
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


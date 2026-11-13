/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

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

export type CatalogResource = {
  id: string;
  label: string;
  role: string;
  description: string;
  icon?: string;
  darkModeIcon?: string;
  url?: string;
};

export type CatalogListingTemplate = {
  id: string;
  title: string;
  description: string;
  detailPath: string;
  authors: string[];
  legacyAuthors: string[];
  authorship: CatalogAuthorship;
  isAi: boolean;
  featured: boolean;
  stars?: number;
  tasks: CatalogTask[];
  collections: string[];
  compatibilityTags: string[];
  languages: string[];
  frameworks: string[];
  databases: string[];
  iac: string[];
  serviceIds: string[];
  primaryService?: string;
  initCommand: string;
  searchText: string;
};

export type CatalogTemplate = CatalogListingTemplate & {
  source: string;
  normalizedSource: string;
  repository: string;
  authorUrls: string[];
  legacyTags: string[];
  services: string[];
  tools: string[];
  topics: string[];
  models: string[];
  host?: string;
  resources: CatalogResource[];
  preview?: string;
  architectureDiagram?: string;
  screenshot?: string;
  video?: string;
  sampleType?: string;
  readmeUrl: string;
  listingSearchTerms: string[];
};

export type CatalogWireTemplate = readonly [
  id: string,
  title: string,
  description: string,
  repository: string,
  authors: readonly number[],
  legacyAuthors: readonly number[],
  flags: number,
  stars: number | null,
  tasks: readonly number[],
  compatibilityTags: readonly number[],
  languages: readonly number[],
  frameworks: readonly number[],
  databases: readonly number[],
  iac: readonly number[],
  serviceIds: readonly number[],
  primaryService: number | null,
  searchTerms: readonly number[],
];

export type CatalogPageData = {
  schemaVersion: 2;
  strings: string[];
  templates: CatalogWireTemplate[];
};

export type CatalogTemplateDetail = Pick<
  CatalogTemplate,
  | "title"
  | "description"
  | "source"
  | "repository"
  | "detailPath"
  | "authors"
  | "authorUrls"
  | "stars"
  | "tasks"
  | "languages"
  | "models"
  | "services"
  | "resources"
  | "preview"
  | "architectureDiagram"
  | "screenshot"
  | "initCommand"
>;

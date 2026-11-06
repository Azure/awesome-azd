/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { sortBy } from "../utils/jsUtils";
import { type TagType, type Template, Tags } from "./tags";
import templates from "../../../static/templates.json";
import { normalizeTemplateSource } from "../utils/templateSources";

const AI_APP_TEMPLATE_TYPE = "ai-app-templates";

type AiAppTemplateRecord = {
  templateType?: unknown;
  title?: unknown;
  description?: unknown;
  source?: unknown;
  authors?: unknown;
  authorUrls?: unknown;
  languages?: unknown;
  models?: unknown;
  appType?: unknown;
  azureServices?: unknown;
  prerequisites?: unknown;
  tags?: unknown;
  sampleType?: unknown;
  architectureDiagram?: unknown;
  screenshot?: unknown;
  video?: unknown;
  legacySources?: unknown;
};

function readString(value: unknown, field: string, source: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Invalid AI template field '${field}' for ${source}`);
  }
  return value;
}

function readStringArray(
  value: unknown,
  field: string,
  source: string,
): string[] {
  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== "string" || item.length === 0)
  ) {
    throw new Error(`Invalid AI template field '${field}' for ${source}`);
  }
  return value;
}

function readTagArray(
  value: unknown,
  field: string,
  source: string,
): TagType[] {
  const values = readStringArray(value, field, source);
  for (const tag of values) {
    if (!(tag in Tags)) {
      throw new Error(`Unknown AI tag '${tag}' in '${field}' for ${source}`);
    }
  }
  return values as TagType[];
}

function readAssetPath(
  value: unknown,
  field: "architectureDiagram" | "screenshot",
  source: string,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (
    typeof value !== "string" ||
    !/^\/templates\/images\/[A-Za-z0-9._-]+$/.test(value)
  ) {
    throw new Error(`Invalid AI ${field} path for ${source}`);
  }
  return value;
}

function toAiTemplate(template: AiAppTemplateRecord): Template | null {
  if (template.templateType !== AI_APP_TEMPLATE_TYPE) {
    return null;
  }

  const source = readString(template.source, "source", AI_APP_TEMPLATE_TYPE);
  if (normalizeTemplateSource(source) === null) {
    throw new Error(`Invalid AI template source: ${source}`);
  }

  const sampleType = readString(template.sampleType, "sampleType", source);
  if (sampleType !== "full_sample" && sampleType !== "building_block") {
    throw new Error(`Invalid AI sample type '${sampleType}' for ${source}`);
  }

  const authors = readStringArray(template.authors, "authors", source);
  const authorUrls = readStringArray(template.authorUrls, "authorUrls", source);
  if (authors.length !== authorUrls.length) {
    throw new Error(`AI author metadata is misaligned for ${source}`);
  }
  for (const authorUrl of authorUrls) {
    const url = new URL(authorUrl);
    if (url.protocol !== "https:") {
      throw new Error(`Invalid AI author URL for ${source}`);
    }
  }

  const legacySources =
    template.legacySources === undefined
      ? undefined
      : readStringArray(template.legacySources, "legacySources", source);
  for (const legacySource of legacySources ?? []) {
    if (normalizeTemplateSource(legacySource) === null) {
      throw new Error(`Invalid legacy AI source: ${legacySource}`);
    }
  }

  const video =
    template.video === undefined
      ? undefined
      : readString(template.video, "video", source);
  if (video !== undefined && new URL(video).protocol !== "https:") {
    throw new Error(`Invalid AI video URL for ${source}`);
  }

  return {
    title: readString(template.title, "title", source),
    description: readString(template.description, "description", source),
    author: authors,
    authorUrl: authorUrls,
    source,
    legacy_sources: legacySources,
    language: readTagArray(template.languages, "languages", source),
    tags: readTagArray(template.tags, "tags", source),
    app_type: readTagArray(template.appType, "appType", source),
    azure_service: readTagArray(
      template.azureServices,
      "azureServices",
      source,
    ),
    models: readTagArray(template.models, "models", source),
    prerequisites: readTagArray(
      template.prerequisites,
      "prerequisites",
      source,
    ),
    architectureDiagram: readAssetPath(
      template.architectureDiagram,
      "architectureDiagram",
      source,
    ),
    screenshot: readAssetPath(template.screenshot, "screenshot", source),
    video,
    template_type: sampleType,
    status_valid: true,
  };
}

export const allTemplates = (templates as AiAppTemplateRecord[])
  .map(toAiTemplate)
  .filter((template): template is Template => template !== null);
export const availableTemplates = allTemplates;

export const tagList = Object.keys(Tags) as TagType[];
export const sortedTagList = [...tagList].sort();

function sortTemplatesByTitle() {
  return sortBy(availableTemplates, (template) => template.title.toLowerCase());
}

export const sortedTemplates = sortTemplatesByTitle();

export const featuredTemplates = sortedTemplates.filter((template) => {
  const tags = [
    ...template.tags,
    ...template.language,
    ...template.app_type,
    ...template.azure_service,
    ...template.models,
  ];
  return tags.includes("featured");
});

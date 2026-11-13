/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import type {
  CatalogListingTemplate,
  CatalogPageData,
  CatalogTask,
  CatalogTemplate,
  CatalogWireTemplate,
} from "./catalogTypes";

const microsoftAuthoredFlag = 1 << 0;
const aiTemplateFlag = 1 << 1;
const featuredTemplateFlag = 1 << 2;

function getRepository(template: CatalogTemplate): string {
  const prefix = "/templates/";
  if (!template.detailPath.startsWith(prefix)) {
    throw new Error(
      `Catalog template has an invalid detail path: ${template.detailPath}`,
    );
  }
  return template.detailPath.slice(prefix.length);
}

export function createCatalogPageData(
  templates: readonly CatalogTemplate[],
): CatalogPageData {
  const strings: string[] = [];
  const stringIndexes = new Map<string, number>();
  const intern = (value: string): number => {
    const existing = stringIndexes.get(value);
    if (existing !== undefined) {
      return existing;
    }

    const index = strings.length;
    strings.push(value);
    stringIndexes.set(value, index);
    return index;
  };
  const encode = (values: readonly string[]): number[] =>
    values.map(intern);

  const records = templates.map<CatalogWireTemplate>((template) => {
    const flags =
      (template.authorship === "Microsoft" ? microsoftAuthoredFlag : 0) |
      (template.isAi ? aiTemplateFlag : 0) |
      (template.featured ? featuredTemplateFlag : 0);

    return [
      template.id,
      template.title,
      template.description,
      getRepository(template),
      encode(template.authors),
      encode(template.legacyAuthors),
      flags,
      template.stars ?? null,
      encode(template.tasks),
      encode(template.compatibilityTags),
      encode(template.languages),
      encode(template.frameworks),
      encode(template.databases),
      encode(template.iac),
      encode(template.serviceIds),
      template.primaryService === undefined
        ? null
        : intern(template.primaryService),
      encode(template.listingSearchTerms),
    ];
  });

  return {
    schemaVersion: 2,
    strings,
    templates: records,
  };
}

function readString(
  strings: readonly string[],
  index: number,
  field: string,
): string {
  const value = strings[index];
  if (value === undefined) {
    throw new Error(`Catalog page data has an invalid ${field} index.`);
  }
  return value;
}

function decodeStrings(
  strings: readonly string[],
  indexes: readonly number[],
  field: string,
): string[] {
  return indexes.map((index) => readString(strings, index, field));
}

export function decodeCatalogPageData(
  data: CatalogPageData,
): CatalogListingTemplate[] {
  if (data.schemaVersion !== 2) {
    throw new Error(`Unsupported catalog page schema: ${data.schemaVersion}`);
  }

  return data.templates.map((record) => {
    const [
      id,
      title,
      description,
      repository,
      authorIndexes,
      legacyAuthorIndexes,
      flags,
      stars,
      taskIndexes,
      compatibilityTagIndexes,
      languageIndexes,
      frameworkIndexes,
      databaseIndexes,
      iacIndexes,
      serviceIdIndexes,
      primaryServiceIndex,
      searchTermIndexes,
    ] = record;
    const authors = decodeStrings(
      data.strings,
      authorIndexes,
      "author",
    );
    const legacyAuthors = decodeStrings(
      data.strings,
      legacyAuthorIndexes,
      "legacy author",
    );
    const tasks = decodeStrings(
      data.strings,
      taskIndexes,
      "task",
    ) as CatalogTask[];
    const compatibilityTags = decodeStrings(
      data.strings,
      compatibilityTagIndexes,
      "compatibility tag",
    );
    const languages = decodeStrings(
      data.strings,
      languageIndexes,
      "language",
    );
    const frameworks = decodeStrings(
      data.strings,
      frameworkIndexes,
      "framework",
    );
    const databases = decodeStrings(
      data.strings,
      databaseIndexes,
      "database",
    );
    const iac = decodeStrings(data.strings, iacIndexes, "iac");
    const serviceIds = decodeStrings(
      data.strings,
      serviceIdIndexes,
      "service",
    );
    const searchTerms = decodeStrings(
      data.strings,
      searchTermIndexes,
      "search term",
    );
    const authorship =
      (flags & microsoftAuthoredFlag) !== 0
        ? "Microsoft"
        : "Community";
    const isAi = (flags & aiTemplateFlag) !== 0;
    const primaryService =
      primaryServiceIndex === null
        ? undefined
        : readString(
            data.strings,
            primaryServiceIndex,
            "primary service",
          );
    const detailPath = `/templates/${repository}`;
    const repositoryCoordinates = repository.split("/");
    const templateIdentifier = repository
      .toLowerCase()
      .replace(/^azure-samples\//, "");
    const searchText = [
      title,
      description,
      ...repositoryCoordinates,
      ...authors,
      ...legacyAuthors,
      ...compatibilityTags,
      ...languages,
      ...frameworks,
      ...databases,
      ...iac,
      ...tasks,
      authorship,
      ...searchTerms,
    ]
      .join(" ")
      .toLowerCase();

    return {
      id,
      title,
      description,
      detailPath,
      authors,
      legacyAuthors,
      authorship,
      isAi,
      featured: (flags & featuredTemplateFlag) !== 0,
      stars: stars ?? undefined,
      tasks,
      collections: isAi ? ["ai"] : [],
      compatibilityTags,
      languages,
      frameworks,
      databases,
      iac,
      serviceIds,
      primaryService,
      initCommand: `azd init -t ${templateIdentifier}`,
      searchText,
    };
  });
}

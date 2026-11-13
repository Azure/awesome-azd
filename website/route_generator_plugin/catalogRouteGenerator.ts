import * as fs from "fs";
import * as path from "path";
import type { LoadContext, Plugin } from "@docusaurus/types";
import { createCatalogTemplates } from "../src/catalog/catalogBuilder";
import { servicePages } from "../src/catalog/servicePages";
import { createCatalogPageData } from "../src/catalog/catalogWireFormat";
import type {
  CatalogTemplate,
  CatalogTemplateDetail,
} from "../src/catalog/catalogTypes";

const dataCreationBatchSize = 32;

function getCatalogMetadataPaths(siteDir: string) {
  return {
    templates: path.join(siteDir, "static", "templates.json"),
    reviewedUseCases: path.join(
      siteDir,
      "src",
      "catalog",
      "template-use-cases.json",
    ),
    repositoryMetrics: path.join(
      siteDir,
      "src",
      "catalog",
      "repository-metrics.generated.json",
    ),
  };
}

async function readJsonFile(filePath: string): Promise<unknown> {
  const contents = await fs.promises.readFile(filePath, "utf8");
  try {
    return JSON.parse(contents) as unknown;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON in '${filePath}': ${message}`);
  }
}

export async function loadCatalogTemplates(
  siteDir: string,
): Promise<CatalogTemplate[]> {
  const metadataPaths = getCatalogMetadataPaths(siteDir);
  const [templates, reviewedUseCases, repositoryMetrics] =
    await Promise.all([
      readJsonFile(metadataPaths.templates),
      readJsonFile(metadataPaths.reviewedUseCases),
      readJsonFile(metadataPaths.repositoryMetrics),
    ]);

  return createCatalogTemplates(
    templates,
    reviewedUseCases,
    repositoryMetrics,
  );
}

export function dataFileName(prefix: string, value: string): string {
  return `${prefix}-${encodeURIComponent(value)}.json`;
}

export function resolveDetailAsset(
  siteDir: string,
  value: string | undefined,
): string | undefined {
  if (value === undefined || /^https?:\/\//i.test(value)) {
    return value;
  }

  const staticRoot = path.resolve(siteDir, "static");
  const assetPath = path.resolve(
    staticRoot,
    value.replace(/^\.?\//, ""),
  );
  const relativePath = path.relative(staticRoot, assetPath);
  if (
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath) ||
    !fs.existsSync(assetPath) ||
    !fs.statSync(assetPath).isFile()
  ) {
    return undefined;
  }

  return value;
}

function toServiceTemplate(template: CatalogTemplate) {
  return {
    source: template.source,
    detailPath: template.detailPath,
    title: template.title,
    description: template.description,
    authors: template.authors,
    preview: template.preview,
    screenshot: template.screenshot,
    architectureDiagram: template.architectureDiagram,
  };
}

function toTemplateDetail(
  template: CatalogTemplate,
  siteDir: string,
): CatalogTemplateDetail {
  return {
    title: template.title,
    description: template.description,
    source: template.source,
    repository: template.repository,
    detailPath: template.detailPath,
    authors: template.authors,
    authorUrls: template.authorUrls,
    stars: template.stars,
    tasks: template.tasks,
    languages: template.languages,
    services: template.services,
    models: template.models,
    resources: template.resources,
    preview: resolveDetailAsset(siteDir, template.preview),
    architectureDiagram: resolveDetailAsset(
      siteDir,
      template.architectureDiagram,
    ),
    screenshot: resolveDetailAsset(siteDir, template.screenshot),
    initCommand: template.initCommand,
  };
}

async function mapInBatches<T, R>(
  values: readonly T[],
  mapper: (value: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let index = 0; index < values.length; index += dataCreationBatchSize) {
    results.push(
      ...(await Promise.all(
        values
          .slice(index, index + dataCreationBatchSize)
          .map(mapper),
      )),
    );
  }
  return results;
}

export default function catalogRouteGenerator(
  context: LoadContext,
): Plugin<CatalogTemplate[]> {
  return {
    name: "catalog-route-generator-plugin",
    getPathsToWatch: () =>
      Object.values(getCatalogMetadataPaths(context.siteDir)),
    loadContent: () => loadCatalogTemplates(context.siteDir),
    contentLoaded: async ({ content: catalogTemplates, actions }) => {
      const routes = new Map<string, string>();

      const addRoute = (
        route: string,
        source: string,
        component: string,
        modules: Record<string, string>,
      ) => {
        const existingSource = routes.get(route);
        if (existingSource && existingSource !== source) {
          throw new Error(
            `Duplicate catalog route '${route}' for ${existingSource} and ${source}`,
          );
        }
        if (existingSource) {
          return;
        }

        routes.set(route, source);
        actions.addRoute({
          path: route,
          component,
          exact: true,
          modules,
        });
      };

      const catalogPageDataPath = await actions.createData(
        "catalog-page.json",
        createCatalogPageData(catalogTemplates),
      );
      addRoute(
        `${context.siteConfig.baseUrl}templates`,
        "catalog",
        "@site/src/components/catalog/CatalogRoutePage",
        { catalogPage: catalogPageDataPath },
      );

      const detailPages = await mapInBatches(
        catalogTemplates,
        async (template) => ({
          template,
          dataPath: await actions.createData(
            dataFileName("template", template.repository),
            { template: toTemplateDetail(template, context.siteDir) },
          ),
        }),
      );

      for (const { template, dataPath } of detailPages) {
        addRoute(
          `${context.siteConfig.baseUrl}${template.detailPath.replace(
            /^\//,
            "",
          )}`,
          template.normalizedSource,
          "@site/src/components/catalog/TemplateDetailPage",
          { templatePage: dataPath },
        );
      }

      const templatesByService = new Map<string, CatalogTemplate[]>();
      for (const template of catalogTemplates) {
        for (const serviceId of template.serviceIds) {
          const templates = templatesByService.get(serviceId) ?? [];
          templates.push(template);
          templatesByService.set(serviceId, templates);
        }
      }

      for (const servicePage of servicePages) {
        const matchingTemplates =
          templatesByService.get(servicePage.config.serviceTag) ?? [];
        const servicePageDataPath = await actions.createData(
          dataFileName("service", servicePage.config.serviceTag),
          {
            config: servicePage.config,
            templates: matchingTemplates.slice(0, 6).map(toServiceTemplate),
            templateCount: matchingTemplates.length,
          },
        );

        addRoute(
          `${context.siteConfig.baseUrl}${servicePage.path}`,
          servicePage.config.serviceTag,
          "@site/src/components/ServiceLandingPage",
          { servicePage: servicePageDataPath },
        );
      }
    },
  };
}

import * as fs from "fs";
import * as path from "path";
import type { LoadContext, Plugin } from "@docusaurus/types";
import {
  catalogTemplates,
  type CatalogTemplate,
} from "../src/catalog/catalogData";
import { servicePages } from "../src/catalog/servicePages";

function dataFileName(prefix: string, value: string): string {
  return `${prefix}-${value.replace(/[^a-z0-9._-]/gi, "-")}.json`;
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
) {
  return {
    title: template.title,
    description: template.description,
    source: template.source,
    repository: template.repository,
    detailPath: template.detailPath,
    authors: template.authors,
    authorUrls: template.authorUrls,
    isAi: template.isAi,
    stars: template.stars,
    tasks: template.tasks,
    languages: template.languages,
    frameworks: template.frameworks,
    databases: template.databases,
    iac: template.iac,
    services: template.services,
    tools: template.tools,
    topics: template.topics,
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

export default function catalogRouteGenerator(
  context: LoadContext,
): Plugin<void> {
  return {
    name: "catalog-route-generator-plugin",
    contentLoaded: async ({ actions }) => {
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

      for (const template of catalogTemplates) {
        const detailPageDataPath = await actions.createData(
          dataFileName("template", template.repository),
          { template: toTemplateDetail(template, context.siteDir) },
        );

        addRoute(
          `${context.siteConfig.baseUrl}${template.detailPath.replace(
            /^\//,
            "",
          )}`,
          template.normalizedSource,
          "@site/src/components/catalog/TemplateDetailPage",
          { templatePage: detailPageDataPath },
        );
      }

      for (const servicePage of servicePages) {
        const matchingTemplates = catalogTemplates.filter((template) =>
          template.serviceIds.includes(servicePage.config.serviceTag),
        );
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

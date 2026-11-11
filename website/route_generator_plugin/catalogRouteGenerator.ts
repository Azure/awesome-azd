import type { LoadContext, Plugin } from "@docusaurus/types";
import {
  catalogTemplates,
  type CatalogTemplate,
} from "../src/catalog/catalogData";
import { servicePages } from "../src/catalog/servicePages";

type TemplateRecord = {
  source: string;
  templateType?: string | null;
  legacySources?: string[];
};

export function isCatalogTemplate(template: TemplateRecord): boolean {
  return (
    template.templateType == null ||
    template.templateType === "" ||
    template.templateType === "ai-app-templates"
  );
}

function dataFileName(prefix: string, value: string): string {
  return `${prefix}-${value.replace(/[^a-z0-9._-]/gi, "-")}.json`;
}

function toServiceTemplate(template: CatalogTemplate) {
  return {
    source: template.source,
    title: template.title,
    description: template.description,
    authors: template.authors,
    preview: template.preview,
    screenshot: template.screenshot,
    architectureDiagram: template.architectureDiagram,
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
        const templateDataPath = await actions.createData(
          dataFileName("template", template.id),
          template,
        );
        const modules = { template: templateDataPath };

        for (const slug of [template.slug, ...template.legacySlugs]) {
          addRoute(
            `${context.siteConfig.baseUrl}templates/${slug}`,
            template.source,
            "@site/src/components/catalog/TemplateDetailPage",
            modules,
          );

          if (template.isAi) {
            addRoute(
              `${context.siteConfig.baseUrl}templates/ai/repo/${slug}`,
              template.source,
              "@site/src/components/catalog/TemplateDetailPage",
              modules,
            );
          }
        }
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

import type { LoadContext, Plugin } from "@docusaurus/types";
import path from "path";

type TemplateRecord = {
  source: string;
  templateType?: string | null;
  legacySources?: string[];
};

function getRepositorySlug(source: string): string {
  const url = new URL(source);
  const parts = url.pathname.split("/").filter(Boolean);
  if (
    url.protocol !== "https:" ||
    url.hostname.toLowerCase() !== "github.com" ||
    parts.length !== 2 ||
    url.search ||
    url.hash
  ) {
    throw new Error(`Invalid AI template source: ${source}`);
  }

  return `${parts[0].toLowerCase()}/${parts[1]
    .replace(/\.git$/i, "")
    .toLowerCase()}`;
}

export function isCatalogTemplate(template: TemplateRecord): boolean {
  return (
    template.templateType == null ||
    template.templateType === "" ||
    template.templateType === "ai-app-templates"
  );
}

export default function aiRouteGenerator(context: LoadContext): Plugin<void> {
  return {
    name: "catalog-route-generator-plugin",
    contentLoaded: async ({ actions }) => {
      const templates = require(
        path.resolve(__dirname, "../static/templates.json"),
      ) as TemplateRecord[];
      const routes = new Map<string, string>();

      const addRoute = (
        route: string,
        source: string,
        component: string,
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
        });
      };

      for (const template of templates.filter(isCatalogTemplate)) {
        for (const source of [
          template.source,
          ...(template.legacySources ?? []),
        ]) {
          const slug = getRepositorySlug(source);
          addRoute(
            `${context.siteConfig.baseUrl}templates/${slug}`,
            template.source,
            "@site/src/components/catalog/TemplateDetailPage",
          );

          if (template.templateType === "ai-app-templates") {
            addRoute(
              `${context.siteConfig.baseUrl}templates/ai/repo/${slug}`,
              template.source,
              "@site/src/components/catalog/TemplateDetailPage",
            );
          }
        }
      }
    },
  };
}

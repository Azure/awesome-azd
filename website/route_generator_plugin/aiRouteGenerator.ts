import type { LoadContext, Plugin } from "@docusaurus/types";
import path from "path";

type TemplateRecord = {
  source: string;
  templateType?: string;
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

export default function aiRouteGenerator(context: LoadContext): Plugin<void> {
  return {
    name: "ai-route-generator-plugin",
    contentLoaded: async ({ actions }) => {
      const templates = require(
        path.resolve(__dirname, "../static/templates.json"),
      ) as TemplateRecord[];
      const routes = new Set<string>();

      for (const template of templates) {
        if (template.templateType !== "ai-app-templates") {
          continue;
        }

        for (const source of [
          template.source,
          ...(template.legacySources ?? []),
        ]) {
          const route = `${context.siteConfig.baseUrl}templates/ai/repo/${getRepositorySlug(
            source,
          )}`;
          if (routes.has(route)) {
            throw new Error(`Duplicate AI template route: ${route}`);
          }
          routes.add(route);
          actions.addRoute({
            path: route,
            component: "@site/src/ai/components/TemplateDetailPage",
            exact: true,
          });
        }
      }
    },
  };
}

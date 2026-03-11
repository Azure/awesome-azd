# Awesome-AZD Redesign — Agent Squad

## Squad Mission
Transform the awesome-azd gallery site from a static template listing into a vibrant, modern developer website that helps people discover and get started with `azd`.

## Agent Roster

| Agent | Role | Emoji | Primary Responsibilities |
|-------|------|-------|------------------------|
| **Crawler Agent** | Site Archaeologist | 🕷️ | Run Playwright to crawl the current site, capture screenshots, extract content inventory, generate sitemap |
| **Content Strategist Agent** | Content Architect | 📝 | Define information architecture, rewrite getting-started content, establish voice & tone guide |
| **UX/Design Agent** | Visual Designer | 🎨 | Create modern visual design system, redesign component styles, layout specifications |
| **Frontend Developer Agent** | Implementation Lead | 💻 | Implement Docusaurus theme customizations, build new components, filtering logic |
| **QA/Testing Agent** | Quality Assurance | 🧪 | Write and run Playwright tests, visual regression, accessibility, performance testing |

## Coordination Rules

1. **Crawler Agent runs first** — produces baseline artifacts that all other agents consume
2. **Content Strategist, UX/Design, and Frontend Developer** run in parallel after baseline is ready
3. These three agents share context and can inform each other's work
4. **QA/Testing Agent runs continuously** — first establishing baseline tests, then validating changes
5. All agents work within the existing **Docusaurus framework** in the `website/` directory

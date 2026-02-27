# Routing Rules — Awesome-AZD Redesign

## Signal → Agent Mapping

| Signal / Task | Route To |
|---------------|----------|
| Crawl current site, capture screenshots, baseline | 🕷️ Crawler Agent |
| Content inventory, sitemap extraction | 🕷️ Crawler Agent |
| Information architecture, page hierarchy | 📝 Content Strategist |
| Getting started page rewrite | 📝 Content Strategist |
| Voice & tone guide | 📝 Content Strategist |
| Content reorganization, taxonomy | 📝 Content Strategist |
| Visual design system (colors, typography) | 🎨 UX/Design Agent |
| Component redesign (template cards, hero) | 🎨 UX/Design Agent |
| Layout specs, responsive design | 🎨 UX/Design Agent |
| Dark mode styling | 🎨 UX/Design Agent |
| Docusaurus theme customization | 💻 Frontend Developer |
| React component implementation | 💻 Frontend Developer |
| Filtering & search improvements | 💻 Frontend Developer |
| Interior page template implementation | 💻 Frontend Developer |
| Playwright test suite | 🧪 QA/Testing Agent |
| Visual regression testing | 🧪 QA/Testing Agent |
| Accessibility audits | 🧪 QA/Testing Agent |
| Performance testing | 🧪 QA/Testing Agent |
| Deployment (`azd up` / GitHub Pages) | 🎯 Coordinator (Squad) |

## Phased Workflow

### Phase 1 — Baseline (Sequential)
- 🕷️ Crawler Agent produces: screenshots, content inventory, sitemap, template data extraction
- Output stored in `baseline/` directory

### Phase 2 — Design & Content (Parallel, after Phase 1)
- 📝 Content Strategist: IA document, content rewrites, voice/tone guide
- 🎨 UX/Design Agent: design system, layout specs, card redesign
- 💻 Frontend Developer: component scaffolding, theme config, filtering logic

### Phase 3 — Implementation (Parallel, iterative)
- 💻 Frontend Developer: implements designs and content
- 🎨 UX/Design Agent: reviews and refines
- 📝 Content Strategist: reviews copy and flow

### Phase 4 — Validation
- 🧪 QA/Testing Agent: regression, accessibility, performance, E2E tests
- 🎯 Coordinator: deployment

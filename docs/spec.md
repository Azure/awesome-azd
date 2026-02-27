# Product Spec: Awesome-AZD Site Redesign

> Source: [GitHub Issue #753](https://github.com/Azure/awesome-azd/issues/753)

## 1. Problem Statement

The awesome-azd gallery site (https://azure.github.io/awesome-azd/) has become outdated in both visual design and user experience. It is a major entry point for discovering Azure Developer CLI (`azd`) and getting-started templates. The current site lacks welcoming energy, clarity for getting started, and fails to convey the excitement and power of the `azd` ecosystem.

## 2. Target Audience

- **New developers** to Azure looking for starter templates and clear onboarding guidance
- **Experienced Azure developers** looking for best-practice templates, architecture patterns, and advanced scenarios
- **Template contributors** from the community who want to share and showcase their work

## 3. Success Metrics

| Metric | Target |
|--------|--------|
| Time to first deploy (from landing on site) | Significant reduction |
| Community engagement (template submissions, GitHub stars) | Measurable increase |
| Bounce rate | Reduction |
| Pages per session | Increase |

## 4. Current Site Structure

| Page | Description |
|------|-------------|
| Home (`/`) | Template gallery with filtering — main landing page |
| Getting Started (`/getting-started`) | Basic setup instructions |
| Contribute (`/docs/contribute`) | How to submit templates |
| External: Docs | Links to aka.ms/azd (Microsoft Learn) |
| External: Resources | Links to Azure Architecture Center |

## 5. Deliverables

### P0 — Must Have

| # | Deliverable | Owner | Status |
|---|-------------|-------|--------|
| D1 | Playwright baseline crawl (screenshots, sitemap, content inventory) | 🕷️ Crawler | ⬜ Not Started |
| D2 | Information architecture & content plan | 📝 Content Strategist | ⬜ Not Started |
| D3 | Getting started page rewrite | 📝 Content Strategist | ⬜ Not Started |
| D4 | Visual design system (colors, typography, components) | 🎨 UX/Design | ⬜ Not Started |
| D5 | Homepage redesign with hero section | 🎨 UX/Design + 💻 Frontend | ⬜ Not Started |
| D6 | Template card redesign | 🎨 UX/Design + 💻 Frontend | ⬜ Not Started |

### P1 — Should Have

| # | Deliverable | Owner | Status |
|---|-------------|-------|--------|
| D7 | Improved filtering & search | 💻 Frontend Developer | ⬜ Not Started |
| D9 | Playwright test suite (visual regression, a11y, perf) | 🧪 QA/Testing | ⬜ Not Started |
| D10 | Voice & tone guide for site copy | 📝 Content Strategist | ⬜ Not Started |

### P2 — Nice to Have

| # | Deliverable | Owner | Status |
|---|-------------|-------|--------|
| D8 | Interior page template (1-2 service pages) | All agents | ⬜ Not Started |

## 6. User Stories

### US-1: Capture Current Site Baseline
**As a** project team member  
**I want to** run a Playwright crawler against the current awesome-azd site  
**So that** I have a complete "before" snapshot including screenshots, content inventory, sitemap, and page structure

**Acceptance Criteria:**
- [ ] Playwright script crawls all pages of azure.github.io/awesome-azd
- [ ] Full-page screenshots captured for every unique route
- [ ] Content inventory generated (page titles, headings, text blocks, links, images)
- [ ] Sitemap/page-tree generated in structured format (JSON or markdown)
- [ ] All template card data extracted (names, descriptions, tags, links)
- [ ] Output stored in a structured `baseline/` directory
- [ ] Baseline report summarizing current site metrics (page count, template count, navigation depth)

### US-2: Define Content Architecture
**As a** site visitor  
**I want** content organized into clear, intuitive categories  
**So that** I can quickly find what I'm looking for whether I'm new to azd or experienced

**Acceptance Criteria:**
- [ ] Information architecture document defining top-level navigation and page hierarchy
- [ ] Clear separation between: discovery (templates), learning (getting started), and community (contribute)
- [ ] Content grouped by developer intent
- [ ] Taxonomy for template categorization reviewed and improved
- [ ] Existing README content (articles, videos, resources) surfaced as first-class site content

### US-3: Rewrite Getting Started Experience
**As a** developer new to azd  
**I want** a clear, exciting, step-by-step getting started guide  
**So that** I can go from zero to my first deployment as quickly as possible

**Acceptance Criteria:**
- [ ] Getting started page completely rewritten with clear, concise steps
- [ ] Includes `azd` installation instructions (or clear links)
- [ ] Showcases 2-3 "hero" templates that demonstrate the breadth of azd
- [ ] Interactive or visual flow showing: install → init → deploy → monitor
- [ ] Time-to-first-deploy is minimized
- [ ] Tone is energetic, welcoming, and developer-friendly
- [ ] Connects to Microsoft Learn documentation for deeper dives

### US-4: Modernize Visual Design
**As a** site visitor  
**I want** the site to feel modern, vibrant, and exciting  
**So that** my first impression of azd is positive and I'm motivated to explore further

**Acceptance Criteria:**
- [ ] Updated color palette, typography, and spacing
- [ ] Hero section on homepage that clearly communicates what azd is and why it matters
- [ ] Template cards redesigned with visual hierarchy
- [ ] Responsive design works on mobile, tablet, and desktop
- [ ] Dark mode support
- [ ] Visual design system documented for consistency

### US-5: Improve Template Discovery & Filtering
**As a** developer browsing templates  
**I want** powerful, intuitive filtering and search  
**So that** I can quickly narrow down to templates that match my tech stack and use case

**Acceptance Criteria:**
- [ ] Filter by: Azure service, language, framework, architecture pattern, difficulty level
- [ ] Search is prominent and fast
- [ ] Filter state persisted in URL for shareability
- [ ] "Featured" or "Popular" templates highlighted
- [ ] Template count displayed per filter category
- [ ] Clear empty states when no templates match
- [ ] Sort options (newest, most popular, alphabetical)

### US-6: Service-Specific Landing Pages (Future Phase)
**As a** developer interested in a specific Azure service  
**I want** a curated landing page that highlights relevant templates and getting-started guidance  
**So that** I can quickly find the best starting point for my specific technology choice

**Acceptance Criteria:**
- [ ] Template/framework for interior pages that can be reused across services
- [ ] Initial prototype for 1-2 services (e.g., Azure Functions, Azure Container Apps)
- [ ] Each page includes: service overview, curated templates, quick-start steps, related resources
- [ ] Pages linked from main navigation and from template tags
- [ ] Content is maintainable (markdown-based or data-driven)

## 7. Technical Constraints

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Docusaurus (keep existing) | Minimize migration risk |
| Hosting | GitHub Pages (keep existing) | No infrastructure changes needed |
| Crawler tool | Playwright | Modern, reliable |
| Content format | Markdown + React components | Docusaurus native; maintainable |

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Docusaurus customization limits | May constrain visual design | Evaluate early; pivot to swizzled components if needed |
| Content staleness | Templates/resources may be outdated | Content audit as part of baseline crawl |
| Agent coordination complexity | Parallel agents may conflict | Clear interface contracts between agents |
| Breaking existing template URLs | SEO and bookmark disruption | Maintain URL redirects for any changes |

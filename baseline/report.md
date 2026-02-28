# Awesome-AZD — Baseline Site Report

> Generated: 2026-02-27 | Source: repository analysis + static content extraction

---

## 1. Site Overview

| Property | Value |
|----------|-------|
| **URL** | https://azure.github.io/awesome-azd/ |
| **Framework** | Docusaurus 3.7.0 |
| **Hosting** | GitHub Pages |
| **Base Path** | `/awesome-azd/` |
| **Theme** | Classic (Infima CSS framework) |
| **UI Library** | Fluent UI (React Components + v8 Panel) |
| **Dark Mode** | Supported (respects system preference) |

---

## 2. Site Map — All Routes

```
/                              → Homepage (template gallery + search/filters)
/getting-started               → Getting Started page (hero banner + action cards)
/docs/contribute               → Contributor Guide (markdown doc)
/docs/extensions               → Extensions documentation (markdown doc)
/docs/faq/what-is-azd          → FAQ: What is azd?
/docs/faq/what-is-an-azd-template → FAQ: What is an azd template?
/docs/faq/how-to-use-azd-templates → FAQ: How to use azd templates?
/docs/faq/discover-azd         → FAQ: Discover azd
/docs/faq/create-template      → FAQ: Create a template
/docs/faq/contribute-template  → FAQ: Contribute a template
/docs/faq/rate-template        → FAQ: Rate a template
/docs/faq/request-a-template   → FAQ: Request a template
```

### Redirects

| From | To |
|------|----|
| `/about` | `/getting-started` |
| `/docs/intro` | `/docs/contribute` |
| `/docs/faq/azd` | `/docs/faq/what-is-azd` |
| `/docs/faq/azd-template` | `/docs/faq/what-is-an-azd-template` |
| `/docs/faq/use-azd-templates` | `/docs/faq/how-to-use-azd-templates` |
| `/docs/faq/request-template` | `/docs/faq/request-a-template` |

### External Links in Navigation

| Label | URL |
|-------|-----|
| Docs | https://aka.ms/azd |
| Resources | https://learn.microsoft.com/azure/architecture/browse/ |
| GitHub | https://github.com/Azure/awesome-azd |

**Total internal pages: 12**  
**Total redirects: 6**  
**Navigation depth: max 2 levels** (navbar → docs/faq/*)

---

## 3. Navigation Structure

### Top Navbar (left → right)

| Position | Label | Type | Target |
|----------|-------|------|--------|
| Left | awesome-azd (logo) | Link | `/` (home) |
| Left | Getting Started | Link | `/getting-started` |
| Left | Contribute | Doc link | `/docs/contribute` |
| Left | Docs | External | https://aka.ms/azd |
| Left | Resources | External | https://learn.microsoft.com/azure/architecture/browse/ |
| Right | GitHub icon | External | https://github.com/Azure/awesome-azd |
| Right | "Submit your template!" | Button (CTA) | `/docs/contribute` |

### Footer Links

| Label | URL |
|-------|-----|
| azd-templates | https://github.com/topics/azd-templates |
| azd Reference | https://learn.microsoft.com/azure/developer/azure-developer-cli/reference |
| Privacy Statement | https://privacy.microsoft.com/privacystatement |
| Manage Cookies | (cookie consent) |
| Built With Docusaurus | https://docusaurus.io |
| Copyright © Microsoft | https://microsoft.com |

### Docs Sidebar

- Contributor Guide (`/docs/contribute`)
- Extensions (`/docs/extensions`)
- FAQ (folder with 8 items)

---

## 4. Page-by-Page Content Inventory

### 4.1 Homepage (`/`)

**Purpose:** Template gallery — the primary landing page and main user experience.

**Components:**
- `ShowcaseTemplateSearch` — search bar at top
- `ShowcaseLeftFilters` — sidebar filter panel (tags, languages, frameworks, Azure services, IaC, authors)
- `ShowcaseCardPage` → renders `ShowcaseCard` components in a grid
- `BackToTopButton` — scroll-to-top FAB

**Filtering System:**
- URL-based state (`?tags=...&authors=...`) for shareability
- Filter categories: Tags, Languages, Frameworks, Azure Services, IaC, Authors
- Client-side filtering (no server)
- No search-as-you-type for template content (tag-based only)

**Template Card Anatomy:**
- Header: Author badge (Microsoft/Community) + "New"/"Popular" indicators
- Title (clickable → opens side panel)
- Author name
- Description text
- Tag chips (overflow with "+N more")
- Footer: `azd init -t <repo>` command + copy button

**Side Panel (on card click):**
- Full template details
- Architecture diagram / preview image
- All tags displayed
- Links to source repo

**Pain Points Identified:**
- No hero section — drops straight into gallery
- No explanation of what azd is
- No visual hierarchy for featured/recommended templates
- Filter sidebar can be overwhelming for new users
- No sort options visible
- No difficulty/complexity indicators
- No template count per filter

### 4.2 Getting Started (`/getting-started`)

**Purpose:** Introduce azd and guide new users.

**Components:**
- `HomepageHeader` — hero banner with background image + embedded YouTube video
- `HomepageFeatures` — 4 action cards in a grid

**Hero Content:**
- Title: "Accelerate your journey to the cloud with azd"
- Subtitle: "Azure Developer CLI (azd) is an open-source tool that accelerates your application's journey from local development to Azure."
- Embedded YouTube video: "Azure Developer CLI: GitHub to cloud in minutes - Universe 2022"

**Action Cards:**
| Card | Description | Link Target |
|------|-------------|-------------|
| Discover Templates | View gallery | https://azure.github.io/awesome-azd/ |
| Learn more about azd | View docs | https://aka.ms/azd |
| Create your own template | Try learn module | Microsoft Learn |
| Contribute to the Gallery | View contributor guide | /docs/contribute |

**Pain Points Identified:**
- YouTube video is from 2022 (Universe 2022) — likely outdated
- No step-by-step installation flow
- No "hero" templates showcased
- Action cards link mostly to external sites
- Minimal excitement / energy in the copy
- No interactive flow (install → init → deploy → monitor)

### 4.3 Contribute (`/docs/contribute`)

**Purpose:** Guide for submitting templates to the gallery.

**Content:**
- Brief intro ("We ♥️ Contributions!")
- Link to create a PR
- Detailed instructions for `templates.json` entry format
- Required fields listed (title, description, preview, author, source, tags, etc.)

**Pain Points Identified:**
- Text-heavy, no visual guide
- No link to example PRs
- Template submission UX is entirely GitHub-based

### 4.4 FAQ Pages (`/docs/faq/*`)

8 FAQ documents covering:
1. What is azd?
2. What is an azd template?
3. How to use azd templates?
4. Discover azd
5. Create a template
6. Contribute a template
7. Rate a template
8. Request a template

---

## 5. Template Gallery Statistics

### 5.1 Overview

| Metric | Count |
|--------|-------|
| **Total templates** | **292** |
| Microsoft-authored | 163 (55.8%) |
| Community-authored | 129 (44.2%) |
| Tagged "new" | 12 |
| Tagged "popular" | 7 |
| Tagged "AI" | 80 (27.4%) |
| AI Collection | 21 |

### 5.2 Top Languages

| Language | Templates | % |
|----------|-----------|---|
| Python | 82 | 28.1% |
| .NET/C# | 60 | 20.5% |
| TypeScript | 50 | 17.1% |
| JavaScript | 41 | 14.0% |
| Node.js | 34 | 11.6% |
| Java | 23 | 7.9% |
| Go | 2 | 0.7% |
| PHP | 1 | 0.3% |
| Ruby | 1 | 0.3% |

### 5.3 Top Frameworks

| Framework | Templates |
|-----------|-----------|
| React | 23 |
| RAG | 18 |
| FastAPI | 15 |
| Flask | 12 |
| Semantic Kernel | 8 |
| Spring | 7 |
| Blazor | 7 |
| Django | 4 |
| NestJS | 3 |
| Streamlit | 3 |

### 5.4 Top Azure Services

| Azure Service | Templates |
|---------------|-----------|
| Azure Container Apps | 90 |
| Azure Managed Identities | 82 |
| Azure OpenAI | 77 |
| Azure Functions | 69 |
| App Insights | 55 |
| Azure Key Vault | 53 |
| Azure App Service | 53 |
| Azure Monitor | 48 |
| Azure Cosmos DB | 45 |
| Azure Virtual Networks | 44 |
| Azure AI Service | 34 |
| Azure Blob Storage | 26 |
| Azure Log Analytics | 25 |
| Azure Storage | 24 |
| Azure PostgreSQL | 22 |
| Azure SQL | 19 |
| Azure API Management | 19 |
| Azure AI Search | 18 |
| Azure AI Foundry | 18 |
| Azure Static Web Apps | 14 |

### 5.5 Infrastructure as Code

| IaC | Templates | % |
|-----|-----------|---|
| Bicep | 204 | 69.9% |
| Terraform | 9 | 3.1% |
| (untagged) | 79 | 27.1% |

### 5.6 Topic Tags

| Topic | Templates |
|-------|-----------|
| AI | 80 |
| GPT | 27 |
| MCP | 16 |
| MongoDB | 14 |
| Web Apps | 20 |
| Dapr | 11 |

---

## 6. Visual Design Inventory

### 6.1 Color Palette

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--ifm-color-primary` | `#6b5bdc` (purple) | `#a79cf1` (light purple) |
| `--ifm-color-purple` | `#6b5bdc` | `#a79cf1` |
| Button background | `#7160e8` | `#5649b0` |
| Button hover | `#5a4cb9` | `#443a8c` |
| Navbar link color | `#242424` | white |
| Card "New" badge | `#11910D` (green) | — |
| Card "Popular" badge | `#F7630C` (orange) | — |
| Card tag text | `#606060` | — |
| Card footer text | `#424242` | — |

### 6.2 Typography

- **Framework default:** Infima CSS (system font stack)
- **Custom:** Fluent UI typography styles (largeTitle, title3, subtitle1) used on Getting Started page
- **Navbar:** 16px
- **Card tags:** 10px
- **No custom font imports found**

### 6.3 Key UI Components

| Component | Library | Notes |
|-----------|---------|-------|
| Navbar | Docusaurus/Infima | Standard top navbar with sticky behavior |
| Template cards | Fluent UI `Card` | Grid layout, fixed height |
| Side panel | Fluent UI v8 `Panel` | Opens on card click, PanelType.medium |
| Search bar | Custom component | Part of ShowcaseTemplateSearch |
| Filter sidebar | Custom component | Checkbox-based, grouped by category |
| Action cards (Getting Started) | Custom `Feature` component | SVG icon + text + link |
| Footer | Docusaurus/Infima | Light style, flat link list |
| Back to top | Custom button | Fixed position, bottom-right |

### 6.4 Static Assets

| Asset Type | Location | Count |
|------------|----------|-------|
| Template preview images | `static/templates/images/` | ~280+ |
| Azure service SVG icons | `static/img/Azure-*.svg` | ~50+ |
| Site branding | `static/img/logo.png`, favicon.ico | 2 |
| Feature card SVGs | `static/img/home-*.svg` | 4 |
| Cover backgrounds | `static/img/coverBackground*.png` | 2 (light/dark) |

---

## 7. Component Architecture

```
Layout (Docusaurus)
├── Homepage (/)
│   ├── ShowcaseTemplateSearch     ← search bar
│   ├── ShowcaseLeftFilters        ← filter sidebar
│   │   ├── ShowcaseTagSelect      ← tag checkbox groups
│   │   └── ShowcaseAuthorSelect   ← author filter
│   ├── ShowcaseCardPage           ← paginated card grid
│   │   ├── ShowcaseCard           ← individual template card
│   │   │   ├── ShowcaseMultipleAuthors
│   │   │   ├── ShowcaseCardTag    ← tag chips
│   │   │   └── ShowcaseCardPanel  ← side panel (on click)
│   │   └── ShowcaseEmptyResult    ← no-results state
│   └── BackToTopButton
│
├── Getting Started (/getting-started)
│   ├── HomepageHeader             ← hero with video
│   └── HomepageFeatures           ← 4 action cards
│       └── Feature                ← individual action card
│
├── Extensions (/extensions page)
│   ├── ShowcaseExtensionCards     ← extension gallery
│   └── ShowcaseExtensionCard      ← individual extension card
│
└── Docs (/docs/*)
    ├── contribute.md
    ├── extensions.md
    └── 1-faq/ (8 FAQ pages)
```

---

## 8. Known Issues & Technical Debt

1. **Mixed Fluent UI versions** — Uses both Fluent UI v9 (`@fluentui/react-components`) and v8 (`@fluentui/react` Panel, ThemeProvider)
2. **Commented-out code** — `getLastUpdateDate()` function in ShowcaseCard is disabled (was trying to fetch last commit date via `gh api`)
3. **Hardcoded URLs** — Some links use full `azure.github.io/awesome-azd/` instead of relative paths
4. **Loading delay hack** — Both homepage and getting-started use `setTimeout` to delay rendering (100ms and 500ms)
5. **No error boundaries** — React components don't have error boundaries
6. **External script dependencies** — Azure analytics + cookie consent loaded via `<script>` tags
7. **Unused/commented CSS** — Dark theme CSS block commented out in custom.css
8. **No search indexing** — No Algolia or local search plugin configured

---

## 9. Summary of Pain Points (Priority Order)

1. **Homepage is gallery-only** — No hero, no explanation of azd, no onboarding guidance
2. **Getting Started is disconnected** — Separate page with outdated video, not the landing experience
3. **No visual hierarchy** — All 292 templates displayed equally; no featured/curated sections
4. **Filter UX is flat** — Works but doesn't guide discovery; no template counts per filter
5. **No sort options** — Can't sort by newest, popular, etc.
6. **No difficulty indicators** — Templates range from simple to complex with no guidance
7. **Outdated content** — YouTube video from 2022
8. **Design feels utilitarian** — Purple theme is fine but not exciting; lacks modern developer site energy
9. **No interior/service pages** — Can't browse templates by Azure service with context
10. **Content buried in README** — Resources, articles, videos not surfaced on site

---

## 10. Baseline Metrics

| Metric | Value |
|--------|-------|
| Total pages | 12 internal + 6 redirects |
| Total templates | 292 |
| Total tags defined | 163 tag types across 10 categories |
| Total Azure services represented | 50+ |
| Languages supported | 9 |
| Frameworks supported | 22 |
| Navigation max depth | 2 levels |
| Components | ~15 custom React components |
| CSS customization | Minimal (98 lines custom.css) |

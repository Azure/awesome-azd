# Information Architecture — Awesome-AZD Redesign

> 📝 Content Strategist | D2 Deliverable

## Navigation Redesign

### Primary Navigation (Top Navbar)

| Position | Label | Target | Change |
|----------|-------|--------|--------|
| Left | awesome-azd (logo) | `/` | Keep |
| Left | **Templates** | `/` | Rename from implicit; scrolls to gallery |
| Left | **Getting Started** | `/getting-started` | Keep — rewrite content |
| Left | **Contribute** | `/docs/contribute` | Keep |
| Left | **Docs** | https://aka.ms/azd | Keep (external) |
| Right | GitHub icon | GitHub repo | Keep |
| Right | **"Add a template"** | `/docs/contribute` | Rename CTA for clarity |

### Content Organization by Intent

```
Developer Intent              → Page / Section
─────────────────────────────────────────────────
"What is azd?"                → / (hero section) + /getting-started
"Show me templates"           → / (gallery section)
"I want to deploy something"  → / (gallery) → card → azd init command
"How do I get started?"       → /getting-started (step-by-step)
"I want to contribute"        → /docs/contribute
"Tell me about [service]"     → /services/[service] (future: D8)
"I have a question"           → /docs/faq/*
```

### Page Hierarchy

```
/                                    ← Homepage (hero + gallery)
├── Hero section                     ← NEW: what is azd, key stats, CTA
├── Template gallery                 ← Existing: search + filters + cards
│
/getting-started                     ← Rewritten onboarding flow
├── Install azd                      ← Step 1
├── Pick a template                  ← Step 2 (links to gallery)
├── Deploy to Azure                  ← Step 3
├── Hero templates showcase          ← 3 curated templates
│
/docs/
├── contribute                       ← Contributor guide (keep)
├── extensions                       ← Extensions docs (keep)
└── faq/                             ← FAQ articles (keep)
    ├── what-is-azd
    ├── what-is-an-azd-template
    ├── how-to-use-azd-templates
    ├── discover-azd
    ├── create-template
    ├── contribute-template
    ├── rate-template
    └── request-a-template
```

## Content Gaps Identified

1. **No "what is azd" content on homepage** — Hero section needed
2. **No stats/social proof** — Template count, community size
3. **Getting started is passive** — Needs active, step-by-step flow
4. **README content not surfaced** — Articles, videos, resources buried in GitHub
5. **No difficulty indicators** — Templates have no beginner/intermediate/advanced tags

## Voice & Tone Guidelines (D10)

### Principles

| Principle | Do | Don't |
|-----------|----|-------|
| **Developer-first** | "Deploy in 3 commands" | "Leverage our enterprise-grade solutions" |
| **Energetic** | "Ship to Azure in minutes" | "Azure Developer CLI is a tool that..." |
| **Action-oriented** | "Get started", "Try it now" | "Read about", "Learn more about" |
| **Inclusive** | "Whether you're new to Azure or a pro" | "For advanced developers" |
| **Concise** | One sentence per concept | Walls of text |

### Tone Examples

- **Hero headline:** "From code to cloud in minutes"
- **Hero subtitle:** "Azure Developer CLI (azd) templates give you production-ready apps with infrastructure, CI/CD, and monitoring — all deployable with a single command."
- **CTA buttons:** "Browse templates" / "Get started" (not "Learn more")
- **Empty state:** "No templates match your filters. Try broadening your search or browse all templates."

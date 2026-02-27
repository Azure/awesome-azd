# Decisions Log — Awesome-AZD Redesign

## Standing Decisions

| Date | Decision | Rationale | Agent |
|------|----------|-----------|-------|
| 2026-02-27 | Keep Docusaurus as framework | Minimize migration risk; Docusaurus is capable enough for the redesign goals | Coordinator |
| 2026-02-27 | Keep GitHub Pages hosting | No infrastructure changes needed | Coordinator |
| 2026-02-27 | Use Playwright for crawling & testing | Modern, reliable, excellent for screenshots + content extraction | Coordinator |
| 2026-02-27 | Content format: Markdown + React components | Docusaurus native; maintainable by contributors | Coordinator |
| 2026-02-27 | Site remains static (no backend/DB) | Out of scope for initial release | Coordinator |

## Out of Scope (Initial Release)

- Migration away from Docusaurus
- Backend services or databases
- Full rollout of all interior/service-specific pages (only 1-2 prototypes)
- Template submission workflow redesign (keep existing GitHub issue-based process)
- Analytics platform integration
- Internationalization / localization

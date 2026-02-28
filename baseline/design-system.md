# Visual Design System — Awesome-AZD Redesign

> 🎨 UX/Design Agent | D4 Deliverable

## Color Palette

### Primary Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--azd-color-primary` | `#6b5bdc` | `#a79cf1` | Primary actions, links |
| `--azd-color-primary-hover` | `#5a4cb9` | `#8b7fe0` | Hover states |
| `--azd-color-accent` | `#0078d4` | `#4ea8e6` | Secondary CTA, Azure brand |
| `--azd-color-success` | `#107c10` | `#54b054` | "New" badges, success states |
| `--azd-color-warning` | `#f7630c` | `#f7630c` | "Popular" badges |

### Surface Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--azd-surface-primary` | `#ffffff` | `#1a1a1a` | Page background |
| `--azd-surface-secondary` | `#f5f5f5` | `#252525` | Hero section, cards |
| `--azd-surface-tertiary` | `#ebebeb` | `#333333` | Card hover, borders |

### Text Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--azd-text-primary` | `#242424` | `#f5f5f5` | Headings, body |
| `--azd-text-secondary` | `#616161` | `#adadad` | Descriptions, metadata |
| `--azd-text-tertiary` | `#8a8a8a` | `#8a8a8a` | Placeholders, hints |

## Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Hero headline | System (Segoe UI / SF Pro) | 40px / 2.5rem | 700 |
| Hero subtitle | System | 20px / 1.25rem | 400 |
| Section heading | System | 28px / 1.75rem | 600 |
| Card title | System | 16px / 1rem | 600 |
| Card description | System | 14px / 0.875rem | 400 |
| Tag chip | System | 12px / 0.75rem | 500 |
| Body text | System | 16px / 1rem | 400 |

## Component Specifications

### Hero Section (D5)

```
┌─────────────────────────────────────────────────┐
│  Background: gradient or subtle pattern          │
│                                                  │
│    "From code to cloud in minutes"    [h1, 40px] │
│    subtitle text                      [p, 20px]  │
│                                                  │
│   [Browse templates]  [Get started]   [buttons]  │
│                                                  │
│   ╔══════╗  ╔══════╗  ╔══════╗       [stats]    │
│   ║ 292  ║  ║ 50+  ║  ║ 9    ║                  │
│   ║templ.║  ║svc.  ║  ║langs ║                  │
│   ╚══════╝  ╚══════╝  ╚══════╝                  │
└─────────────────────────────────────────────────┘
```

- Height: auto (content-driven), min ~320px
- Background: existing gradient background image (light/dark variants)
- CTA buttons: Primary (filled) + Secondary (outline)
- Stats bar: 3 key metrics displayed as pill badges

### Template Card Redesign (D6)

```
┌────────────────────────────────────────┐
│ [Microsoft ✦] / [Community ♦]    [New] │  ← header badges
├────────────────────────────────────────┤
│                                        │
│  Template Title                        │  ← 16px semibold, clickable
│  by Author Name                        │  ← 14px secondary color
│                                        │
│  Description text goes here...         │  ← 14px, 2-line clamp
│                                        │
│  [Python] [ACA] [OpenAI] [+3]         │  ← tag chips
│                                        │
├────────────────────────────────────────┤
│  azd init -t repo/name     [📋 Copy]  │  ← footer with copy
└────────────────────────────────────────┘
```

Changes from current:
- Cleaner header with less visual noise
- Description gets 2-line clamp (currently unclamped)
- Tags displayed more compactly
- Better visual hierarchy with consistent spacing

### Getting Started Cards

Keep existing Feature card layout but update:
- Larger icons (80px → 96px)
- More prominent link text
- Add a subtle hover elevation effect

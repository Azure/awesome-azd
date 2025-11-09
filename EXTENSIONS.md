# Azure Developer CLI Extensions Browser

## Overview

The Azure Developer CLI Extensions Browser is a comprehensive feature that allows developers to easily discover, search, and filter azd extensions. This document outlines the design and implementation strategy.

## Background

Azure Developer CLI (azd) supports extensions that enhance functionality through:
- **Event Handlers**: Custom logic at lifecycle points (preprovision, prepackage, predeploy)
- **Service Target Providers**: Custom deployment patterns for specialized Azure services
- **Custom Commands**: Additional CLI commands provided by extensions

Extensions are distributed through registries (similar to npm/nuget feeds) defined in JSON manifests.

## Goals

1. Create a discoverable, searchable gallery for azd extensions
2. Provide a marketing/landing page explaining extension capabilities
3. Enable filtering by extension capabilities, author, namespace, and other metadata
4. Show installation and usage instructions for each extension
5. Mirror the successful template gallery pattern

## Data Model

### Extension Registry Schema

Based on the official azd extension registry schema, each extension includes:

```typescript
interface Extension {
  id: string;                    // Unique identifier (e.g., "microsoft.azd.demo")
  namespace: string;             // Short namespace (e.g., "demo")
  displayName: string;           // Human-readable name
  description: string;           // Extension purpose and features
  author: string;                // Author name or organization
  authorUrl?: string;            // Link to author profile/org
  source?: string;               // Source code repository URL
  preview?: string;              // Preview image/icon path
  tags: ExtensionTagType[];      // Filter tags (msft, community, etc.)
  capabilities: string[];        // Extension capabilities
  latestVersion?: {
    version: string;
    usage: string;               // How to use the extension
    examples?: {
      name: string;
      description: string;
      usage: string;
    }[];
  };
}
```

### Extension Tags

New tag categories for extensions:

**Capability Tags:**
- `custom-commands` - Provides custom CLI commands
- `lifecycle-events` - Handles project/service events
- `service-targets` - Custom service target providers
- `mcp-server` - Model Context Protocol server support

**Source Tags:**
- `msft` - Microsoft authored
- `community` - Community contributed
- `official` - Official registry
- `dev` - Development/experimental registry

## Page Structure

### 1. Extensions Landing Page (`/extensions`)

**Purpose**: Marketing and education about azd extensions

**Content Sections:**
- Hero section with value proposition
- "What are azd extensions?" explanation
- Key capabilities showcase:
  - Event Handlers
  - Service Target Providers
  - Custom Commands
- Featured extensions carousel/grid
- Getting started guide
- Call-to-action buttons:
  - Browse All Extensions
  - Learn to Build Extensions
  - View Documentation

**Visual Design:**
- Modern, engaging layout similar to template landing page
- Code snippets showing installation/usage
- Icons/illustrations for each capability type
- Responsive design for mobile/tablet/desktop

### 2. Extensions Gallery Page (`/extensions/gallery`)

**Purpose**: Searchable, filterable extension browser

**Features:**
- Search bar for text search across name/description
- Left sidebar filters:
  - Capabilities (checkboxes)
  - Author/Source (checkboxes: Microsoft, Community)
  - Registry (Official, Dev)
- Extension cards displaying:
  - Extension name and namespace
  - Description
  - Author
  - Capabilities badges
  - Latest version
  - Installation command
  - Usage examples (expandable)
- Card actions:
  - View Details (modal or dedicated page)
  - Copy install command
  - Link to source repository
  - Link to documentation

**Filtering Logic:**
- Combine search text with selected filters
- Real-time filtering as users type/select
- URL query parameters for shareable filtered views
- Clear all filters option

## Component Architecture

### New Components

1. **ExtensionCard** (`src/components/gallery/ExtensionCard/`)
   - Similar to ShowcaseCard but adapted for extensions
   - Shows namespace, capabilities, version
   - Install command with copy button
   - Expandable usage examples

2. **ExtensionLeftFilters** (`src/components/gallery/ExtensionLeftFilters/`)
   - Adapted from ShowcaseLeftFilters
   - Capability filters
   - Author filters
   - Registry filters

3. **ExtensionSearch** (`src/components/gallery/ExtensionSearch/`)
   - Search bar for extensions
   - Similar to ShowcaseTemplateSearch

4. **ExtensionCapabilityTag** (`src/components/gallery/ExtensionCapabilityTag/`)
   - Visual badges for capabilities
   - Similar to ShowcaseTag

### Reusable Components

Leverage existing components where applicable:
- FluentUI components
- Tag selection components
- Filter panel structure

## Data Management

### Extensions Data File

**Location**: `website/static/extensions.json`

**Initial Data Source**: 
- Populate from official azd extension registry
- Include sample extensions from development registry
- Allow community submissions via GitHub issues/PRs

**Update Strategy**:
- Manual curation initially
- Future: automated sync from official registry
- Community contribution workflow similar to templates

### Extension Tags

**Location**: `website/src/data/extensionTags.tsx` or extend `tags.tsx`

**Tag Definitions**:
```typescript
export type ExtensionTagType = 
  | "msft"
  | "community"
  | "custom-commands"
  | "lifecycle-events"
  | "service-targets"
  | "mcp-server"
  | "official"
  | "dev"
  | "featured";

export const ExtensionTags: { [type in ExtensionTagType]: Tag } = {
  "custom-commands": {
    label: "Custom Commands",
    description: "Provides additional CLI commands",
    type: "Capability"
  },
  "lifecycle-events": {
    label: "Lifecycle Events",
    description: "Handles project and service lifecycle events",
    type: "Capability"
  },
  // ... more tags
};
```

## Navigation Updates

Add to navbar in `docusaurus.config.js`:

```javascript
{
  to: "/extensions",
  label: "Extensions",
  position: "left",
}
```

## Testing Strategy

### Unit Tests

1. **Extension Tag Validation** (`test/extension_tags_match.test.ts`)
   - Verify all tags in extensions.json exist in extensionTags
   - Validate data schema

2. **Extension Filter Logic** (`test/extension_filter.test.ts`)
   - Test capability filtering
   - Test author filtering
   - Test search functionality

### Manual Testing

1. Navigate to /extensions landing page
2. Verify marketing content displays correctly
3. Navigate to gallery
4. Test filtering by capabilities
5. Test search functionality
6. Verify extension cards display correctly
7. Test installation command copy
8. Test responsive design on mobile

## Implementation Phases

### Phase 1: Data & Infrastructure
- Create extension tag definitions
- Create extensions.json with initial data
- Add extension types to TypeScript definitions

### Phase 2: Landing Page
- Create /extensions landing page
- Add marketing content
- Add featured extensions section
- Add navigation links

### Phase 3: Gallery Components
- Build ExtensionCard component
- Build ExtensionLeftFilters component
- Build ExtensionSearch component
- Build main gallery page

### Phase 4: Testing & Polish
- Write unit tests
- Manual testing
- Screenshots and documentation
- Code review
- Security scan

## Future Enhancements

1. **Automated Registry Sync**: Periodically sync from official registries
2. **Extension Details Page**: Dedicated page for each extension with full documentation
3. **Version History**: Show all available versions and changelog
4. **Rating/Reviews**: Community feedback mechanism
5. **Install Analytics**: Track popular extensions
6. **Extension Builder Guide**: In-depth tutorial for creating extensions
7. **Extension Submission Workflow**: Streamlined process for community extensions
8. **Registry Health Checks**: Validate extension availability and checksums

## Success Metrics

- Number of extension views
- Filter usage patterns
- Install command copies
- Navigation from landing to gallery
- Time spent on extensions pages
- Community extension submissions

## References

- [Extension Framework Documentation](https://github.com/Azure/azure-dev/blob/main/cli/azd/docs/extension-framework.md)
- [Extension Framework Services](https://github.com/Azure/azure-dev/blob/main/cli/azd/docs/extension-framework-services.md)
- [Official Extension Registry](https://aka.ms/azd/extensions/registry)
- [Extension Registry Schema](https://github.com/Azure/azure-dev/blob/main/cli/azd/extensions/registry.schema.json)

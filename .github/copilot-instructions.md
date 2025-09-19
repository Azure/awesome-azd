# Awesome Azure Developer CLI (azd) 

Awesome azd is a Docusaurus-based website showcasing Azure Developer CLI templates. The site serves as a discovery platform for azd templates, provides contribution guides, and hosts a searchable gallery of community and Microsoft-authored templates.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

Bootstrap, build, and test the repository:

- Ensure Node.js 18+ is available: `node --version` (should show v20.19.5 or later)
- Navigate to website directory: `cd website`
- Install dependencies: `npm ci` -- takes ~15-60 seconds with warnings about deprecated packages (this is normal)
- Run tests: `npm test` -- takes ~1 second. NEVER CANCEL. Set timeout to 30+ seconds.
- Build the website: `npm run build` -- takes ~75 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
- Start development server: `npm run start` -- takes ~30 seconds to compile. NEVER CANCEL. Set timeout to 60+ seconds.
- Serve production build: `npm run serve` -- starts immediately after build

## Critical Timing and Timeout Requirements

- **npm ci**: 15-60 seconds (normal with deprecated package warnings about rimraf, glob, inflight)
- **npm test**: 1 second (set timeout to 30+ seconds)
- **npm run build**: 75 seconds (set timeout to 120+ seconds)  
- **npm run start**: 30 seconds initial compile (set timeout to 60+ seconds)
- **NEVER CANCEL any build or test commands** - they will complete successfully

## Manual Validation Requirements

After making any changes to the website, ALWAYS validate functionality by:

1. Start the development server: `cd website && npm run start`
2. Wait for "Compiled successfully" message
3. Test website accessibility: `curl -f "http://localhost:3000/awesome-azd/"`
4. Navigate to key pages and verify:
   - Homepage displays template gallery correctly
   - Getting Started page loads with video and action cards
   - Contribute page shows documentation
   - All navigation links work

## Repository Structure

Key directories and files:
- `website/` - Main Docusaurus application
  - `src/` - React components, pages, and data
  - `docs/` - Markdown documentation files
  - `static/` - Static assets including `templates.json` (5548 lines)
  - `package.json` - Dependencies and npm scripts
- `.github/workflows/` - CI/CD pipelines (release.yml, test-deploy.yml)
- `README.md` - Project overview and resources
- `GALLERY.md` - Gallery documentation

## Available Commands

All commands must be run from the `website/` directory:

- `npm ci` - Install dependencies (required first step)
- `npm test` - Run Jest tests (validates templates.json against tags)
- `npm run build` - Build production website to `build/` directory
- `npm run start` - Start development server at http://localhost:3000/awesome-azd/
- `npm run serve` - Serve production build locally
- `npm run docusaurus` - Direct Docusaurus CLI access

## Key Technologies

- **Docusaurus 3.7.0** - Static site generator
- **React 18** - UI framework
- **TypeScript** - Type checking
- **Jest** - Testing framework
- **Fluent UI** - Microsoft design system components
- **Node.js 20+** - Runtime requirement

## Template Gallery System

The template gallery is driven by:
- `website/static/templates.json` - Template metadata (5548 lines)
- `website/src/data/tags.tsx` - Tag definitions for filtering
- `website/src/components/gallery/` - Gallery components
- `website/static/templates/images/` - Template preview images

## Contributing Workflow

When making changes:
1. Always run the full validation sequence after changes
2. Test that templates.json changes don't break the test: `npm test`
3. Verify gallery displays correctly through manual browser testing
4. Check that all navigation and filtering works

## Common Development Tasks

**Adding a new template to the gallery:**
1. Add entry to `website/static/templates.json` with required fields
2. Ensure all tags exist in `website/src/data/tags.tsx` (add if needed)
3. Run `npm test` to validate template tags
4. Test gallery display with `npm run start`

**Modifying site content:**
1. Edit files in `website/docs/` for documentation 
2. Edit files in `website/src/pages/` for main pages
3. Test changes with development server
4. Verify navigation and links work correctly

## CI/CD Pipeline

The repository uses GitHub Actions:
- `test-deploy.yml` - Runs on PRs (build + test)
- `release.yml` - Manual deployment to GitHub Pages
- Both workflows require Node 20 and run same build sequence

## Known Limitations

- No ESLint or Prettier configuration found
- Build warnings about deprecated packages are normal and expected
- External analytics scripts may fail to load in development (this is expected)
- Some external Microsoft resources may be blocked in sandbox environments

## Common File Locations

- Template data: `website/static/templates.json`
- Tag definitions: `website/src/data/tags.tsx`
- Gallery components: `website/src/components/gallery/`
- Documentation: `website/docs/`
- Main pages: `website/src/pages/`
- Site configuration: `website/docusaurus.config.js`

The build succeeds reliably and the website functions correctly when all steps are followed precisely.
# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the awesome-azd repository.

## Workflows

### test-deploy.yml
Runs on every pull request to the `main` branch. This workflow:
- Builds the Docusaurus website
- Runs all tests to validate templates

### release.yml
Manually triggered workflow to deploy the website to GitHub Pages. This workflow:
- Builds the Docusaurus website
- Runs all tests
- Deploys to GitHub Pages

### pr-template-validator.yml
Automatically runs when a pull request modifies `website/static/templates.json`. This workflow:
- Validates new template entries for:
  - Required fields (title, description, preview, author, authorUrl, source, tags, id)
  - Valid UUID format for ID
  - Required tags (IaC provider: bicep/terraform, author type: msft/community)
  - Presence of "new" tag for new templates
  - Tag validity (all tags must be defined in `website/src/data/tags.tsx`)
- Posts a detailed validation report as a PR comment
- Runs existing template tests
- Assigns @v-xuto for manual testing if validation passes

### stale-pr.yml
Runs daily to manage inactive pull requests. This workflow:
- Identifies PRs that have been inactive for 90 days
- Posts a reminder comment asking the author to respond
- Automatically closes PRs that remain inactive for 7 days after the reminder
- Exempts PRs with labels: `work-in-progress`, `blocked`, `needs-review`
- Removes the stale label when a PR is updated

## Scripts

### .github/scripts/validate-templates.js
Node.js script that performs template validation for PRs. It:
- Compares the PR's templates.json with the base branch
- Identifies new template entries
- Validates template structure and required fields
- Checks tag validity against tags.tsx
- Generates a detailed validation report
- Posts/updates a comment on the PR with results

The script requires these environment variables:
- `GITHUB_TOKEN`: GitHub API token for posting comments
- `PR_NUMBER`: The pull request number
- `BASE_REF`: The base branch name (usually `main`)
- `HEAD_REF`: The PR branch name

## Dependencies

The validation script uses:
- `@octokit/rest`: GitHub API client for posting comments
- Node.js built-in modules: `fs`, `path`, `child_process`

Dependencies are defined in `.github/scripts/package.json` and are installed during the workflow run.

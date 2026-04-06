# Template Submission Automation

## Problem

Trusted internal partners cannot publish templates to awesome-azd fast enough. The current process requires:

1. Manually editing a 5500-line `templates.json` file
2. Manually generating a UUID
3. Manually uploading a preview image
4. Manually determining correct tags from `tags.tsx`
5. Opening a PR with a manual checklist
6. Waiting for human review
7. Waiting for manual `workflow_dispatch` deploy

Meanwhile, the **extension submission pipeline** already solves this: file an issue, automation validates and creates a PR, maintainer merges. Templates have no equivalent automation.

Partners can `npm publish` faster than they can get a template into the gallery. That gap must close.

## Proposed Solution

Mirror the extension submission model for templates. Create an automated pipeline:

**Issue Form** -> **Validation** -> **Auto-PR** -> **Maintainer Review & Merge**

### Components

#### 1. GitHub Issue Template (`template-submission.yml`)

Structured form collecting:
- **Source Repository URL** (required) - GitHub repo with azure.yaml
- **Template Title** (required)
- **Description** (required)
- **Author** (required)
- **Author URL** (required)
- **Author Type** (Microsoft/Community dropdown)
- **Preview Image URL** (optional) - raw URL to architecture diagram; falls back to default
- **Tags** (optional) - comma-separated additional tags
- **IaC Provider** (required) - Bicep/Terraform/Both dropdown

#### 2. Validation Script (`validate-template.js`)

Node.js script that:
- Validates the source repo URL is a valid GitHub URL
- Fetches the repo to confirm it exists and is public
- Checks for `azure.yaml` in the repo root (via GitHub raw content)
- Validates the image URL if provided (or uses default)
- Generates a UUID for the template
- Returns structured JSON with the validated template entry

#### 3. GitHub Actions Workflow (`template-submission.yml`)

Triggered by:
- Issue labeled `template-submission`
- `workflow_dispatch` with manual inputs

Steps:
1. Parse issue body (or workflow_dispatch inputs)
2. Run `validate-template.js` against the source repo
3. On validation failure: comment on issue with errors
4. On success: update `templates.json` with new entry
5. Create a PR with the changes
6. Comment on issue with success message and PR link

### Security Model

- Everything is rollbackable (git revert)
- The workflow only has `contents: write`, `pull-requests: write`, `issues: write`
- URL validation prevents SSRF (only https GitHub URLs accepted)
- Branch protection rules still apply

### Future Work

The following features are described here for future consideration but are **not implemented in the current PR**:

#### Trusted Publishers Configuration (`.github/trusted-publishers.json`)

JSON file listing GitHub usernames authorized for fast-track publishing. When a trusted publisher submits, the PR would get an `auto-merge` label.

#### Auto-Merge Workflow (`template-auto-merge.yml`)

For PRs with `auto-merge` label from trusted publishers:
- Verify CI passes (build + test)
- Verify the PR author matches a trusted publisher
- Auto-approve and merge

## Out of Scope

- Automatic deployment to GitHub Pages (stays manual via `release.yml`)
- Template content validation (does `azd up` work) - that is separate testing
- Changes to the extension submission pipeline

## Success Criteria

- A trusted partner can submit a template via issue form and have a PR created within minutes
- The PR creation is fully automated - no manual JSON editing required
- Existing manual PR submission path continues to work unchanged

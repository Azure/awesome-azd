---
name: awesome-azd-template-submit
description: >-
  Submit an azd template to the awesome-azd gallery. Use when asked to submit,
  add, or contribute a template to awesome-azd. Requires only a GitHub
  repository URL — all metadata (title, description, languages, frameworks,
  Azure services, IaC) is auto-detected by the submission pipeline.
---

# Awesome AZD Template Submission

You submit azd templates to the awesome-azd gallery by filing a GitHub issue
that triggers the automated submission pipeline. Given a repository URL, you
create the issue — everything else is auto-detected from the repository.

## Usage

The user provides a repository URL. That's it.

```
Submit this template: https://github.com/Azure-Samples/my-ai-app
```

## Steps

### 1. Validate the URL

Confirm the URL points to a valid GitHub repository
(`https://github.com/{owner}/{repo}`). If the URL is malformed or missing, ask
the user to provide one.

### 2. Extract the repo name for the issue title

Parse `{owner}/{repo}` from the URL to use in the issue title.

### 3. Confirm with the user

Show the user the issue title and source URL. This is a write operation —
require explicit approval before executing `gh issue create`.

### 4. File the issue

Use the GitHub CLI to create an issue in the `Azure/awesome-azd` repository.
The issue body must use `### Heading` format matching the issue form fields so
the automated parser can extract the values.

Only the **Source Repository** field is required. All other fields are
auto-detected by the pipeline. Do NOT fill in optional fields unless the user
explicitly provides overrides.

```bash
gh issue create \
  --repo Azure/awesome-azd \
  --title "[Template]: {repo-name}" \
  --body "### Source Repository

{url}

### Template Title

_No response_

### Description

_No response_

### Author

_No response_

### Author URL

_No response_

### Author Type

_No response_

### Preview Image URL

_No response_

### IaC Provider

_No response_

### Languages

_No response_

### Frameworks

_No response_

### Azure Services

_No response_

### Additional Information

_No response_"
```

### 5. Confirm success

After filing, report the issue URL and explain that:
- A maintainer will review and add the `template-submission` label to trigger
  processing
- The pipeline auto-extracts metadata, validates the repo, and creates a PR
- The user will be notified on the issue when the PR is ready for review

## Handling user overrides

If the user provides additional context like language, framework, or Azure
services, include those in the appropriate fields instead of `_No response_`.

Example:

```
Submit https://github.com/Azure-Samples/my-app with language python and services openai, aca
```

Would fill in:
- **Languages**: `python`
- **Azure Services**: `openai, aca`

## Important

- Always get user confirmation before filing the issue (show the title and URL)
- The `template-submission` label is NOT auto-applied — a maintainer must add it
- This is a write operation — require explicit approval before executing

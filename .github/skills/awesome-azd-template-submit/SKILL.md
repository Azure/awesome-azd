---
name: awesome-azd-template-submit
description: >-
  Submit or retire an azd template in the awesome-azd gallery. Use when asked to
  submit, add, contribute, remove, retire, or clean up a template in
  awesome-azd.
---

# Awesome AZD Template Submission

Templates can be submitted directly by pull request, or by opening a template
submission issue and assigning it to Copilot to prepare a PR. The issue label
does not trigger an automated processing workflow. For manual PR requirements,
see `website/docs/contribute.md`.

## Usage

The submission issue should include:
- The public GitHub repository URL for the template
- Its primary use case:
  - `Build a web app`
  - `Build an API`
  - `Build an AI agent`
  - `Build an MCP server`
  - `Chat with documents`
  - `Query a database`
  - `Automate a workflow`
  - `Start with infrastructure`
- Any metadata overrides or additional context the submitter provides

Submitters can use the
[template submission issue form](https://github.com/Azure/awesome-azd/issues/new?template=template-submission.yml).
After creating the issue, they should assign it to Copilot and request a PR.
If asked to file an issue on the user's behalf, show the issue title, source
URL, and primary use case and get explicit approval before creating it. Do not
claim that labeling an issue will start automation or create a PR.

## Handling an assigned submission issue

1. Read the issue and confirm the source repository and primary use case are
   provided. Ask for missing information before proceeding. If the submitter
   has not assigned the issue to Copilot, ask them to do so or confirm they want
   you to continue.
2. Verify the source is a public GitHub repository and inspect its README,
   `azure.yaml`, and infrastructure files for accurate listing details.
3. Follow `website/docs/contribute.md` to prepare a PR updating
   `website/static/templates.json` and
   `website/src/catalog/template-use-cases.json`.
4. Preserve any user-provided metadata overrides. Use the source owner for
   author attribution unless the submitter specifies otherwise.
5. Link the PR to the issue and summarize the metadata added. Do not claim the
   template was deployed or tested unless there is evidence.

## Trusted authors and testing

Trusted authors do not need manual template testing requested from @HarveyLink
or deployment proof requested from the PR author. Determine trust from the
GitHub issue creator, not from a field in the submission form.

Current trusted authors:
- paulyuk

Before requesting testing, check whether the template submission issue was
created by a trusted author. Do not request manual template testing or
deployment proof for trusted authors.

For community templates (those without the `msft` tag), comment on the PR and
mention @HarveyLink to request manual testing. For Microsoft templates (those
with the `msft` tag), ask the PR author for a test pipeline link or other proof
of successful deployment.

When mentioning people in issue or PR comments, write mentions as plain text
such as @HarveyLink. Do not wrap mentions in inline code formatting, because
that prevents GitHub notifications.

## Handling user overrides

If the user provides additional context like language, framework, Azure
services, author attribution, or images, include those values in the issue or
PR instead of replacing them with inferred values. When author details are not
provided, use the repository owner and their GitHub profile for attribution.

## Handling template removals

When removing or retiring a template from the gallery, delete both the template
metadata entry in `website/static/templates.json` and any related gallery
assets that are no longer referenced, such as the template's preview image
under `website/static/templates/images/`. Before deleting an asset, search the
repository to confirm no remaining template or documentation still references
it.

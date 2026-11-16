---
name: awesome-azd-template-submit
description: >-
  Submit or retire an azd template in the awesome-azd gallery. Use when asked to
  submit, add, contribute, remove, retire, or clean up a template in
  awesome-azd.
---

# Awesome AZD Template Submission

New templates are submitted by pull request. Follow the manual contribution
instructions in `website/docs/contribute.md`. Do not create a submission issue
expecting automation to validate the template or open a pull request.

When asked to submit a template, direct the user to the manual pull request
instructions. Do not create or modify repository content without the user's
explicit approval.

## Handling template removals

When removing or retiring a template from the gallery, delete both the template
metadata entry in `website/static/templates.json` and any related gallery assets
that are no longer referenced, such as the template's preview image under
`website/static/templates/images/`. Before deleting an asset, search the
repository to confirm no remaining template or documentation still references
it.

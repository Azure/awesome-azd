#!/usr/bin/env node

/**
 * Creates pull requests for each discovered azd extension.
 * Reads discovered-extensions.json (output of discover-extensions.js),
 * then creates a branch + PR per extension via the GitHub API.
 *
 * Called from actions/github-script; receives { github, context }.
 *
 * Usage (in workflow):
 *   script: |
 *     const script = require('./.github/scripts/create-extension-prs.js');
 *     await script({ github, context });
 */

const fs = require("fs");
const path = require("path");
const { sanitizeBranchName, escapeMarkdown, applyCap } = require("./github-utils");

module.exports = async ({ github, context }) => {
  const discoveredPath = path.join(
    process.cwd(),
    "discovered-extensions.json",
  );
  if (!fs.existsSync(discoveredPath)) {
    console.log("No discovered extensions file found");
    return;
  }

  let discovered;
  try {
    discovered = JSON.parse(fs.readFileSync(discoveredPath, "utf-8"));
  } catch (err) {
    console.error(`Failed to parse discovered-extensions.json: ${err.message}`);
    return;
  }

  if (!Array.isArray(discovered) || discovered.length === 0) {
    console.log("No new extensions discovered");
    return;
  }

  const candidates = applyCap(discovered, "discovered extensions");

  const extensionsPath = path.join(
    process.cwd(),
    "website",
    "static",
    "extensions.json",
  );

  let baseExtensions;
  try {
    baseExtensions = JSON.parse(fs.readFileSync(extensionsPath, "utf-8"));
  } catch (err) {
    console.error(`Failed to parse extensions.json: ${err.message}`);
    return;
  }

  for (const item of candidates) {
    const { repoFullName, repoUrl, extensionId, entry } = item;
    const repoParts = (repoFullName || "").split("/");
    const repoOwner = repoParts[0] || "";
    const repoName = repoParts[1] || extensionId;
    const safeName = sanitizeBranchName(extensionId);
    const branchName = `discover/extension-${safeName}`.substring(0, 60);

    try {
      // Get the default branch SHA
      const { data: ref } = await github.rest.git.getRef({
        owner: context.repo.owner,
        repo: context.repo.repo,
        ref: "heads/main",
      });

      // Create branch
      try {
        await github.rest.git.createRef({
          owner: context.repo.owner,
          repo: context.repo.repo,
          ref: `refs/heads/${branchName}`,
          sha: ref.object.sha,
        });
      } catch (err) {
        if (err.status === 422) {
          console.log(`Branch ${branchName} already exists, skipping`);
          continue;
        }
        throw err;
      }

      // Add the new extension entry
      const updatedExtensions = [...baseExtensions, entry];

      // Get the current file to find its SHA
      const { data: fileData } = await github.rest.repos.getContent({
        owner: context.repo.owner,
        repo: context.repo.repo,
        path: "website/static/extensions.json",
        ref: branchName,
      });

      // Update the file on the branch
      await github.rest.repos.createOrUpdateFileContents({
        owner: context.repo.owner,
        repo: context.repo.repo,
        path: "website/static/extensions.json",
        message: `feat: add discovered extension - ${extensionId}`,
        content: Buffer.from(
          JSON.stringify(updatedExtensions, null, 2) + "\n",
        ).toString("base64"),
        sha: fileData.sha,
        branch: branchName,
      });

      const capabilities = entry.capabilities || [];
      const platforms = entry.platforms || [];

      // Escape external content to prevent markdown table breakage
      // and formatting injection from untrusted repo data
      const safeDisplayName = escapeMarkdown(entry.displayName);
      const safeDescription = escapeMarkdown(entry.description);
      const safeAuthor = escapeMarkdown(entry.author);
      const safeExtensionId = escapeMarkdown(extensionId);
      const safeVersion = escapeMarkdown(entry.latestVersion);
      const safeCapabilities = capabilities.map((c) => escapeMarkdown(c)).join(", ");
      const safePlatforms = platforms.map((p) => escapeMarkdown(p)).join(", ");
      const safeInstallCommand = escapeMarkdown(entry.installCommand);
      const safeRegistryUrl = escapeMarkdown(entry.registryUrl);

      // Create PR first with a temporary body to obtain the PR number
      const pr = await github.rest.pulls.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        title: `feat: add discovered extension - ${extensionId}`,
        head: branchName,
        base: "main",
        body: "Auto-discovered extension PR — body will be updated momentarily.",
        labels: ["extension-discovery", "automated"],
      });

      // Build owner consent request issue URL with the real PR number
      const consentIssueTitle = `Your extension has been nominated for the Azure Developer CLI gallery`;
      const consentIssueBody = `Hi @${escapeMarkdown(repoOwner)},

Your repository [${escapeMarkdown(repoFullName)}](${repoUrl}) has been automatically discovered as an Azure Developer CLI (azd) extension and nominated for inclusion in the **[awesome-azd gallery](https://azure.github.io/awesome-azd/)**.

### What is awesome-azd?

The [awesome-azd gallery](https://azure.github.io/awesome-azd/) is a curated collection of Azure Developer CLI templates and extensions that helps developers quickly get started with Azure. Being featured in the gallery increases visibility and adoption of your extension.

### What we need from you

A pull request has been opened on the awesome-azd repository to add your extension:
**PR: https://github.com/${context.repo.owner}/${context.repo.repo}/pull/${pr.data.number}**

We would appreciate it if you could:
1. Review the PR to ensure the extension details (name, description, capabilities) are accurate
2. Comment on the PR with your approval or any objections
3. Let us know if you have any questions or concerns

Your consent is optional but appreciated — it helps us ensure extension owners are happy with how their work is represented.

Thank you for contributing to the Azure Developer CLI ecosystem! 🚀`;

      const consentUrl = `https://github.com/${repoOwner}/${repoName}/issues/new?title=${encodeURIComponent(consentIssueTitle)}&body=${encodeURIComponent(consentIssueBody)}`;

      // Update PR body with the real consent URL
      await github.rest.pulls.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: pr.data.number,
        body: `## 🔍 Auto-Discovered Extension

This PR was automatically generated by the extension discovery workflow.

**Source repo owner:** @${repoOwner}

### Extension Details

| Field | Value |
|-------|-------|
| **Repository** | [${repoFullName}](${repoUrl}) |
| **Extension ID** | \`${safeExtensionId}\` |
| **Display Name** | ${safeDisplayName} |
| **Description** | ${safeDescription} |
| **Author** | ${safeAuthor} |
| **Version** | ${safeVersion} |
| **Capabilities** | ${safeCapabilities} |
| **Platforms** | ${safePlatforms} |
| **Install** | \`${safeInstallCommand}\` |

### Registry URL
\`${safeRegistryUrl}\`

### How This Was Discovered

\`\`\`mermaid
flowchart TD
    A[⏰ Daily Cron] --> B[Search GitHub API]
    B --> |"filename:registry.json"| C[Raw Results]
    C --> D{Filter}
    D --> |Fork/Archived/Duplicate?| X1[❌ Skip]
    D --> |In ignore list?| X2[❌ Skip]
    D --> |Pass filters| E[Fetch registry.json]
    E --> F[🔍 validate-extension.js]
    F --> G{Valid?}
    G --> |No| X3[❌ Skip]
    G --> |Yes| H[Extract Metadata]
    H --> I[📋 This PR]
    I --> J{👤 Team Review}
    J --> |✅ Merge| K[Added to Gallery]
    J --> |❌ Close| L[Add to ignore list]

    style I fill:#0078d4,stroke:#005a9e,color:#fff
\`\`\`

### 👤 Review Checklist

- [ ] Extension ID and display name are appropriate
- [ ] Registry.json is valid and accessible
- [ ] Extension is production-ready (not a test or demo)
- [ ] Capabilities are correctly detected
- [ ] Author information is accurate
- [ ] Owner consent received (optional — use when requesting owner approval)

### 🤝 Reviewer Actions

Choose one of the following:

1. **✅ Approve directly** — You are confident this extension belongs in the gallery. Merge the PR. No owner consent needed.

2. **📬 Request owner consent** — Ask the source repo owner if they want their extension featured. [Create consent request on source repo](${consentUrl}). After creating the issue, update the PR link in the issue body to point to this PR, then wait for the owner to respond here.

3. **❌ Reject** — Close this PR and add the repo to the ignore list (see instructions below).

### ⚠️ If Closing This PR

Please add the repo to \`.github/discovery-ignore.json\` with a justification:
\`\`\`json
{
  "source": "${repoUrl}",
  "reason": "<your reason here>",
  "addedBy": "<your-github-username>",
  "addedDate": "${new Date().toISOString().split("T")[0]}"
}
\`\`\`
`,
      });

      console.log(`✓ Created PR for ${extensionId}`);
    } catch (err) {
      console.error(
        `✗ Failed to create PR for ${extensionId}: ${err.message}`,
      );
    }
  }
};

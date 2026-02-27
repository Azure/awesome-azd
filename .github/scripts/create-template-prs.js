#!/usr/bin/env node

/**
 * Creates pull requests for each discovered azd template.
 * Reads discovered-templates.json (output of discover-templates.js),
 * then creates a branch + PR per template via the GitHub API.
 *
 * Called from actions/github-script; receives { github, context }.
 *
 * Usage (in workflow):
 *   script: |
 *     const script = require('./.github/scripts/create-template-prs.js');
 *     await script({ github, context });
 */

const fs = require("fs");
const path = require("path");
const { sanitizeBranchName, escapeMarkdown, applyCap } = require("./github-utils");

module.exports = async ({ github, context }) => {
  const discoveredPath = path.join(process.cwd(), "discovered-templates.json");
  if (!fs.existsSync(discoveredPath)) {
    console.log("No discovered templates file found");
    return;
  }

  let discovered;
  try {
    discovered = JSON.parse(fs.readFileSync(discoveredPath, "utf-8"));
  } catch (err) {
    console.error(`Failed to parse discovered-templates.json: ${err.message}`);
    return;
  }

  if (!Array.isArray(discovered) || discovered.length === 0) {
    console.log("No new templates discovered");
    return;
  }

  const candidates = applyCap(discovered, "discovered templates");

  const templatesPath = path.join(
    process.cwd(),
    "website",
    "static",
    "templates.json",
  );

  let baseTemplates;
  try {
    baseTemplates = JSON.parse(fs.readFileSync(templatesPath, "utf-8"));
  } catch (err) {
    console.error(`Failed to parse templates.json: ${err.message}`);
    return;
  }

  for (const item of candidates) {
    const { repoFullName, repoUrl, quality, reasoning, entry } = item;
    const parts = (repoFullName || "").split("/");
    if (parts.length < 2) {
      console.error(`Invalid repoFullName: ${repoFullName}`);
      continue;
    }
    const [owner, repo] = parts;
    const safeName = sanitizeBranchName(`${owner}-${repo}`);
    const branchName = `discover/template-${safeName}`.substring(0, 60);

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

      // Add the new template entry
      const updatedTemplates = [...baseTemplates, entry];

      // Get the current file to find its SHA
      const { data: fileData } = await github.rest.repos.getContent({
        owner: context.repo.owner,
        repo: context.repo.repo,
        path: "website/static/templates.json",
        ref: branchName,
      });

      // Update the file on the branch
      await github.rest.repos.createOrUpdateFileContents({
        owner: context.repo.owner,
        repo: context.repo.repo,
        path: "website/static/templates.json",
        message: `feat: add discovered template - ${repo}`,
        content: Buffer.from(
          JSON.stringify(updatedTemplates, null, 2) + "\n",
        ).toString("base64"),
        sha: fileData.sha,
        branch: branchName,
      });

      const tags = entry.tags || [];
      const languages = entry.languages || [];
      const frameworks = entry.frameworks || [];
      const azureServices = entry.azureServices || [];
      const iac = entry.IaC || [];

      // Escape external content to prevent markdown table breakage
      // and formatting injection from untrusted repo data
      const safeTitle = escapeMarkdown(entry.title);
      const safeDescription = escapeMarkdown(entry.description);
      const safeAuthor = escapeMarkdown(entry.author);
      const safeReasoning = escapeMarkdown(reasoning);
      const safeTags = tags.map((t) => escapeMarkdown(t)).join(", ");
      const safeLangs = languages.map((l) => escapeMarkdown(l)).join(", ") || "None detected";
      const safeFrameworks = frameworks.map((f) => escapeMarkdown(f)).join(", ") || "None detected";
      const safeServices = azureServices.map((s) => escapeMarkdown(s)).join(", ") || "None detected";
      const safeIac = iac.map((i) => escapeMarkdown(i)).join(", ") || "None detected";

      // Create PR first with a temporary body to obtain the PR number
      const pr = await github.rest.pulls.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        title: `feat: add discovered template - ${repo}`,
        head: branchName,
        base: "main",
        body: "Auto-discovered template PR — body will be updated momentarily.",
        labels: ["template-discovery", "automated"],
      });

      // Build owner consent request issue URL with the real PR number
      const consentIssueTitle = `Your template has been nominated for the Azure Developer CLI gallery`;
      const consentIssueBody = `Hi @${escapeMarkdown(owner)},

Your repository [${escapeMarkdown(repoFullName)}](${repoUrl}) has been automatically discovered as a high-quality Azure Developer CLI (azd) template and nominated for inclusion in the **[awesome-azd gallery](https://azure.github.io/awesome-azd/)**.

### What is awesome-azd?

The [awesome-azd gallery](https://azure.github.io/awesome-azd/) is a curated collection of Azure Developer CLI templates that helps developers quickly get started with Azure. Being featured in the gallery increases visibility and adoption of your template.

### What we need from you

A pull request has been opened on the awesome-azd repository to add your template:
**PR: https://github.com/${context.repo.owner}/${context.repo.repo}/pull/${pr.data.number}**

We would appreciate it if you could:
1. Review the PR to ensure the template details (title, description, tags) are accurate
2. Comment on the PR with your approval or any objections
3. Let us know if you have any questions or concerns

Your consent is optional but appreciated — it helps us ensure template owners are happy with how their work is represented.

Thank you for contributing to the Azure Developer CLI ecosystem! 🚀`;

      const consentUrl = `https://github.com/${owner}/${repo}/issues/new?title=${encodeURIComponent(consentIssueTitle)}&body=${encodeURIComponent(consentIssueBody)}`;

      // Update PR body with the real consent URL
      await github.rest.pulls.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: pr.data.number,
        body: `## 🔍 Auto-Discovered Template

This PR was automatically generated by the template discovery workflow.

**Source repo owner:** @${owner}

### Template Details

| Field | Value |
|-------|-------|
| **Repository** | [${repoFullName}](${repoUrl}) |
| **Title** | ${safeTitle} |
| **Description** | ${safeDescription} |
| **Author** | ${safeAuthor} |
| **Quality Score** | ${quality}/10 |
| **Tags** | ${safeTags} |
| **Languages** | ${safeLangs} |
| **Frameworks** | ${safeFrameworks} |
| **Azure Services** | ${safeServices} |
| **IaC** | ${safeIac} |

### AI Quality Assessment
> ${safeReasoning}

### How This Was Discovered

\`\`\`mermaid
flowchart TD
    A[⏰ Daily Cron] --> B[Search GitHub API]
    B --> |"filename:azure.yaml path:/"| C[Raw Results]
    C --> D{Filter}
    D --> |Fork/Archived/Duplicate?| X1[❌ Skip]
    D --> |In ignore list?| X2[❌ Skip]
    D --> |Pass filters| E[Fetch Repo Data]
    E --> F[🤖 AI Quality Assessment]
    F --> G{Quality ≥ 6?}
    G --> |No| X3[❌ Skip]
    G --> |Yes| H[Generate Metadata]
    H --> I[📋 This PR]
    I --> J{👤 Team Review}
    J --> |✅ Merge| K[Added to Gallery]
    J --> |❌ Close| L[Add to ignore list]

    style I fill:#0078d4,stroke:#005a9e,color:#fff
\`\`\`

### 👤 Review Checklist

- [ ] Template title and description are accurate
- [ ] Tags are correctly categorized (languages, frameworks, azureServices, IaC)
- [ ] No duplicate tags across arrays
- [ ] Repository is a legitimate, maintained azd template
- [ ] Preview image should be updated (currently using default test.png)
- [ ] Owner consent received (optional — use when requesting owner approval)

### 🤝 Reviewer Actions

Choose one of the following:

1. **✅ Approve directly** — You are confident this template belongs in the gallery. Merge the PR. No owner consent needed.

2. **📬 Request owner consent** — Ask the source repo owner if they want their template featured. [Create consent request on source repo](${consentUrl}). After creating the issue, update the PR link in the issue body to point to this PR, then wait for the owner to respond here.

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

      console.log(`✓ Created PR for ${repoFullName}`);
    } catch (err) {
      console.error(
        `✗ Failed to create PR for ${repoFullName}: ${err.message}`,
      );
    }
  }
};

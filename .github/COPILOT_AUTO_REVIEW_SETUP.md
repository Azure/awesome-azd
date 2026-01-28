# GitHub Copilot Auto-Review Configuration Guide

## Issue
GitHub Copilot is not being automatically assigned to review pull requests when they are opened.

## Root Cause Analysis

After investigating the repository configuration:

1. **GitOps Policy** (`.github/policies/resourceManagement.yml`): This file contains issue/PR management automation but does NOT control Copilot code review functionality.

2. **Copilot Assignment Behavior**:
   - GitHub Copilot can be assigned to **Issues** (to work on them and create PRs)
   - GitHub Copilot **code review** on PRs is NOT configured through GitOps policies
   - There is no GitHub user account named "copilot" that can be assigned to PRs
   - Attempting to add `assignTo: users: [copilot]` in GitOps policy will fail because:
     * The username "copilot" does not exist as a GitHub user
     * GitOps policy cannot trigger Copilot code review functionality

3. **Correct Configuration Method**: Automatic Copilot code review must be configured through **GitHub Repository Rulesets**, not through the GitOps policy file.

## ❌ What Does NOT Work

**Do NOT modify `.github/policies/resourceManagement.yml` to add:**
```yaml
- if:
  - payloadType: Pull_Request
  - isAction:
      action: Opened
  then:
  - assignTo:
      users:
      - copilot
```

**Why this doesn't work:**
- There is no GitHub user named "copilot"
- GitOps policies manage issue/PR automation, not Copilot code review
- This approach was tested and does not enable Copilot code review

## Solution: Enable Automatic Copilot Code Review

To enable automatic Copilot code review for this repository, a repository administrator needs to:

### Steps to Configure (Repository Level)

1. Navigate to the repository on GitHub: `https://github.com/Azure/awesome-azd`

2. Click **Settings** tab (requires admin/write access)

3. In the left sidebar, under "Code and automation," click **Rules** → **Rulesets**

4. Click **New ruleset** → **New branch ruleset**

5. Configure the ruleset:
   - **Ruleset name**: `Automatic Copilot Code Review`
   - **Enforcement Status**: Select **Active**
   - **Target branches**: Click **Add target** → Choose **Include all branches** (or specify branches like `main`)

6. Under **Branch rules**, select **Automatically request Copilot code review**

7. Configure additional options:
   - ☑ **Review new pushes** (Copilot reviews each new push to the PR)
   - ☑ **Review draft pull requests** (catches errors early)

8. Click **Create** at the bottom of the page

### Alternative: Organization-Level Configuration

If you want to enable this for multiple repositories in the Azure organization:

1. Go to Organization Settings
2. Navigate to **Repository** → **Rulesets**
3. Follow similar steps as above, but add target repositories using patterns
4. Example pattern: `awesome-azd` or `*` for all repos

## What This Enables

Once configured, GitHub Copilot will automatically:
- Review all new pull requests when they are opened
- Review new pushes to existing PRs (if "Review new pushes" is enabled)
- Review draft PRs (if "Review draft pull requests" is enabled)
- Provide inline comments and suggestions
- Create a review summary with findings

## Important Notes

1. **This is NOT configured through `.github/policies/resourceManagement.yml`**
   - The GitOps policy file is for issue/PR management automation (labels, assignments, closures)
   - It does NOT control Copilot code review functionality

2. **Requires GitHub Copilot Enterprise or Business license**
   - Automatic code review is only available with these plans
   - Check organization's Copilot license status

3. **Human review is still required**
   - Copilot code review is supplementary to human review
   - It does not replace your code review process
   - Branch protection rules and CODEOWNERS still apply

## Verification

After configuration, test by:
1. Creating a test PR
2. Verifying that Copilot automatically adds a review
3. Checking that the review appears in the PR's "Reviews" section

## References

- [GitHub Docs: Configuring automatic code review by GitHub Copilot](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/configure-automatic-review)
- [GitHub Docs: About GitHub Copilot code review](https://docs.github.com/en/copilot/concepts/code-review)
- [GitHub Blog: Copilot coding agent workflows](https://github.blog/ai-and-ml/github-copilot/github-copilot-coding-agent-101-getting-started-with-agentic-workflows-on-github/)

## Next Steps

**Action Required**: A repository administrator with appropriate permissions needs to follow the steps above to enable automatic Copilot code review through GitHub's Repository Settings → Rulesets interface.

This cannot be automated through a code change or PR - it requires manual configuration in the GitHub web interface.

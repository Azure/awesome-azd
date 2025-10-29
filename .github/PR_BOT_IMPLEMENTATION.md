# PR Bot Implementation Summary

This document describes the PR bot functionality added to the awesome-azd repository.

## Overview

Two automated GitHub Actions workflows have been implemented to improve PR management and template quality:

1. **PR Template Validator** - Validates template submissions automatically
2. **Stale PR Manager** - Manages inactive PRs to keep the repository clean

## 1. PR Template Validator

### Purpose
Automatically validates template entries when PRs modify `website/static/templates.json`, ensuring all submissions meet quality standards before manual review.

### Workflow File
`.github/workflows/pr-template-validator.yml`

### Triggers
- Pull request opened
- Pull request synchronized (new commits pushed)
- Pull request reopened

### Validation Checks

#### Required Fields
Every new template must include:
- `title` - Template name
- `description` - Template description
- `preview` - Path to preview image
- `authorUrl` - Author's URL
- `author` - Author name
- `source` - Template source repository URL
- `tags` - Array of tags
- `id` - Unique UUID

#### ID Format
- Must be a valid UUID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

#### Required Tags
Every template must include:
- **IaC Provider**: Either `"bicep"` or `"terraform"`
- **Author Type**: Either `"msft"` (Microsoft) or `"community"`

#### New Tag Recommendation
- New templates should include the `"new"` tag (warning if missing)

#### Tag Validity
- All tags (in `tags`, `languages`, and `azureServices` arrays) must be defined in `website/src/data/tags.tsx`

### Validation Script
`.github/scripts/validate-templates.js`

The script:
1. Compares the PR's `templates.json` with the base branch
2. Identifies new template entries by ID
3. Validates each new template's structure
4. Checks tag validity against `tags.tsx`
5. Generates a detailed validation report
6. Posts/updates a comment on the PR with results

### Validation Report Format

**Success Example:**
```markdown
## 🤖 Template Validation Report

Found **1** new template(s):
- My Awesome Template

### ✅ Validation Passed

All templates have valid structure and tags.

### 📋 Next Steps

- Manual testing will be assigned to @v-xuto
- Please ensure your template works with `azd up`
- Verify all Azure services are correctly tagged
```

**Failure Example:**
```markdown
## 🤖 Template Validation Report

Found **1** new template(s):
- My Awesome Template

### ❌ Validation Failed

Found 3 error(s):

- Template at index 42: Missing required field "preview"
- Template at index 42: Must include either "bicep" or "terraform" tag
- Template at index 42: Tag "nonexistent-tag" is not defined in tags.tsx

### 📖 Resources

- [Template Requirements](https://github.com/Azure/awesome-azd/blob/main/.github/PULL_REQUEST_TEMPLATE.md)
- [Available Tags](https://github.com/Azure/awesome-azd/blob/main/website/src/data/tags.tsx)
- [Example Template](https://github.com/Azure/awesome-azd/blob/main/website/static/templates.json)
```

### Manual Testing Assignment
If validation passes, the workflow automatically:
- Assigns @v-xuto for manual testing
- Posts a comment if assignment fails (permission issue)

### Test Execution
The workflow runs the existing test suite (`npm test`) to ensure:
- All tags in templates.json are defined in tags.tsx
- No regressions in existing functionality

## 2. Stale PR Manager

### Purpose
Automatically manages inactive PRs to keep the repository clean and encourage contributors to complete their work.

### Workflow File
`.github/workflows/stale-pr.yml`

### Schedule
- Runs daily at 00:00 UTC
- Can be manually triggered via workflow_dispatch

### Behavior

#### Stale Detection (90 days)
When a PR has been inactive for 90 days:
- Posts a friendly reminder comment
- Adds `stale` label
- Asks author to respond or update the PR

#### Auto-Close (7 days after stale)
If no response after 7 days:
- Automatically closes the PR
- Adds `auto-closed` label
- Posts a closing comment

#### Exemptions
PRs are excluded from stale detection if they have any of these labels:
- `work-in-progress`
- `blocked`
- `needs-review`

#### Stale Label Removal
The `stale` label is automatically removed when:
- The PR is updated with new commits
- New comments are added
- PR is otherwise modified

### Message Templates

**Stale Reminder (90 days):**
```markdown
👋 Hi there! This pull request has been inactive for 90 days.

We'd love to keep this contribution moving forward! Could you please:
- Respond to any outstanding review comments
- Rebase on the latest main branch if needed
- Let us know if you need any help or have questions

If we don't hear back within 7 days, this PR will be automatically closed. 
You can always reopen it later when you're ready to continue.

Thank you for your contribution! 🙏
```

**Auto-Close (7 days after stale):**
```markdown
This pull request has been automatically closed due to inactivity.

Thank you for your interest in contributing to awesome-azd! If you'd like to 
continue working on this, please feel free to reopen the PR or create a new one.

We're always happy to review contributions when you're ready. 😊
```

## Dependencies

### Workflow Actions
- `actions/checkout@v4` - Checkout repository code
- `actions/setup-node@v4` - Setup Node.js environment
- `actions/github-script@v7` - Run GitHub API operations
- `actions/stale@v9` - Stale PR management

### Node.js Dependencies
Defined in `.github/scripts/package.json`:
- `@octokit/rest` - GitHub REST API client for posting comments

## Configuration

### Script Dependencies Installation
The PR template validator workflow automatically installs dependencies:
```bash
cd .github/scripts
npm install
```

Dependencies are gitignored to avoid committing node_modules.

### Environment Variables
The validation script uses these environment variables (set by the workflow):
- `GITHUB_TOKEN` - GitHub API authentication
- `PR_NUMBER` - Pull request number
- `BASE_REF` - Base branch name (usually `main`)
- `HEAD_REF` - PR branch name

## Testing

### Unit Tests
The existing test suite validates:
- Tag definitions match between templates.json and tags.tsx
- Author filtering logic works correctly

Run tests:
```bash
cd website
npm test
```

### Manual Testing
To test the validation script locally:
```bash
cd /path/to/awesome-azd
BASE_REF=main HEAD_REF=HEAD node .github/scripts/validate-templates.js
```

## Maintenance

### Adding New Tags
When adding new tags to `tags.tsx`:
1. Add to the `TagType` union
2. Add to the `Tags` object with label and description
3. The validation will automatically recognize new tags

### Modifying Validation Rules
Edit `.github/scripts/validate-templates.js` to:
- Change required fields
- Add new validation checks
- Modify error messages
- Adjust validation logic

### Adjusting Stale Timeframes
Edit `.github/workflows/stale-pr.yml` to change:
- `days-before-stale` - Days until marked stale (default: 90)
- `days-before-close` - Days after stale to close (default: 7)
- `exempt-pr-labels` - Labels that prevent stale marking

## Troubleshooting

### Validation Script Fails
1. Check that templates.json is valid JSON
2. Verify tags.tsx contains all referenced tags
3. Check Node.js version (requires 18+)
4. Review validation script logs in workflow run

### Assignment Fails
If @v-xuto can't be assigned:
- The workflow will post a comment instead
- Check user permissions
- Verify username is correct

### Stale Bot Not Running
1. Check workflow schedule
2. Verify workflow is enabled in repository settings
3. Check for workflow syntax errors
4. Review action logs

## Future Enhancements

Possible improvements:
- Add more validation rules (e.g., image file existence)
- Validate preview image dimensions
- Check for duplicate template IDs
- Validate source URL accessibility
- Add template schema validation using JSON Schema
- Implement automated template testing with `azd up`

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Stale Action Documentation](https://github.com/actions/stale)
- [Octokit REST API](https://octokit.github.io/rest.js/)
- [Template Submission Guide](https://github.com/Azure/awesome-azd/blob/main/.github/PULL_REQUEST_TEMPLATE.md)

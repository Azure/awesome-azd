const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read environment variables
const baseRef = process.env.BASE_REF || 'main';
const headRef = process.env.HEAD_REF || 'HEAD';
const prNumber = process.env.PR_NUMBER;
const githubToken = process.env.GITHUB_TOKEN;

// Paths
const templatesPath = path.join(__dirname, '../../website/static/templates.json');
const tagsPath = path.join(__dirname, '../../website/src/data/tags.tsx');

// Required fields for a template
const requiredFields = [
  'title',
  'description',
  'preview',
  'authorUrl',
  'author',
  'source',
  'tags',
  'id'
];

// Function to read valid tags from tags.tsx
function getValidTags() {
  const tagsContent = fs.readFileSync(tagsPath, 'utf8');
  
  // Extract TagType union from the file
  const tagTypeMatch = tagsContent.match(/export type TagType\s*=\s*([\s\S]*?);/);
  if (!tagTypeMatch) {
    throw new Error('Could not find TagType definition in tags.tsx');
  }
  
  const tagTypeContent = tagTypeMatch[1];
  // Extract all string literals from the union type
  const tags = [];
  const tagMatches = tagTypeContent.matchAll(/["']([^"']+)["']/g);
  for (const match of tagMatches) {
    tags.push(match[1]);
  }
  
  return tags;
}

// Function to get the base version of templates.json
function getBaseTemplates() {
  try {
    const baseContent = execSync(`git show origin/${baseRef}:website/static/templates.json`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return JSON.parse(baseContent);
  } catch (error) {
    console.log('Could not get base templates, assuming empty array');
    return [];
  }
}

// Function to validate template structure
function validateTemplate(template, index) {
  const errors = [];
  const warnings = [];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!template.hasOwnProperty(field)) {
      errors.push(`Template at index ${index}: Missing required field "${field}"`);
    } else if (template[field] === null || template[field] === undefined || template[field] === '') {
      errors.push(`Template at index ${index}: Field "${field}" is empty`);
    }
  }
  
  // Check tags array
  if (template.tags && Array.isArray(template.tags)) {
    if (template.tags.length === 0) {
      errors.push(`Template at index ${index}: Tags array is empty`);
    }
    
    // Check for required tags
    const hasIaCTag = template.tags.includes('bicep') || template.tags.includes('terraform');
    if (!hasIaCTag) {
      errors.push(`Template at index ${index}: Must include either "bicep" or "terraform" tag`);
    }
    
    const hasAuthorTag = template.tags.includes('msft') || template.tags.includes('community');
    if (!hasAuthorTag) {
      errors.push(`Template at index ${index}: Must include either "msft" or "community" tag`);
    }
  } else {
    errors.push(`Template at index ${index}: "tags" must be an array`);
  }
  
  // Check ID format (should be a valid UUID)
  if (template.id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(template.id)) {
      errors.push(`Template at index ${index}: ID "${template.id}" is not a valid UUID format`);
    }
  }
  
  return { errors, warnings };
}

// Function to check if tags are valid
function validateTags(template, validTags, index) {
  const errors = [];
  const allTemplateTags = [
    ...(template.tags || []),
    ...(template.languages || []),
    ...(template.azureServices || [])
  ];
  
  for (const tag of allTemplateTags) {
    if (!validTags.includes(tag)) {
      errors.push(`Template at index ${index}: Tag "${tag}" is not defined in tags.tsx`);
    }
  }
  
  return errors;
}

// Main validation function
async function validateTemplates() {
  console.log('Starting template validation...');
  
  // Read current templates
  const currentTemplates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
  const baseTemplates = getBaseTemplates();
  const validTags = getValidTags();
  
  console.log(`Found ${validTags.length} valid tags in tags.tsx`);
  console.log(`Current templates: ${currentTemplates.length}`);
  console.log(`Base templates: ${baseTemplates.length}`);
  
  // Find new templates (by comparing IDs)
  const baseIds = new Set(baseTemplates.map(t => t.id));
  const newTemplates = currentTemplates.filter(t => !baseIds.has(t.id));
  
  console.log(`Found ${newTemplates.length} new template(s)`);
  
  let allErrors = [];
  let allWarnings = [];
  let missingNewTag = [];
  
  // Validate each new template
  for (let i = 0; i < currentTemplates.length; i++) {
    const template = currentTemplates[i];
    
    // Only validate new templates
    if (!baseIds.has(template.id)) {
      console.log(`Validating new template: "${template.title}"`);
      
      // Check structure
      const { errors, warnings } = validateTemplate(template, i);
      allErrors.push(...errors);
      allWarnings.push(...warnings);
      
      // Check tag validity
      const tagErrors = validateTags(template, validTags, i);
      allErrors.push(...tagErrors);
      
      // Check for "new" tag
      if (!template.tags.includes('new')) {
        missingNewTag.push(template.title);
      }
    }
  }
  
  // Generate report
  let report = '## 🤖 Template Validation Report\n\n';
  
  if (newTemplates.length === 0) {
    report += '✅ No new templates detected in this PR.\n';
  } else {
    report += `Found **${newTemplates.length}** new template(s):\n`;
    for (const template of newTemplates) {
      report += `- ${template.title}\n`;
    }
    report += '\n';
    
    if (allErrors.length === 0) {
      report += '### ✅ Validation Passed\n\n';
      report += 'All templates have valid structure and tags.\n\n';
      
      if (missingNewTag.length > 0) {
        report += '### ⚠️ Recommendations\n\n';
        report += 'The following new template(s) should include the `"new"` tag:\n';
        for (const title of missingNewTag) {
          report += `- ${title}\n`;
        }
        report += '\n';
      }
      
      report += '### 📋 Next Steps\n\n';
      report += '- Manual testing will be assigned to @v-xuto\n';
      report += '- Please ensure your template works with `azd up`\n';
      report += '- Verify all Azure services are correctly tagged\n';
      
    } else {
      report += '### ❌ Validation Failed\n\n';
      report += `Found ${allErrors.length} error(s):\n\n`;
      for (const error of allErrors) {
        report += `- ${error}\n`;
      }
      report += '\n';
      
      if (missingNewTag.length > 0) {
        report += '### ⚠️ Missing "new" Tag\n\n';
        report += 'The following template(s) should include the `"new"` tag:\n';
        for (const title of missingNewTag) {
          report += `- ${title}\n`;
        }
        report += '\n';
      }
      
      report += '### 📖 Resources\n\n';
      report += '- [Template Requirements](https://github.com/Azure/awesome-azd/blob/main/.github/PULL_REQUEST_TEMPLATE.md)\n';
      report += '- [Available Tags](https://github.com/Azure/awesome-azd/blob/main/website/src/data/tags.tsx)\n';
      report += '- [Example Template](https://github.com/Azure/awesome-azd/blob/main/website/static/templates.json)\n';
    }
  }
  
  console.log('\n' + report);
  
  // Post comment to PR if token is available
  if (githubToken && prNumber) {
    await postComment(report);
  }
  
  // Exit with error if validation failed
  if (allErrors.length > 0) {
    console.error('\n❌ Template validation failed!');
    process.exit(1);
  } else {
    console.log('\n✅ Template validation passed!');
  }
}

// Function to post comment to GitHub PR
async function postComment(body) {
  try {
    const { Octokit } = require('@octokit/rest');
    const octokit = new Octokit({ auth: githubToken });
    
    // Get repo info from git remote
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
    
    if (!match) {
      console.error('Could not parse repository info from git remote');
      return;
    }
    
    const [, owner, repo] = match;
    
    // Check if bot has already commented
    const { data: comments } = await octokit.issues.listComments({
      owner,
      repo,
      issue_number: parseInt(prNumber)
    });
    
    const botComment = comments.find(c => 
      c.body && c.body.includes('🤖 Template Validation Report')
    );
    
    if (botComment) {
      // Update existing comment
      await octokit.issues.updateComment({
        owner,
        repo,
        comment_id: botComment.id,
        body
      });
      console.log('Updated existing validation comment');
    } else {
      // Create new comment
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: parseInt(prNumber),
        body
      });
      console.log('Posted new validation comment');
    }
  } catch (error) {
    console.error('Error posting comment:', error.message);
  }
}

// Run validation
validateTemplates().catch(error => {
  console.error('Validation error:', error);
  process.exit(1);
});

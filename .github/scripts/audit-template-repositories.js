#!/usr/bin/env node

const { execFile } = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");
const { promisify } = require("node:util");

const execFileAsync = promisify(execFile);

const DEFAULT_CATALOG = "website/static/templates.json";
const ISSUE_MARKER = "<!-- template-repository-health -->";
const ISSUE_TITLE = "Template repository health: archived or unavailable sources";
const MAX_CONCURRENCY = 10;

function parseGitHubSource(source) {
  if (typeof source !== "string" || source.trim() === "") {
    throw new Error("Template source must be a non-empty string");
  }

  let url;
  try {
    url = new URL(source);
  } catch {
    throw new Error(`Invalid template source URL: ${source}`);
  }

  if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com") {
    throw new Error(`Template source must be an https://github.com URL: ${source}`);
  }

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length < 2) {
    throw new Error(`Template source must include an owner and repository: ${source}`);
  }

  const owner = segments[0];
  const repository = segments[1].replace(/\.git$/i, "");
  if (!owner || !repository) {
    throw new Error(`Template source must include an owner and repository: ${source}`);
  }

  const rootPath = `/${segments[0]}/${segments[1]}`;
  const suffix = `${url.pathname.slice(rootPath.length)}${url.search}${url.hash}`;

  return {
    owner,
    repository,
    key: `${owner}/${repository}`.toLowerCase(),
    rootUrl: `https://github.com/${owner}/${repository}`,
    suffix,
  };
}

function normalizeUrl(url) {
  return url.toLowerCase().replace(/\.git$/, "").replace(/\/+$/, "");
}

function escapeMarkdown(value) {
  return String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\|/g, "\\|")
    .replace(/@/g, "@\u200b");
}

async function mapWithConcurrency(items, limit, callback) {
  const results = [];
  for (let index = 0; index < items.length; index += limit) {
    const batch = items.slice(index, index + limit);
    const batchResults = await Promise.all(
      batch.map((item, batchIndex) => callback(item, index + batchIndex)),
    );
    results.push(...batchResults);
  }
  return results;
}

async function runGh(args) {
  try {
    return await execFileAsync("gh", args, {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (error) {
    const stderr = error.stderr || error.message;
    const wrapped = new Error(`gh ${args.join(" ")} failed: ${stderr.trim()}`);
    wrapped.exitCode = error.code;
    wrapped.stderr = stderr;
    throw wrapped;
  }
}

async function fetchRepository(owner, repository) {
  try {
    const { stdout } = await runGh([
      "api",
      `repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`,
    ]);
    const data = JSON.parse(stdout);
    return {
      status: "available",
      nameWithOwner: data.full_name,
      url: data.html_url,
      archived: data.archived === true,
      disabled: data.disabled === true,
      visibility: data.visibility,
    };
  } catch (error) {
    if (/\b404\b/.test(error.stderr || "")) {
      return {
        status: "missing",
        nameWithOwner: `${owner}/${repository}`,
        url: `https://github.com/${owner}/${repository}`,
        archived: false,
        disabled: false,
        visibility: null,
      };
    }
    throw error;
  }
}

async function auditTemplates(templates, repositoryFetcher = fetchRepository) {
  if (!Array.isArray(templates)) {
    throw new Error("Template catalog must contain a JSON array");
  }

  const parsedEntries = templates.map((template, index) => {
    if (!template || typeof template !== "object") {
      throw new Error(`Template entry ${index + 1} must be an object`);
    }
    return {
      entry: index + 1,
      title: template.title || `Entry ${index + 1}`,
      source: template.source,
      parsed: parseGitHubSource(template.source),
    };
  });

  const repositories = new Map();
  for (const entry of parsedEntries) {
    if (!repositories.has(entry.parsed.key)) {
      repositories.set(entry.parsed.key, entry.parsed);
    }
  }

  const repositoryEntries = Array.from(repositories.values());
  const repositoryResults = await mapWithConcurrency(
    repositoryEntries,
    MAX_CONCURRENCY,
    (repository) =>
      repositoryFetcher(repository.owner, repository.repository),
  );
  const resultsByKey = new Map(
    repositoryEntries.map((repository, index) => [
      repository.key,
      repositoryResults[index],
    ]),
  );

  const findings = {
    archived: [],
    disabled: [],
    missing: [],
    redirected: [],
  };

  for (const entry of parsedEntries) {
    const result = resultsByKey.get(entry.parsed.key);
    if (!result) {
      throw new Error(`Repository audit returned no result for ${entry.parsed.key}`);
    }
    const finding = {
      entry: entry.entry,
      title: entry.title,
      source: entry.source,
      repository: result.nameWithOwner,
      repositoryUrl: result.url,
      canonicalSource: `${result.url}${entry.parsed.suffix}`,
    };

    if (result.status === "missing") {
      findings.missing.push(finding);
      continue;
    }
    if (result.archived) {
      findings.archived.push(finding);
    }
    if (result.disabled) {
      findings.disabled.push(finding);
    }
    if (
      !result.archived &&
      !result.disabled &&
      normalizeUrl(entry.parsed.rootUrl) !== normalizeUrl(result.url)
    ) {
      findings.redirected.push(finding);
    }
  }

  return {
    templateCount: templates.length,
    repositoryCount: repositories.size,
    findings,
  };
}

function hasUnhealthyFindings(audit) {
  return Object.values(audit.findings).some((entries) => entries.length > 0);
}

function renderFindingTable(findings, includeCanonical = false) {
  const headers = includeCanonical
    ? [
        "| Entry | Template | Configured source | Canonical source |",
        "| ---: | --- | --- | --- |",
      ]
    : [
        "| Entry | Template | Source |",
        "| ---: | --- | --- |",
      ];

  const rows = findings.map((finding) =>
    includeCanonical
      ? `| \`${finding.entry}\` | ${escapeMarkdown(finding.title)} | [configured](${finding.source}) | [canonical](${finding.canonicalSource}) |`
      : `| \`${finding.entry}\` | ${escapeMarkdown(finding.title)} | [${escapeMarkdown(finding.repository)}](${finding.repositoryUrl}) |`,
  );

  return [...headers, ...rows].join("\n");
}

function buildIssueBody(audit) {
  const sections = [
    ISSUE_MARKER,
    "## Automated template repository health report",
    "",
    `Checked ${audit.templateCount} template entries representing ${audit.repositoryCount} unique GitHub repositories.`,
    "",
    "| Finding | Count |",
    "| --- | ---: |",
    `| Archived | ${audit.findings.archived.length} |`,
    `| Missing or inaccessible | ${audit.findings.missing.length} |`,
    `| Disabled | ${audit.findings.disabled.length} |`,
    `| Redirected or transferred | ${audit.findings.redirected.length} |`,
  ];

  const groups = [
    ["Archived repositories to retire", audit.findings.archived, false],
    ["Missing or inaccessible repositories to remove", audit.findings.missing, false],
    ["Disabled repositories to remove", audit.findings.disabled, false],
    ["Redirected sources to update", audit.findings.redirected, true],
  ];

  for (const [heading, findings, includeCanonical] of groups) {
    if (findings.length === 0) continue;
    sections.push(
      "",
      `## ${heading}`,
      "",
      renderFindingTable(findings, includeCanonical),
    );
  }

  sections.push(
    "",
    "_This issue is maintained automatically by the weekly template repository health workflow._",
  );
  return sections.join("\n");
}

function selectManagedIssue(issues) {
  return issues.find(
    (issue) =>
      issue.title === ISSUE_TITLE &&
      typeof issue.body === "string" &&
      issue.body.includes(ISSUE_MARKER),
  ) || null;
}

async function findManagedIssue(repository) {
  const { stdout } = await runGh([
    "issue",
    "list",
    "--repo",
    repository,
    "--state",
    "all",
    "--search",
    `${ISSUE_TITLE} in:title`,
    "--limit",
    "100",
    "--json",
    "number,title,body,state",
  ]);
  const issues = JSON.parse(stdout);
  return selectManagedIssue(issues);
}

async function updateManagedIssue(repository, issue, body, state) {
  const args = [
    "api",
    "--method",
    "PATCH",
    `repos/${repository}/issues/${issue.number}`,
    "--raw-field",
    `title=${ISSUE_TITLE}`,
    "--raw-field",
    `body=${body}`,
    "--raw-field",
    `state=${state}`,
  ];
  if (state === "closed") {
    args.push("--raw-field", "state_reason=completed");
  }
  await runGh(args);
}

async function synchronizeIssue(repository, audit) {
  const issue = await findManagedIssue(repository);
  const body = buildIssueBody(audit);

  if (hasUnhealthyFindings(audit)) {
    if (issue) {
      await updateManagedIssue(repository, issue, body, "open");
      console.log(`Updated issue #${issue.number}.`);
      return;
    }

    const { stdout } = await runGh([
      "api",
      "--method",
      "POST",
      `repos/${repository}/issues`,
      "--raw-field",
      `title=${ISSUE_TITLE}`,
      "--raw-field",
      `body=${body}`,
    ]);
    const created = JSON.parse(stdout);
    console.log(`Created issue #${created.number}.`);
    return;
  }

  if (issue && issue.state === "OPEN") {
    const healthyBody = [
      ISSUE_MARKER,
      "## Template repository health restored",
      "",
      `Checked ${audit.templateCount} template entries representing ${audit.repositoryCount} unique GitHub repositories. No unhealthy repositories were found.`,
      "",
      "_Closed automatically by the weekly template repository health workflow._",
    ].join("\n");
    await updateManagedIssue(repository, issue, healthyBody, "closed");
    console.log(`Closed issue #${issue.number}.`);
  } else {
    console.log("No unhealthy template repositories found.");
  }
}

function parseArguments(argv) {
  const options = {
    catalog: DEFAULT_CATALOG,
    repository: process.env.GITHUB_REPOSITORY || "",
    reportOnly: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--catalog") {
      options.catalog = argv[++index];
    } else if (argument === "--repository") {
      options.repository = argv[++index];
    } else if (argument === "--report-only") {
      options.reportOnly = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!options.catalog) {
    throw new Error("--catalog requires a file path");
  }
  if (!options.reportOnly && !options.repository) {
    throw new Error("--repository or GITHUB_REPOSITORY is required");
  }
  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const catalogPath = path.resolve(options.catalog);
  const templates = JSON.parse(await fs.readFile(catalogPath, "utf8"));
  const audit = await auditTemplates(templates);

  if (options.reportOnly) {
    console.log(buildIssueBody(audit));
    return;
  }

  await synchronizeIssue(options.repository, audit);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  ISSUE_MARKER,
  ISSUE_TITLE,
  auditTemplates,
  buildIssueBody,
  escapeMarkdown,
  hasUnhealthyFindings,
  normalizeUrl,
  parseArguments,
  parseGitHubSource,
  selectManagedIssue,
};

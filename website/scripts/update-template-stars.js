#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");

const requestConcurrency = 8;
const requestTimeoutMs = 15_000;

function getNormalizedSource(source) {
  const url = new URL(source);
  const parts = url.pathname.split("/").filter(Boolean);
  if (
    url.protocol !== "https:" ||
    url.hostname.toLowerCase() !== "github.com" ||
    parts.length !== 2 ||
    url.search ||
    url.hash
  ) {
    throw new Error(`Invalid public template source: ${source}`);
  }

  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/i, "");
  return {
    owner,
    repo,
    source: `https://github.com/${owner}/${repo}`.toLowerCase(),
  };
}

async function fetchStars(owner, repo, token) {
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "awesome-azd-template-stars",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: AbortSignal.timeout(requestTimeoutMs),
    },
  );
  if (!response.ok) {
    throw new Error(
      `GitHub returned ${response.status} for ${owner}/${repo}`,
    );
  }
  const data = await response.json();
  if (!Number.isInteger(data.stargazers_count) || data.stargazers_count < 0) {
    throw new Error(`GitHub returned invalid stars for ${owner}/${repo}`);
  }
  return data.stargazers_count;
}

async function mapWithConcurrency(values, mapper) {
  const results = new Array(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(values[index], index);
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(requestConcurrency, values.length) },
      () => worker(),
    ),
  );
  return results;
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is required to update template stars");
  }

  const templatesPath = path.resolve(
    __dirname,
    "../static/templates.json",
  );
  const outputPath = path.resolve(
    __dirname,
    "../static/template-stars.json",
  );
  const templates = JSON.parse(fs.readFileSync(templatesPath, "utf8"));
  const repositories = templates
    .filter(
      (template) =>
        !template.templateType ||
        template.templateType === "ai-app-templates",
    )
    .map((template) => getNormalizedSource(template.source))
    .sort((left, right) => left.source.localeCompare(right.source));

  const duplicates = repositories.filter(
    (repository, index) =>
      index > 0 && repository.source === repositories[index - 1].source,
  );
  if (duplicates.length > 0) {
    throw new Error(
      `Duplicate public template sources: ${duplicates
        .map((repository) => repository.source)
        .join(", ")}`,
    );
  }

  let completed = 0;
  const entries = await mapWithConcurrency(
    repositories,
    async (repository) => {
      const stars = await fetchStars(
        repository.owner,
        repository.repo,
        token,
      );
      completed += 1;
      process.stdout.write(
        `\rFetched ${completed}/${repositories.length} repositories`,
      );
      return [repository.source, stars];
    },
  );
  process.stdout.write("\n");

  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        repositories: Object.fromEntries(entries),
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Updated ${outputPath}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  fetchStars,
  getNormalizedSource,
  mapWithConcurrency,
};

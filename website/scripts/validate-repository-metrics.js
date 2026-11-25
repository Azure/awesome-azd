#!/usr/bin/env node

"use strict";

const {
  DEFAULT_SOURCE_URL,
  readMaxAgeHours,
  validateRepositoryMetricsSource,
} = require("./prepare-repository-metrics");

validateRepositoryMetricsSource({
  sourceUrl:
    process.env.REPOSITORY_METRICS_URL || DEFAULT_SOURCE_URL,
  maxAgeHours: readMaxAgeHours(
    process.env.REPOSITORY_METRICS_MAX_AGE_HOURS
  ),
})
  .then(({ generatedAt, repositoryCount }) => {
    console.log(
      `Validated live repository metrics generated at ${generatedAt} for ${repositoryCount} repositories.`
    );
  })
  .catch((error) => {
    console.error(
      `Live repository metrics validation failed: ${error.message}`
    );
    process.exitCode = 1;
  });

#!/usr/bin/env node

"use strict";

const {
  DEFAULT_SOURCE_URL,
  prepareRepositoryMetrics,
  readMaxAgeHours,
} = require("./prepare-repository-metrics");

prepareRepositoryMetrics({
  sourceUrl:
    process.env.REPOSITORY_METRICS_URL || DEFAULT_SOURCE_URL,
  maxAgeHours: readMaxAgeHours(
    process.env.REPOSITORY_METRICS_MAX_AGE_HOURS
  ),
  requireRemoteMetrics: true,
})
  .then(({ moduleOutputPath, repositoryCount }) => {
    console.log(
      `Updated the bundled repository metrics snapshot for ${repositoryCount} repositories at ${moduleOutputPath}.`
    );
  })
  .catch((error) => {
    console.error(
      `Repository metrics snapshot update failed: ${error.message}`
    );
    process.exitCode = 1;
  });

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export type RepositoryMetrics = {
  forks: number;
  stars: number;
  updatedOn: string;
  score?: number;
};

const metricsRequests = new Map<string, Promise<RepositoryMetrics>>();
const repositoryScores = new Map<string, number>();
const metadataTimeoutMs = 5_000;
const maxConcurrentMetadataRequests = 4;
const queuedMetadataRequests: Array<{
  source: string;
  run: () => void;
}> = [];
let activeMetadataRequests = 0;

function scheduleMetadataRequest<T>(
  source: string,
  request: () => Promise<T>,
) {
  return new Promise<T>((resolve, reject) => {
    const runRequest = () => {
      activeMetadataRequests += 1;
      void Promise.resolve()
        .then(request)
        .then(resolve, reject)
        .finally(() => {
          activeMetadataRequests -= 1;
          queuedMetadataRequests.shift()?.run();
        });
    };

    if (activeMetadataRequests < maxConcurrentMetadataRequests) {
      runRequest();
    } else {
      queuedMetadataRequests.push({ source, run: runRequest });
    }
  });
}

export function getRepositoryCoordinates(source: string): {
  owner: string;
  repo: string;
  slug: string;
} {
  const sourceUrl = new URL(source);
  const [owner, repo] = sourceUrl.pathname
    .split("/")
    .filter(Boolean)
    .map((part) => part.toLowerCase());

  if (!owner || !repo) {
    throw new Error(`Invalid GitHub repository URL: ${source}`);
  }

  return { owner, repo, slug: `${owner}/${repo}` };
}

export function getCachedRepositoryScore(source: string): number | undefined {
  return repositoryScores.get(source);
}

export function prioritizeRepositoryMetrics(
  sources: readonly string[],
): void {
  const sourcePriorities = new Map(
    sources.map((source, index) => [source, index]),
  );

  queuedMetadataRequests.sort((left, right) => {
    const leftPriority = sourcePriorities.get(left.source);
    const rightPriority = sourcePriorities.get(right.source);
    if (leftPriority === undefined) {
      return rightPriority === undefined ? 0 : 1;
    }
    if (rightPriority === undefined) {
      return -1;
    }
    return leftPriority - rightPriority;
  });
}

export function loadRepositoryMetrics(
  source: string,
): Promise<RepositoryMetrics> {
  const existingRequest = metricsRequests.get(source);
  if (existingRequest) {
    return existingRequest;
  }

  const { owner, repo } = getRepositoryCoordinates(source);
  const request = scheduleMetadataRequest(source, async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      metadataTimeoutMs,
    );

    try {
      const response = await fetch(
        `https://cachelp6qsotirqelc.z20.web.core.windows.net/rd.${owner}.${repo}`,
        { signal: controller.signal },
      );
      if (!response.ok) {
        throw new Error(
          `Repository metadata returned status ${response.status}`,
        );
      }

      const data: unknown = await response.json();
      if (
        typeof data !== "object" ||
        data === null ||
        !("forks" in data) ||
        typeof data.forks !== "number" ||
        !("stars" in data) ||
        typeof data.stars !== "number" ||
        !("updatedOn" in data) ||
        typeof data.updatedOn !== "string"
      ) {
        throw new Error("Unexpected repository metadata format");
      }

      const score =
        "score" in data && typeof data.score === "number"
          ? data.score
          : undefined;
      if (score !== undefined) {
        repositoryScores.set(source, score);
      }

      return {
        forks: data.forks,
        stars: data.stars,
        updatedOn: data.updatedOn,
        score,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  })
    .catch((error) => {
      metricsRequests.delete(source);
      throw error;
    });

  metricsRequests.set(source, request);
  return request;
}

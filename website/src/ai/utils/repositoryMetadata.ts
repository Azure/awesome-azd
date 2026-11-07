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
  signal?: AbortSignal,
) {
  return new Promise<T>((resolve, reject) => {
    let started = false;
    const abortError = new DOMException(
      "Repository metadata request aborted",
      "AbortError",
    );
    const queuedRequest = {
      source,
      run: () => runRequest(),
    };
    const removeAbortListener = () => {
      signal?.removeEventListener("abort", cancelQueuedRequest);
    };
    const runNextRequest = () => {
      queuedMetadataRequests.shift()?.run();
    };
    const cancelQueuedRequest = () => {
      if (started) {
        return;
      }
      const requestIndex = queuedMetadataRequests.indexOf(queuedRequest);
      if (requestIndex >= 0) {
        queuedMetadataRequests.splice(requestIndex, 1);
      }
      removeAbortListener();
      reject(abortError);
    };
    const runRequest = () => {
      if (signal?.aborted) {
        removeAbortListener();
        reject(abortError);
        runNextRequest();
        return;
      }
      started = true;
      activeMetadataRequests += 1;
      void Promise.resolve()
        .then(request)
        .then(resolve, reject)
        .finally(() => {
          removeAbortListener();
          activeMetadataRequests -= 1;
          runNextRequest();
        });
    };

    if (signal?.aborted) {
      reject(abortError);
      return;
    }
    signal?.addEventListener("abort", cancelQueuedRequest, {
      once: true,
    });
    if (activeMetadataRequests < maxConcurrentMetadataRequests) {
      runRequest();
    } else {
      queuedMetadataRequests.push(queuedRequest);
    }
  });
}

async function requestRepositoryMetrics(
  source: string,
  signal?: AbortSignal,
): Promise<RepositoryMetrics> {
  const { owner, repo } = getRepositoryCoordinates(source);
  const controller = new AbortController();
  const abortRequest = () => controller.abort();
  const timeoutId = setTimeout(abortRequest, metadataTimeoutMs);
  if (signal?.aborted) {
    controller.abort();
  } else {
    signal?.addEventListener("abort", abortRequest, { once: true });
  }

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
    signal?.removeEventListener("abort", abortRequest);
  }
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
  signal?: AbortSignal,
): Promise<RepositoryMetrics> {
  if (signal) {
    return scheduleMetadataRequest(
      source,
      () => requestRepositoryMetrics(source, signal),
      signal,
    );
  }

  const existingRequest = metricsRequests.get(source);
  if (existingRequest) {
    return existingRequest;
  }

  const request = scheduleMetadataRequest(source, () =>
    requestRepositoryMetrics(source),
  )
    .catch((error) => {
      metricsRequests.delete(source);
      throw error;
    });

  metricsRequests.set(source, request);
  return request;
}

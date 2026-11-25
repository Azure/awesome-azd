/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { useEffect, useMemo, useState } from "react";
import {
  fetchRepositoryMetrics,
  getRepositoryStarsBySlug,
  type RepositoryMetricsAggregate,
} from "./repositoryMetrics";

type RepositoryStarRecord = {
  repository: string;
  stars?: number;
};

let runtimeRepositoryMetricsRequest:
  | Promise<RepositoryMetricsAggregate | undefined>
  | undefined;

function loadRuntimeRepositoryMetrics(): Promise<
  RepositoryMetricsAggregate | undefined
> {
  runtimeRepositoryMetricsRequest ??= fetchRepositoryMetrics().catch(
    (error) => {
      console.warn(
        "Unable to load current repository stars; using bundled star counts.",
        error,
      );
      return undefined;
    },
  );
  return runtimeRepositoryMetricsRequest;
}

function useRepositoryMetricsAggregate():
  | RepositoryMetricsAggregate
  | undefined {
  const [aggregate, setAggregate] = useState<
    RepositoryMetricsAggregate | undefined
  >();

  useEffect(() => {
    let active = true;
    void loadRuntimeRepositoryMetrics().then((value) => {
      if (active && value !== undefined) {
        setAggregate(value);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return aggregate;
}

export function applyRuntimeRepositoryMetrics<
  T extends RepositoryStarRecord,
>(
  records: readonly T[],
  aggregate: RepositoryMetricsAggregate | undefined,
): readonly T[] {
  if (aggregate === undefined) {
    return records;
  }

  let changed = false;
  const updatedRecords = records.map((record) => {
    const stars = getRepositoryStarsBySlug(
      aggregate,
      record.repository,
    );
    if (stars === undefined || stars === record.stars) {
      return record;
    }

    changed = true;
    return { ...record, stars };
  });

  return changed ? updatedRecords : records;
}

export function useRuntimeRepositoryMetrics<
  T extends RepositoryStarRecord,
>(records: readonly T[]): readonly T[] {
  const aggregate = useRepositoryMetricsAggregate();
  return useMemo(
    () => applyRuntimeRepositoryMetrics(records, aggregate),
    [aggregate, records],
  );
}

export function useRuntimeRepositoryStars(
  repository: string,
  bundledStars: number | undefined,
): number | undefined {
  const aggregate = useRepositoryMetricsAggregate();
  return aggregate === undefined
    ? bundledStars
    : getRepositoryStarsBySlug(aggregate, repository) ??
        bundledStars;
}

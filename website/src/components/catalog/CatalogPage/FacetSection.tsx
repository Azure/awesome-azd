/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@fluentui/react-components";
import { Sparkle16Regular } from "@fluentui/react-icons";
import type { CatalogListingTemplate } from "../../../catalog/catalogTypes";
import {
  getFacetLabel,
  getFacetOptions,
  type CatalogFacet,
  type CatalogFacetKey,
  type CatalogState,
} from "../../../catalog/catalogQuery";
import styles from "./styles.module.css";

function AiIcon(): React.JSX.Element {
  return <Sparkle16Regular className={styles.aiIcon} aria-hidden="true" />;
}

export default function FacetSection({
  facet,
  records,
  state,
  valueCounts,
  onChange,
}: {
  facet: CatalogFacet;
  records: readonly CatalogListingTemplate[];
  state: CatalogState;
  valueCounts: ReadonlyMap<string, number>;
  onChange: (
    key: CatalogFacetKey,
    value: string,
    checked: boolean,
  ) => void;
}): React.JSX.Element | null {
  const selected = state[facet.key];
  const [open, setOpen] = useState(
    facet.open === true || selected.length > 0,
  );
  const options = useMemo(
    () => getFacetOptions(records, facet),
    [facet, records],
  );

  useEffect(() => {
    if (selected.length > 0) {
      setOpen(true);
    }
  }, [selected.length]);

  const optionsWithCounts = useMemo(
    () =>
      options
        .map((value) => ({
          value,
          count: valueCounts.get(value) ?? 0,
        }))
        .filter(
          ({ value, count }) =>
            count > 0 || selected.includes(value),
        ),
    [options, selected, valueCounts],
  );

  if (optionsWithCounts.length === 0) {
    return null;
  }

  return (
    <details
      className={styles.facet}
      open={open}
      onToggle={(event) => {
        setOpen(event.currentTarget.open);
      }}
    >
      <summary>
        {facet.label}
        <span title="Filter items">{optionsWithCounts.length}</span>
      </summary>
      <fieldset>
        <legend className={styles.visuallyHidden}>{facet.label}</legend>
        {optionsWithCounts.map(({ value, count }) => {
          const label = getFacetLabel(facet, value);
          const id = `catalog-${facet.key}-${value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}`;
          const checked = selected.includes(value);

          return (
            <Checkbox
              key={value}
              id={id}
              value={value}
              className={`${styles.filterOption} ${
                checked ? styles.filterOptionSelected : ""
              }`}
              checked={checked}
              onChange={(_event, data) => {
                onChange(facet.key, value, data.checked === true);
              }}
              label={
                <>
                  <span className={styles.filterValue}>
                    {facet.key === "types" && value === "ai" ? (
                      <AiIcon />
                    ) : null}
                    <span>{label}</span>
                  </span>
                  <small>{count}</small>
                </>
              }
            />
          );
        })}
      </fieldset>
    </details>
  );
}

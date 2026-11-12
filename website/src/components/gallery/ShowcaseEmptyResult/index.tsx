/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { Button } from "@fluentui/react-components";
import styles from "./styles.module.css";

export default function ShowcaseEmptyResult({
  id,
  itemLabel,
  onClear,
}: {
  id: string;
  itemLabel: "templates" | "extensions";
  onClear: () => void;
}) {
  return (
    <div id={id} className={styles.emptyResult}>
      <h2>No matching {itemLabel}</h2>
      <p>Try different keywords or filters.</p>
      <Button appearance="secondary" onClick={onClear}>
        Clear search and filters
      </Button>
    </div>
  );
}

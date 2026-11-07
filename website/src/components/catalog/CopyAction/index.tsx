/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { useClipboard } from "../../../utils/useClipboard";
import styles from "./styles.module.css";

export default function CopyAction({
  value,
  idleLabel,
  copiedLabel = "Copied",
  failedLabel = "Copy unavailable",
  className,
  children,
}: {
  value: string;
  idleLabel: string;
  copiedLabel?: string;
  failedLabel?: string;
  className?: string;
  children?: React.ReactNode;
}): React.JSX.Element {
  const { status, copy } = useClipboard();
  const label =
    status === "copied"
      ? copiedLabel
      : status === "failed"
        ? failedLabel
        : idleLabel;

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={label}
        title={label}
        onClick={() => {
          void copy(value);
        }}
      >
        {children ?? label}
      </button>
      <span className={styles.status} role="status" aria-live="polite">
        {status === "copied"
          ? copiedLabel
          : status === "failed"
            ? failedLabel
            : ""}
      </span>
    </>
  );
}


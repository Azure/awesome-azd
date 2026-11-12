/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { useClipboard } from "../../../utils/useClipboard";
import styles from "./styles.module.css";

function CopyFeedbackIcon({
  status,
}: {
  status: "copied" | "failed";
}): React.JSX.Element {
  return (
    <svg
      className={styles.feedbackIcon}
      data-copy-feedback={status}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {status === "copied" ? (
        <path d="m5 12 4 4L19 7" />
      ) : (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v6 M12 17h.01" />
        </>
      )}
    </svg>
  );
}

export default function CopyAction({
  value,
  idleLabel,
  copiedLabel = "Copied",
  failedLabel = "Copy unavailable",
  className,
  analyticsData,
  children,
}: {
  value: string;
  idleLabel: string;
  copiedLabel?: string;
  failedLabel?: string;
  className?: string;
  analyticsData?: string;
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
        data-m={analyticsData}
        onClick={() => {
          void copy(value);
        }}
      >
        {children == null
          ? label
          : status === "copied" || status === "failed"
            ? <CopyFeedbackIcon status={status} />
            : children}
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


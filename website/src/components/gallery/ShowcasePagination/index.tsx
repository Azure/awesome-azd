/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { Button, Text } from "@fluentui/react-components";
import styles from "./styles.module.css";

export default function ShowcasePagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];

    for (let i = Math.max(2, currentPage - delta);
         i <= Math.min(totalPages - 1, currentPage + delta);
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  return (
    <div className={styles.pagination}>
      <Button
        appearance="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>

      {getVisiblePages().map((page, index) => {
        if (page === "...") {
          return (
            <Text
              key={`ellipsis-${index}`}
              size={400}
              className={styles.paginationEllipsis}
            >
              …
            </Text>
          );
        }

        return (
          <Button
            key={page}
            appearance={currentPage === page ? "primary" : "outline"}
            onClick={() => onPageChange(Number(page))}
            className={styles.pageButton}
          >
            {page}
          </Button>
        );
      })}

      <Button
        appearance="outline"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
}

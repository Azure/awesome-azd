/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

export type TemplateCollection = "all" | "ai";

export default function CollectionTabs({
  activeCollection,
}: {
  activeCollection: TemplateCollection;
}): React.JSX.Element {
  const allTemplatesUrl = useBaseUrl("/templates");
  const aiTemplatesUrl = useBaseUrl("/templates/ai");

  return (
    <nav className={styles.container} aria-label="Template collections">
      <div className={styles.tabs} role="tablist">
        <Link
          className={
            activeCollection === "all" ? styles.activeTab : styles.tab
          }
          to={allTemplatesUrl}
          role="tab"
          aria-selected={activeCollection === "all"}
        >
          All templates
        </Link>
        <Link
          className={
            activeCollection === "ai" ? styles.activeTab : styles.tab
          }
          to={aiTemplatesUrl}
          role="tab"
          aria-selected={activeCollection === "ai"}
        >
          AI app templates
        </Link>
      </div>
    </nav>
  );
}

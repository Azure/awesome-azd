/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { Card, Link, CardFooter, CardHeader } from "@fluentui/react-components";
import useBaseUrl from "@docusaurus/useBaseUrl";

/**
 * Component to render each Feature in HomepageFeatures list
 */
export default function Feature({ Svg, title, description, link, content }) {
  return (
    <Card className={styles.card}>
      <CardHeader
        header={
          <img width="80px" height="80px" src={useBaseUrl(Svg)} alt={title} />
        }
      />
      <div className={styles.cardContent}>
        <div className={styles.featureTitle}>{title}</div>
        <div className={styles.featureDescription}>{description}</div>
      </div>
      <CardFooter>
        <Link className={styles.featureLink} href={link}>
          {content} ➔
        </Link>
      </CardFooter>
    </Card>
  );
}

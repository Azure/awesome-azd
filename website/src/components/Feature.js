/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import {
  Card,
  makeStyles,
  Link,
  CardFooter,
  CardHeader,
  typographyStyles,
} from "@fluentui/react-components";
import { useColorMode } from "@docusaurus/theme-common";
import useBaseUrl from "@docusaurus/useBaseUrl";

const useStyles = makeStyles({
  subtitle1: typographyStyles.subtitle1,
  body1: typographyStyles.body1,
  body2: typographyStyles.body2,
});

/**
 * Component to render each Feature in HomepageFeatures list
 */
export default function Feature({ Svg, title, description, link, content }) {
  const style = useStyles();
  const { colorMode } = useColorMode();
  return (
    <Card className={styles.card}>
      <CardHeader
        header={
          <img width="80px" height="80px" src={useBaseUrl(Svg)} alt={title} />
        }
      />
      <div className={styles.cardContent}>
        <div className={style.subtitle1}>{title}</div>
        <div className={style.body1}>{description}</div>
      </div>
      <CardFooter>
        <Link
          className={style.body2}
          style={
            colorMode != "dark" ? { color: "#7160E8" } : { color: "#A79CF1" }
          }
          href={link}
        >
          {content} ➔
        </Link>
      </CardFooter>
    </Card>
  );
}

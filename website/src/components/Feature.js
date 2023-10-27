import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";
import {
  Card,
  shorthands,
  makeStyles,
  Link,
  CardFooter,
  CardHeader,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  card: {
    ...shorthands.margin("auto"),
    width: "326px",
    height: "272px",
    maxWidth: "100%",
    maxHeight: "100%",
  },
});
/**
 * Component to render each Feature in HomepageFeatures list
 */
export default function Feature({ Svg, title, description, link, content }) {
  const style = useStyles();
  return (
    <Card className={style.card}>
      <CardHeader
        header={
          <img
            width="80px"
            height="80px"
            src={Svg}
            alt={title}
          />
        }
      />
      <div className={styles.cardContent}>
        <div className={styles.title}>{title}</div>
        <div className={styles.description}>{description}</div>
      </div>
      <CardFooter>
        <Link className={styles.link} href={link}>
          {content} ➔
        </Link>
      </CardFooter>
    </Card>
  );
}

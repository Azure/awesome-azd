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
  typographyStyles,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  card: {
    ...shorthands.margin("auto"),
    width: "326px",
    height: "272px",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  subtitle1: typographyStyles.subtitle1,
  body1: typographyStyles.body1,
  body2: typographyStyles.body2,
});

/**
 * Component to render each Feature in HomepageFeatures list
 */
export default function Feature({ Svg, title, description, link, content }) {
  const style = useStyles();
  return (
    <Card className={style.card}>
      <CardHeader
        header={<img width="80px" height="80px" src={Svg} alt={title} />}
      />
      <div className={styles.cardContent}>
        <div className={style.subtitle1}>{title}</div>
        <div className={style.body1}>{description}</div>
      </div>
      <CardFooter>
        <Link className={style.body2} style={{color:"#7160E8"}} href={link}>
          {content} ➔
        </Link>
      </CardFooter>
    </Card>
  );
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import Feature from "@site/src/components/Feature";

/**
 * Fixed data that is rendered as a 'Feature' component on Homepage
 * Each element requires the following pieces of data:
 *  Svg = path to an svg that is rendered here within an <img> tag
 *  title = the short title given to feature component
 *  description = the 1-2 sentence description shown below title in Feature card
 *  link = the link associated with title and image (for redirection)
 */
const FeatureList = [
  {
    title: "Discover Templates",
    Svg: "img/home-discover.svg",
    link: "https://azure.github.io/awesome-azd/",
    description:
      "View our gallery of community-contributed and Microsoft-authored templates.",
    content: "View templates",
  },
  {
    title: "Learn more about azd",
    Svg: "img/home-learn.svg",
    link: "https://aka.ms/azd",
    description:
      "Read our documentation for more information about azd and its features.",
    content: "View docs",
  },
  {
    title: "Create your own template",
    Svg: "img/home-create.svg",
    link: "https://learn.microsoft.com/azure/developer/azure-developer-cli/make-azd-compatible?pivots=azd-create",
    description:
      "Learn how to build a template with step-by-step instructions.",
    content: "Try learn module",
  },
  {
    title: "Contribute to the Gallery",
    Svg: "img/home-contribute.svg",
    link: "https://azure.github.io/awesome-azd/docs/contribute",
    description:
      "After making your azd template, consider adding it to our gallery to share with fellow azd-developers.",
    content: "View contributor guide",
  },
];

/**
 * Component that renders FeaturesList data in a container
 * with each data item represented as a Feature in a responsive grid
 */
export default function HomepageFeatures() {
  return (
    <div className={styles.features}>
      <div className={styles.row}>
        {FeatureList.map((props, idx) => (
          <Feature key={idx} {...props} />
        ))}
      </div>
    </div>
  );
}

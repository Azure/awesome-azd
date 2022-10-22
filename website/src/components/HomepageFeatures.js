import React from 'react';
import styles from './styles.module.css';
import Feature from '@site/src/components/Feature';

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
    title: 'Discover Templates',
    Svg: 'img/home-discover.svg',
    link: "/",
    description: (
      <>
        Explore the <a href="https://github.com/azure/">azd-templates</a> topic on GitHub <b>or</b> check out the <a href="/awesome-azd">Gallery</a> to find templates using richer filters and search capability.
      </>
    ),
  },
  {
    title: 'Create Your Own',
    Svg: 'img/home-create.svg',
    link: "https://learn.microsoft.com/azure/developer/azure-developer-cli/make-azd-compatible?pivots=azd-create",
    description: (
      <>
        Have an existing project that you want to migrate, to use azd templates? <a href="https://learn.microsoft.com/azure/developer/azure-developer-cli/make-azd-compatible?pivots=azd-convert"> Convert a sample </a> <b>or</b> <a href="https://learn.microsoft.com/azure/developer/azure-developer-cli/make-azd-compatible?pivots=azd-create">create a new template!</a>
      </>
    ),
  },
  {
    title: 'Contribute To Gallery',
    Svg: 'img/home-contribute.svg',
    link: "https://github.com/Azure/awesome-azd/issues/new/choose",
    description: (
      <>
        Consider sharing your template in our <a href="/awesome-azd">Gallery</a> to help the community. Just <a href="https://github.com/Azure/awesome-azd/issues/new/choose">fill in the issue </a> and we'll do the rest!
      </>
    ),
  },
];


/**
 * Component that renders FeaturesList data in a container
 * with each data item represented as a Feature in a responsive grid
 */
export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

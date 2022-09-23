import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Discover Templates',
    Svg: '/img/home-discover.svg',
    link: "/gallery",
    description: (
      <>
        Explore the <a href="https://github.com/azure/awesome-azd">azd-templates</a> topic on GitHub <b>or</b> check out the <a href="/gallery">Gallery</a> to find templates using richer filters and search capability.
      </>
    ),
  },
  {
    title: 'Create Your Own',
    Svg: '/img/home-create.svg',
    link: "https://learn.microsoft.com/azure/developer/azure-developer-cli/make-azd-compatible?pivots=azd-create",
    description: (
      <>
        Have an existing project that you want to migrate, to use azd templates? <a href="https://learn.microsoft.com/azure/developer/azure-developer-cli/make-azd-compatible?pivots=azd-convert"> Convert a sample </a> <b>or</b> <a href="https://learn.microsoft.com/azure/developer/azure-developer-cli/make-azd-compatible?pivots=azd-create">create a new template!</a>
      </>
    ),
  },
  {
    title: 'Contribute To Gallery',
    Svg: '/img/home-contribute.svg',
    link: "https://github.com/Azure/awesome-azd/issues/new/choose",
    description: (
      <>
        Consider sharing your template in our <a href="/gallery">Gallery</a> to help the community. Just <a href="https://github.com/Azure/awesome-azd/issues/new/choose">fill in the issue </a> and we'll do the rest!
      </>
    ),
  },
];

function Feature({Svg, title, description, link}) {
  return (
    <div className={clsx('col col--4')}>
      <a href={link} target="_blank">
        <div className="text--center">
          <img width="150px" height="150px" src={Svg} alt={title} />
        </div>
      </a>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

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

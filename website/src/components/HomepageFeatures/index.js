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
        Docusaurus was designed from the ground up to be easily installed and
        used to get your website up and running quickly.
      </>
    ),
  },
  {
    title: 'Create Your Own',
    Svg: '/img/home-create.svg',
    link: "https://learn.microsoft.com/azure/developer/azure-developer-cli/make-azd-compatible?pivots=azd-create",
    description: (
      <>
        Docusaurus lets you focus on your docs, and we&apos;ll do the chores. Go
        ahead and move your docs into the <code>docs</code> directory.
      </>
    ),
  },
  {
    title: 'Contribute To Gallery',
    Svg: '/img/home-contribute.svg',
    link: "https://github.com/Azure/awesome-azd/issues/new/choose",
    description: (
      <>
        Extend or customize your website layout by reusing React. Docusaurus can
        be extended while reusing the same header and footer.
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

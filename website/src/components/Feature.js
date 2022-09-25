import React from 'react';
import clsx from 'clsx';


/**
 * Component to render each Feature in HomepageFeatures list
 */
export default function Feature({Svg, title, description, link}) {
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
import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

export default function Home() {
    const {siteConfig} = useDocusaurusContext();
    return (
      <Layout
        title={"Showcase"}
        description="Showcase description">

        <main>

          <header className={clsx('hero hero--primary', styles.heroBanner)}>
            <div className="container">
              <h1 className="hero__title">{"Community Gallery"}</h1>
              <p className="hero__subtitle">{"Browse, Search, Contribute!"}</p>
              <div className={styles.buttons}>
                <Link
                  className="button button--secondary button--lg"
                  to="https://github.com/Azure/awesome-azd/issues/new/choose">
                  Add azd-template 📲
                </Link>
              </div>
            </div>
          </header>

        </main>
      </Layout>
    );
  }
  
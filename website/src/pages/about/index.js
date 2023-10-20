import React from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./index.module.css";

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
        <img
          src={useBaseUrl("/img/coverBackground.png")}
          className={styles.cover}
          onError={({ currentTarget }) => {
            currentTarget.style.display = "none";
          }}
          alt=""
        />
        <div className={styles.description}>
          <iframe
            className={styles.video}
            height="340"
            src="https://www.youtube.com/embed/9z3PiHSCcYs?si=F1yKpoiOQnzb4o-K"
            title="Azure Developer CLI: GitHub to cloud in minutes - Universe 2022"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}

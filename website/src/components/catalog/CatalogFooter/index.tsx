/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { CookieConsentContext } from "../../../components/CookieConsentContext";
import {
  manageCookieId,
  manageCookieLabel,
} from "../../../../constants.js";
import styles from "./styles.module.css";

const catalogJsonUrl =
  "https://azure.github.io/awesome-azd/templates.json";

export default function CatalogFooter(): React.JSX.Element {
  const siteConsent = React.useContext(CookieConsentContext);
  const llmsUrl = useBaseUrl("/llms.txt");
  const researchUrl = useBaseUrl("/templates/research");
  const items = [
    <a className="footer__link-item" href={llmsUrl} key="llms">
      llms.txt
    </a>,
    <a
      className="footer__link-item"
      href={catalogJsonUrl}
      key="catalog"
    >
      Catalog JSON
    </a>,
    <Link
      className="footer__link-item"
      to={researchUrl}
      key="research"
    >
      Research &amp; rationale
    </Link>,
    <a
      className="footer__link-item"
      href="https://privacy.microsoft.com/privacystatement"
      key="privacy"
    >
      Privacy Statement
    </a>,
    ...(siteConsent?.isConsentRequired === false
      ? []
      : [
          <button
            type="button"
            className="footer__link-item"
            id={manageCookieId}
            key="cookies"
            onClick={() => {
              if (siteConsent) {
                siteConsent.manageConsent();
              } else {
                console.warn("Cookie consent is not available yet.");
              }
            }}
          >
            {manageCookieLabel}
          </button>,
        ]),
  ];

  return (
    <footer className={styles.footer}>
      <div className="footer__links">
        {items.map((item, index) => (
          <React.Fragment key={item.key}>
            {item}
            {index < items.length - 1 ? (
              <span className="footer__link-separator">·</span>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </footer>
  );
}


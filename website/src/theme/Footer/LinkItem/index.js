import React from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import isInternalUrl from "@docusaurus/isInternalUrl";
import IconExternalLink from "@theme/Icon/ExternalLink";
import { manageCookieLabel, manageCookieId } from "../../../../constants.js";
import styles from "./styles.module.css";
import clsx from "clsx";

export default function FooterLinkItem({ item }) {
  const { to, href, label, id, prependBaseUrlToHref, ...props } = item;
  const toUrl = useBaseUrl(to);
  const normalizedHref = useBaseUrl(href, { forcePrependBaseUrl: true });
  return label === manageCookieLabel ? (
    <a
      className={clsx(styles.manageCookies, "footer__link-item")}
      id={manageCookieId}
    >
      {manageCookieLabel}
    </a>
  ) : (
    <Link
      className="footer__link-item"
      {...(href
        ? {
            href: prependBaseUrlToHref ? normalizedHref : href,
          }
        : {
            to: toUrl,
          })}
      {...props}
    >
      {label}
      {href && !isInternalUrl(href) && <IconExternalLink />}
    </Link>
  );
}

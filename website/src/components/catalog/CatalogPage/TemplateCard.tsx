/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { Card } from "@fluentui/react-components";
import {
  Copy16Regular,
  Sparkle16Regular,
  Star16Regular,
} from "@fluentui/react-icons";
import type { CatalogListingTemplate } from "../../../catalog/catalogTypes";
import CopyAction from "../CopyAction";
import { RepositoryStarCount } from "./RepositoryStarCount";
import styles from "./styles.module.css";

function AiIcon(): React.JSX.Element {
  return <Sparkle16Regular className={styles.aiIcon} aria-hidden="true" />;
}

function StarIcon(): React.JSX.Element {
  return <Star16Regular aria-hidden="true" />;
}

function CopyIcon(): React.JSX.Element {
  return <Copy16Regular aria-hidden="true" />;
}

export default function TemplateCard({
  template,
  onNavigate,
}: {
  template: CatalogListingTemplate;
  onNavigate: (detailUrl: string) => void;
}): React.JSX.Element {
  const microsoftIcon = useBaseUrl("/img/Microsoft.svg");
  const communityIcon = useBaseUrl("/img/Community.svg");
  const detailUrl = useBaseUrl(template.detailPath);
  const cardTags = [
    ...(template.languages.length > 0
      ? template.languages
      : ["Bring your own code"]),
    ...template.iac.slice(0, 1),
    ...(template.primaryService ? [template.primaryService] : []),
  ];
  const headingId = `template-${template.id}`;

  return (
    <Card
      appearance="outline"
      focusMode="off"
      role="article"
      className={`${styles.card} ${
        template.featured ? styles.promotedCard : ""
      }`}
      data-template-card
    >
      <Link
        id={`${headingId}-link`}
        className={styles.cardLink}
        to={detailUrl}
        aria-labelledby={headingId}
        data-template-title={template.title}
        onClick={(event) => {
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }
          event.preventDefault();
          onNavigate(detailUrl);
        }}
      >
        <div className={styles.cardTop}>
          <span className={styles.cardAuthor}>
            <img
              src={
                template.authorship === "Microsoft"
                  ? microsoftIcon
                  : communityIcon
              }
              width="14"
              height="14"
              alt=""
              aria-hidden="true"
            />
            {template.authorship} Authored
          </span>
          {template.featured ? (
            <span className={styles.featuredBadge}>
              <StarIcon />
              Featured
            </span>
          ) : null}
        </div>
        <h2 id={headingId}>
          {template.isAi ? (
            <span
              className={styles.cardAi}
              title="AI application"
            >
              <AiIcon />
              <span className={styles.visuallyHidden}>
                AI application:{" "}
              </span>
            </span>
          ) : null}
          {template.title}
        </h2>
        <p className={styles.cardSummary}>{template.description}</p>
        <div className={styles.cardMeta}>
          <div className={styles.cardTags} data-template-tags>
            {cardTags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
          <RepositoryStarCount
            stars={template.stars}
            icon={<StarIcon />}
            className={styles.repoStats}
            statClassName={styles.repoStat}
          />
        </div>
      </Link>
      <div className={styles.cardCommand}>
        <code title={template.initCommand}>{template.initCommand}</code>
        <CopyAction
          value={template.initCommand}
          idleLabel={`Copy init command for ${template.title}`}
          copiedLabel={`Copied init command for ${template.title}`}
          className={styles.copyCommand}
        >
          <CopyIcon />
        </CopyAction>
      </div>
    </Card>
  );
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useState } from "react";
import styleCSS from "./styles.module.css";
import { type Template } from "../../../data/tags";
import { sortedTagList, tagList } from "../../../data/templates";
import {
  Card,
  CardFooter,
  Caption1Strong,
  Image,
} from "@fluentui/react-components";
import ShowcaseCardTag from "../ShowcaseTag/index";
import ShowcaseCardIcon from "../ShowcaseIcon/index";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";
import { getTemplateTags } from "../../../utils/galleryTags";
import {
  getRepositoryCoordinates,
  loadRepositoryMetrics,
  type RepositoryMetrics,
} from "../../../utils/repositoryMetadata";

function ShowcaseCard({
  template,
  coverPage,
  loadMetadata,
}: {
  template: Template;
  coverPage: boolean;
  loadMetadata: boolean;
}): React.JSX.Element | null {
  const tags = getTemplateTags(template);
  const tagOrder = coverPage ? tagList : sortedTagList;
  const title = template.title;
  const [githubData, setGithubData] = useState<RepositoryMetrics | null>(null);
  const { owner, repo } = getRepositoryCoordinates(template.source);
  const detailUrl = useBaseUrl(`/templates/ai/repo/${owner}/${repo}`);

  // Adobe Analytics Content
  const contentForAdobeAnalytics = `{\"id\":\"${title}\",\"cN\":\"Templates\"}`;

  useEffect(() => {
    if (!template.status_valid || !loadMetadata) {
      return undefined;
    }

    let active = true;
    loadRepositoryMetrics(template.source)
      .then((data) => {
        if (active) {
          setGithubData(data);
        }
      })
      .catch((error) => {
        console.error("Error loading repository metadata:", error);
      });
    return () => {
      active = false;
    };
  }, [loadMetadata, template]);

  if (!template.status_valid) {
    return null;
  }

  return (
    <a
      className={styleCSS.cardLink}
      href={detailUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-template-title={title}
    >
      <Card
        className={styleCSS.card}
        appearance="filled"
        data-m={contentForAdobeAnalytics}
      >
        <div className={styleCSS.cardBody}>
          {coverPage ?
            <>
              <div className={styleCSS.cardTitleCoverPage}>{title}</div>
              <div className={styleCSS.cardDescriptionCoverPage}>{template.description}</div>
            </> :
            <>
              <div className={styleCSS.cardTitle}>{title}</div>
              <div className={styleCSS.cardDescription}>{template.description}</div>
            </>
          }
          <div className={styleCSS.cardTags}>
            <ShowcaseCardTag
              tags={tags}
              page={false}
              tagOrder={tagOrder}
            />
          </div>
        </div>
        <CardFooter>
          <div className={styleCSS.cardFooterTag}>
            <ShowcaseCardIcon
              key={title}
              tags={tags}
              tagOrder={tagOrder}
            />
          </div>
          <GitHubInfo githubData={githubData} />
        </CardFooter>
      </Card>
    </a>
  );
}

const compactNumberFormatter = Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const GitHubInfo = ({
  githubData,
}: {
  githubData: RepositoryMetrics | null;
}) => {
  const { colorMode } = useColorMode();
  const forkIcon = useBaseUrl(
    colorMode === "dark" ? "/img/ai/forkDark.svg" : "/img/ai/fork.svg",
  );
  const starIcon = useBaseUrl(
    colorMode === "dark" ? "/img/ai/starDark.svg" : "/img/ai/star.svg",
  );

  if (!githubData) {
    return null;
  }

  const forks = compactNumberFormatter.format(githubData.forks);
  const stars = compactNumberFormatter.format(githubData.stars);

  return (
    <div className={styleCSS.gitHubData}>
      {Number.isFinite(githubData.forks) ? (
        <>
          <Image
            alt="fork"
            src={forkIcon}
            height={16}
            width={16}
          />
          <Caption1Strong className={styleCSS.forkNumber}>
            {forks}
          </Caption1Strong>
        </>
      ) : null}
      {Number.isFinite(githubData.stars) ? (
        <>
          <Image
            alt="star"
            src={starIcon}
            height={16}
            width={16}
          />
          <Caption1Strong className={styleCSS.starNumber}>
            {stars}
          </Caption1Strong>
        </>
      ) : null}
    </div>
  );
};

export default React.memo(ShowcaseCard);

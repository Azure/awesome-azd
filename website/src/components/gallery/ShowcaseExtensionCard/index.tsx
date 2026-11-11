/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styleCSS from "./styles.module.css";
import { type Extension } from "../../../data/extensionTypes";
import { CAPABILITY_BADGES } from "../../../data/extensionCapabilities";
import extensionRegistries from "../../../data/extensionRegistries.json";
import { Tags } from "../../../data/tags";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { Card, Link as FluentUILink } from "@fluentui/react-components";
import { Copy16Regular, Globe16Regular } from "@fluentui/react-icons";
import CopyAction from "../../catalog/CopyAction";

function ShowcaseExtensionCard({ extension }: { extension: Extension }): React.JSX.Element {
  const communityLogo = useBaseUrl("/img/Community.svg");
  const msftLogo = useBaseUrl("/img/Microsoft.svg");

  const isBuiltIn = extension.registryUrl === extensionRegistries.builtIn;
  const isMicrosoftAuthored = extension.tags.includes("msft");
  const headerLogo = isMicrosoftAuthored ? msftLogo : communityLogo;
  const headerText = isMicrosoftAuthored ? "Microsoft Authored" : "Community Authored";

  const installCommand = `azd ext install ${extension.id}`;
  // For 3P (community) extensions, the user must first register the
  // extension's registry as a source before `azd ext install` can resolve
  // the id. Source name uses the id's first segment (e.g. `jongio` for
  // `jongio.azd.app`). The footer still displays only the single install
  // line so it stays compact, but the copy button pastes both lines so the
  // user can run them as a single sequence in their terminal.
  const sourceName = extension.id.split(".")[0];
  const clipboardCommand =
    !isBuiltIn
      ? `azd ext source add -t url -n ${sourceName} -l ${extension.registryUrl}\n${installCommand}`
      : installCommand;
  const contentForAdobeAnalytics = JSON.stringify({
    id: extension.displayName,
    cN: "Copy Button (azd ext install)",
  });
  const headingId = `extension-${extension.id.replace(/[^a-z0-9]/gi, "-")}`;

  return (
    <Card
      key={extension.id}
      appearance="outline"
      focusMode="off"
      role="article"
      className={styleCSS.card}
      data-extension-card
    >
      <div className={styleCSS.cardBody}>
        <div className={styleCSS.cardTop}>
          <span className={styleCSS.cardAuthor}>
            <img
              src={headerLogo}
              width={14}
              height={14}
              alt=""
              aria-hidden="true"
            />
            {headerText}
          </span>
        </div>
        <h2 id={headingId} className={styleCSS.cardHeading}>
          <a
            className={styleCSS.cardTitle}
            href={extension.source}
            target="_blank"
            rel="noopener noreferrer"
          >
            {extension.displayName}
          </a>
        </h2>
        <div className={styleCSS.cardByline}>
          <span>by</span>
          {extension.authorUrl ? (
            <FluentUILink
              className={styleCSS.authorLink}
              href={extension.authorUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {extension.author}
            </FluentUILink>
          ) : (
            <span className={styleCSS.authorLink}>{extension.author}</span>
          )}
          {extension.website && (
            <FluentUILink
              href={extension.website}
              target="_blank"
              rel="noopener noreferrer"
              className={styleCSS.cardMetaLink}
              title="Documentation website"
            >
              <Globe16Regular className={styleCSS.websiteIcon} />
              <span className={styleCSS.visuallyHidden}>
                Documentation website
              </span>
            </FluentUILink>
          )}
        </div>
        <p className={styleCSS.cardDescription}>{extension.description}</p>
        <div className={styleCSS.cardTagContainer}>
          <div className={styleCSS.cardTagsWrapper}>
            {extension.capabilities.map((cap) => {
              const capInfo = CAPABILITY_BADGES[cap] || { label: cap, color: "informative" as const };
              return (
                <span
                  key={`cap-${cap}`}
                  className={styleCSS.cardBadge}
                >
                  {capInfo.label}
                </span>
              );
            })}
            {extension.tags
              .filter(
                (tag) =>
                  !["msft", "community", "new", "popular", "aicollection"].includes(tag) &&
                  Tags[tag] !== undefined,
              )
              .map((tag) => {
                const tagInfo = Tags[tag];
                return (
                  <span
                    key={`tag-${tag}`}
                    title={tagInfo.description}
                    className={styleCSS.cardBadge}
                  >
                    {tagInfo.label}
                  </span>
                );
              })}
          </div>
        </div>
      </div>
      <div className={styleCSS.commandBar}>
        <code
          id={"command_" + extension.id}
          className={styleCSS.command}
          title={installCommand}
          aria-label={`Install command for ${extension.displayName}`}
          data-testid="extension-command"
        >
          {installCommand}
        </code>
        <CopyAction
          value={clipboardCommand}
          idleLabel={`Copy install command for ${extension.displayName}`}
          copiedLabel={`Copied install command for ${extension.displayName}`}
          className={styleCSS.copyCommand}
          analyticsData={contentForAdobeAnalytics}
        >
          <Copy16Regular aria-hidden="true" />
        </CopyAction>
      </div>
    </Card>
  );
}

export default React.memo(ShowcaseExtensionCard);

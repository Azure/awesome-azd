/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styleCSS from "./styles.module.css";
import { type Extension } from "../../../data/extensionTypes";
import { Tags } from "../../../data/tags";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  Card,
  CardHeader,
  CardFooter,
  Button,
  CardPreview,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Badge,
  Link as FluentUILink,
} from "@fluentui/react-components";
import { Globe16Regular } from "@fluentui/react-icons";

const CAPABILITY_LABELS: Record<string, { label: string; color: "informative" | "success" | "warning" | "important" | "brand" }> = {
  "custom-commands": { label: "Commands", color: "brand" },
  "lifecycle-events": { label: "Lifecycle", color: "success" },
  "mcp-server": { label: "MCP", color: "important" },
  "service-target-provider": { label: "Service Target", color: "warning" },
  "framework-service-provider": { label: "Framework", color: "warning" },
  "provisioning-provider": { label: "Provisioning", color: "warning" },
  "validation-provider": { label: "Validation", color: "success" },
  "metadata": { label: "Metadata", color: "informative" },
};

function ShowcaseExtensionCard({ extension }: { extension: Extension }): JSX.Element {
  const communityLogo = useBaseUrl("/img/Community.svg");
  const msftLogo = useBaseUrl("/img/Microsoft.svg");
  const copyIcon = useBaseUrl("/img/Copy.svg");

  const isMsft = extension.tags.includes("msft");
  const headerLogo = isMsft ? msftLogo : communityLogo;
  const headerText = isMsft ? "Microsoft Authored" : "Community Authored";

  const installCommand = `azd ext install ${extension.id}`;
  // For 3P (community) extensions, the user must first register the
  // extension's registry as a source before `azd ext install` can resolve
  // the id. Source name uses the id's first segment (e.g. `jongio` for
  // `jongio.azd.app`). The visible Input still shows the single install
  // line so the footer stays compact, but the copy button pastes both
  // lines so the user can run them as a single sequence in their terminal.
  const sourceName = extension.id.split(".")[0];
  const clipboardCommand =
    !isMsft && extension.registryUrl
      ? `azd ext source add -t url -n ${sourceName} -l ${extension.registryUrl}\n${installCommand}`
      : installCommand;

  const contentForAdobeAnalytics = JSON.stringify({
    id: extension.displayName,
    cN: "Copy Button (azd ext install)",
  });

  return (
    <Card key={extension.id} className={styleCSS.card}>
      <CardHeader
        header={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: "1",
            }}
          >
            <img
              src={headerLogo}
              width={16}
              height={16}
              alt={headerText}
              className={styleCSS.headerLogo}
            />
            <div className={styleCSS.headerText}>{headerText}</div>
          </div>
        }
      />
      <CardPreview className={styleCSS.cardBreakLine} />
      <div className={styleCSS.cardBody}>
        <FluentUILink
          className={styleCSS.cardTitle}
          href={extension.source}
          target="_blank"
          rel="noopener noreferrer"
        >
          {extension.displayName}
        </FluentUILink>
        <div
          style={{
            verticalAlign: "middle",
            display: "flex",
            paddingTop: "2px",
            alignItems: "center",
            columnGap: "3px",
            overflow: "hidden",
          }}
        >
          <div className={styleCSS.cardTextBy}>by</div>
          <FluentUILink
            className={styleCSS.authorLink}
            href={extension.authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "12px", flexShrink: 0 }}
          >
            {extension.author}
          </FluentUILink>
          {extension.website && (
            <FluentUILink
              href={extension.website}
              target="_blank"
              rel="noopener noreferrer"
              className={styleCSS.cardMetaLink}
              title="Documentation website"
              style={{ fontSize: "12px", flexShrink: 0, marginLeft: "auto" }}
            >
              <Globe16Regular style={{ verticalAlign: "middle", marginRight: "2px" }} />
              <span>Website</span>
            </FluentUILink>
          )}
        </div>
        <div className={styleCSS.cardDescription}>{extension.description}</div>
        <div className={styleCSS.cardTagContainer}>
          <div className={styleCSS.cardTagsWrapper}>
            {extension.capabilities.map((cap) => {
              const capInfo = CAPABILITY_LABELS[cap] || { label: cap, color: "informative" as const };
              return (
                <Badge
                  key={`cap-${cap}`}
                  appearance="outline"
                  size="medium"
                  color={capInfo.color}
                  style={{
                    alignContent: "center",
                    fontSize: "10px",
                    width: "auto",
                  }}
                >
                  {capInfo.label}
                </Badge>
              );
            })}
            {extension.tags
              .filter(
                (tag) =>
                  tag !== "msft" &&
                  tag !== "community" &&
                  tag !== "new" &&
                  tag !== "popular" &&
                  tag !== "aicollection" &&
                  Tags[tag] !== undefined,
              )
              .map((tag) => {
                const tagInfo = Tags[tag];
                return (
                  <Badge
                    key={`tag-${tag}`}
                    appearance="outline"
                    size="medium"
                    color="informative"
                    title={tagInfo.description}
                    style={{
                      alignContent: "center",
                      fontSize: "10px",
                      width: "auto",
                    }}
                  >
                    {tagInfo.label}
                  </Badge>
                );
              })}
          </div>
        </div>
      </div>
      <CardPreview className={styleCSS.cardBreakLine} />
      <CardFooter>
        <code
          id={"command_" + extension.id}
          className={styleCSS.command}
          aria-label={`Install command for ${extension.displayName}`}
          data-testid="extension-command"
        >
          {installCommand}
        </code>
        <Popover trapFocus withArrow size="small">
          <PopoverTrigger disableButtonEnhancement>
            <Button
              size="small"
              className={styleCSS.copyIconButton}
              aria-label={`Copy install command for ${extension.displayName}`}
              onClick={() => {
                navigator.clipboard.writeText(clipboardCommand);
              }}
              data-m={contentForAdobeAnalytics}
            >
              <img src={copyIcon} width={20} height={20} alt="Copy" />
            </Button>
          </PopoverTrigger>
          <PopoverSurface style={{ padding: "5px", fontSize: "12px" }}>
            <div role="status" aria-live="polite">Copied!</div>
          </PopoverSurface>
        </Popover>
      </CardFooter>
    </Card>
  );
}

export default React.memo(ShowcaseExtensionCard);

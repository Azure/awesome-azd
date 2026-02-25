/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styleCSS from "./styles.module.css";
import { type Extension } from "../../../data/extensionTypes";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  Card,
  CardHeader,
  CardFooter,
  Button,
  CardPreview,
  Input,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Badge,
  Link as FluentUILink,
} from "@fluentui/react-components";
import { Open16Regular, Globe16Regular } from "@fluentui/react-icons";

const CAPABILITY_LABELS: Record<string, { label: string; color: "informative" | "success" | "warning" | "important" | "brand" }> = {
  "custom-commands": { label: "Commands", color: "brand" },
  "lifecycle-events": { label: "Lifecycle", color: "success" },
  "mcp-server": { label: "MCP", color: "important" },
  "service-target-provider": { label: "Service Target", color: "warning" },
  "framework-service-provider": { label: "Framework", color: "warning" },
  "metadata": { label: "Metadata", color: "informative" },
};

function ShowcaseExtensionCard({ extension }: { extension: Extension }): JSX.Element {
  const star = useBaseUrl("/img/Sparkle.svg");
  const communityLogo = useBaseUrl("/img/Community.svg");
  const msftLogo = useBaseUrl("/img/Microsoft.svg");
  const copyIcon = useBaseUrl("/img/Copy.svg");

  const isMsft = extension.tags.includes("msft");
  const headerLogo = isMsft ? msftLogo : communityLogo;
  const headerText = isMsft ? "Microsoft Extension" : "Community Extension";

  const contentForAdobeAnalytics = JSON.stringify({
    id: extension.displayName,
    cN: "Copy Button (azd extension install)",
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
            {extension.tags.includes("new") ? (
              <>
                <img
                  src={star}
                  alt=""
                  aria-hidden="true"
                  width={16}
                  height={16}
                  style={{ paddingLeft: "10px" }}
                />
                <div className={styleCSS.newBadge}>
                  New
                </div>
              </>
            ) : null}
          </div>
        }
      />
      <CardPreview className={styleCSS.cardBreakLine} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          maxHeight: "inherit",
        }}
        className={styleCSS.cardBody}
      >
        <FluentUILink
          className={styleCSS.cardTitle}
          href={extension.website || extension.source}
          target="_blank"
          rel="noopener noreferrer"
        >
          {extension.displayName}
        </FluentUILink>
        <div style={{ display: "flex", gap: "8px", paddingTop: "4px" }}>
          {extension.website && (
            <FluentUILink
              href={extension.website}
              target="_blank"
              rel="noopener noreferrer"
              className={styleCSS.cardMetaLink}
              title="Documentation website"
            >
              <Globe16Regular style={{ verticalAlign: "middle", marginRight: "2px" }} />
              <span>Website</span>
            </FluentUILink>
          )}
          <FluentUILink
            href={extension.source}
            target="_blank"
            rel="noopener noreferrer"
            className={styleCSS.cardMetaLink}
            title="Source repository"
          >
            <Open16Regular style={{ verticalAlign: "middle", marginRight: "2px" }} />
            <span>Source</span>
          </FluentUILink>
        </div>
        <div
          style={{
            verticalAlign: "middle",
            display: "flex",
            paddingTop: "2px",
            alignItems: "center",
            columnGap: "3px",
          }}
        >
          <div className={styleCSS.cardTextBy}>by</div>
          <FluentUILink
            href={extension.authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styleCSS.authorLink}
          >
            {extension.author}
          </FluentUILink>
          <div className={styleCSS.versionBadge}>v{extension.latestVersion}</div>
        </div>
        <div className={styleCSS.cardDescription}>{extension.description}</div>
        <div
          style={{
            paddingTop: "10px",
            position: "absolute",
            bottom: "0px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              overflow: "hidden",
              gap: "4px",
              flexFlow: "wrap",
            }}
          >
            {extension.capabilities.map((cap) => {
              const capInfo = CAPABILITY_LABELS[cap] || { label: cap, color: "informative" as const };
              return (
                <Badge
                  key={cap}
                  appearance="tint"
                  size="medium"
                  color={capInfo.color}
                  style={{ fontSize: "10px" }}
                >
                  {capInfo.label}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
      <CardPreview className={styleCSS.cardBreakLine} />
      <CardFooter>
        <Input
          id={"input_" + extension.id}
          size="small"
          spellCheck={false}
          defaultValue={extension.installCommand}
          className={styleCSS.input}
          aria-label={`Install command for ${extension.displayName}`}
        />
        <Popover trapFocus withArrow size="small">
          <PopoverTrigger disableButtonEnhancement>
            <Button
              role="button"
              size="small"
              className={styleCSS.copyIconButton}
              aria-label={`Copy install command for ${extension.displayName}`}
              onClick={() => {
                navigator.clipboard.writeText(extension.installCommand);
              }}
              data-m={contentForAdobeAnalytics}
            >
              <img src={copyIcon} height={20} alt="Copy" />
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

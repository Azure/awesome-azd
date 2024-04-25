/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styleCSS from "./styles.module.css";
import { type User } from "../../../data/tags";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  Card,
  makeStyles,
  CardHeader,
  CardFooter,
  Button,
  CardPreview,
  Link as FluentUILink,
  Input,
  Popover,
  PopoverTrigger,
  PopoverSurface,
} from "@fluentui/react-components";
import { useBoolean } from "@fluentui/react-hooks";
import {
  IRenderFunction,
  Panel,
  PanelType,
  IPanelProps,
  ThemeProvider,
  PartialTheme,
} from "@fluentui/react";
import ShowcaseMultipleAuthors from "../ShowcaseMultipleAuthors/index";
import ShowcaseCardPanel from "../ShowcaseCardPanel/index";
import ShowcaseCardTag from "../ShowcaseTag/index";
import { useColorMode } from "@docusaurus/theme-common";

const useStyles = makeStyles({
  cardTag: {
    fontSize: "10px",
    color: "#606060",
  },
  cardFooterQuickUse: {
    fontSize: "10px",
    color: "#424242",
    fontWeight: "600",
  },
});

const lightTheme: PartialTheme = {
  semanticColors: {
    bodyBackground: "white",
    bodyText: "black",
  },
};

const darkTheme: PartialTheme = {
  semanticColors: {
    bodyBackground: "#292929",
    bodyText: "white",
  },
};

function ShowcaseCard({ user }: { user: User }): JSX.Element {
  const styles = useStyles();
  const title = user.title;
  const tags = user.tags;
  const source = user.source;
  const star = useBaseUrl("/img/Sparkle.svg");
  const fire = useBaseUrl("/img/Fire.svg");
  let azdInitCommand =
    "azd init -t " + source.replace("https://github.com/", "").toLowerCase();
  if (azdInitCommand.includes("azure-samples/")) {
    azdInitCommand = azdInitCommand.replace("azure-samples/", "");
  }
  let headerLogo = useBaseUrl("/img/Community.svg");
  let headerText = "Community Authored";

  // Adobe Analytics Content
  const contentForAdobeAnalytics = `{\"id\":\"${title}\",\"cN\":\"Copy Button (azd init)\"}`;

  // Panel
  const { colorMode } = useColorMode();
  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] =
    useBoolean(false);
  if (tags.includes("msft")) {
    headerLogo = useBaseUrl("/img/Microsoft.svg");
    headerText = "Microsoft Authored";
  }
  const onRenderNavigationContent: IRenderFunction<IPanelProps> =
    React.useCallback(
      (props, defaultRender) => (
        <>
          <div
            style={{
              display: "flex",
              paddingLeft: "24px",
              alignItems: "center",
              flex: "8",
            }}
          >
            <img
              src={headerLogo}
              alt="Logo"
              height={16}
              style={{ margin: "5px 0px", fontWeight: "550" }}
            />
            <div className={styleCSS.headerTextCardPanel}>{headerText}</div>
            {tags.includes("new") ? (
              <>
                <img
                  src={star}
                  alt="Star"
                  height={16}
                  style={{ paddingLeft: "10px" }}
                />
                <div style={{ color: "#11910D", fontSize: "10px" }}>New</div>
              </>
            ) : null}

            {tags.includes("popular") ? (
              <>
                <img
                  src={fire}
                  alt="Fire"
                  height={16}
                  style={{ paddingLeft: "10px" }}
                />
                <div style={{ color: "#F7630C", fontSize: "10px" }}>
                  Popular
                </div>
              </>
            ) : null}
          </div>
          {
            // This custom navigation still renders the close button (defaultRender).
            // If you don't use defaultRender, be sure to provide some other way to close the panel.
            defaultRender!(props)
          }
        </>
      ),
      []
    );

  return (
    <Card key={title} className={styleCSS.card}>
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
              height={16}
              alt="logo"
              className={styleCSS.headerLogo}
            />
            <div className={styleCSS.headerText}>{headerText}</div>
            {tags.includes("new") ? (
              <>
                <img
                  src={star}
                  alt="Star"
                  height={16}
                  style={{ paddingLeft: "10px" }}
                />
                <div
                  style={{
                    color: "#11910D",
                    fontWeight: "600",
                    fontSize: "10px",
                  }}
                >
                  New
                </div>
              </>
            ) : null}
            {tags.includes("popular") ? (
              <>
                <img
                  src={fire}
                  alt="Fire"
                  height={16}
                  style={{ paddingLeft: "10px" }}
                />
                <div
                  style={{
                    color: "#F7630C",
                    fontWeight: "600",
                    fontSize: "10px",
                  }}
                >
                  Popular
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
      >
        <FluentUILink className={styleCSS.cardTitle} onClick={openPanel}>
          {title}
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
          <ShowcaseMultipleAuthors
            key={"author_" + title}
            user={user}
            cardPanel={false}
          />
        </div>
        <div className={styleCSS.cardDescription}>{user.description}</div>
        {/* Panel is Fluent UI 8. Must use ThemeProvider */}
        <ThemeProvider theme={colorMode != "dark" ? lightTheme : darkTheme}>
          <Panel
            headerText={title}
            isLightDismiss
            isOpen={isOpen}
            onDismiss={dismissPanel}
            closeButtonAriaLabel="Close"
            type={PanelType.medium}
            onRenderNavigationContent={onRenderNavigationContent}
          >
            <ShowcaseCardPanel user={user} />
          </Panel>
        </ThemeProvider>
        <div
          style={{
            paddingTop: "10px",
            position: "absolute",
            bottom: "0px",
            width: "100%",
          }}
        >
          <div
            className={styles.cardTag}
            style={{
              display: "flex",
              overflow: "hidden",
              gap: "4px",
              flexFlow: "wrap",
            }}
          >
            <ShowcaseCardTag key={title} tags={tags} moreTag={true} />
          </div>
        </div>
      </div>
      <CardPreview className={styleCSS.cardBreakLine} />
      <CardFooter>
        <Input
          id={"input_" + title}
          size="small"
          spellCheck={false}
          defaultValue={azdInitCommand}
          className={styleCSS.input}
          placeholder={azdInitCommand}
        />
        <Popover trapFocus withArrow size="small">
          <PopoverTrigger disableButtonEnhancement>
            <Button
              size="small"
              className={styleCSS.copyIconButton}
              onClick={() => {
                navigator.clipboard.writeText(azdInitCommand);
              }}
              data-m={contentForAdobeAnalytics}
            >
              <img src={useBaseUrl("/img/Copy.svg")} height={20} alt="Copy" />
            </Button>
          </PopoverTrigger>

          <PopoverSurface style={{ padding: "5px", fontSize: "12px" }}>
            <div>Copied!</div>
          </PopoverSurface>
        </Popover>
      </CardFooter>
    </Card>
  );
}

// function getLastUpdateDate(source) {
//   const repoPath = source.replace("https://github.com/", "");
//   const lastCommit = child.exec(
//     "gh api repos/" +
//     { repoPath } +
//     "/commits/HEAD/branches-where-head --jq .[0].commit.url"
//   );
//   const repoAndLastCommit = lastCommit.stdout
//     .toString()
//     .replace("https://api.github.com/", "");
//   const lastCommitDate = child.exec(
//     "gh api " +
//       { repoAndLastCommit } +
//       "/commits/ccb174356ca35ace51dbaa2c34592b371b671436 --jq .commit.committer.date"
//   );
//   const lastUpdateDate = lastCommitDate.stdout.toString();
//   return lastUpdateDate;
// }

export default React.memo(ShowcaseCard);

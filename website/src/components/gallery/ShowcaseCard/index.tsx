/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styleCSS from "./styles.module.css";
import { type User } from "../../../data/tags";
import useBaseUrl from "@docusaurus/useBaseUrl";
import clsx from "clsx";
import {
  Card,
  shorthands,
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
  card: {
    ...shorthands.margin("auto"),
    width: "350px",
    height: "368px",
    maxWidth: "100%",
    maxHeight: "100%",
    minWidth: "300px",
  },
  text: {
    color: "#606060",
  },
  cardTitle: {
    verticalAlign: "middle",
    fontSize: "16px",
    color: "#7160E8",
    fontWeight: "600",
  },
  cardTextBy: {
    fontSize: "12px",
    color: "#707070",
  },
  cardAuthor: {
    color: "#7160E8",
  },
  cardDescription: {
    fontSize: "14px",
    color: "#707070",
  },
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

function ShowcaseCard({ user }: { user: User }) {
  const styles = useStyles();
  const tags = user.tags;
  const source = user.source;
  const star = useBaseUrl("/img/Sparkle.svg");
  const fire = useBaseUrl("/img/Fire.svg");
  let azdInitCommand =
    "azd init -t " + source.replace("https://github.com/", "");
  let headerLogo = useBaseUrl("/img/Community.svg");
  let headerText = "COMMUNITY AUTHORED";

  // Panel
  const { colorMode } = useColorMode();
  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] =
    useBoolean(false);
  if (tags.includes("msft")) {
    headerLogo = useBaseUrl("/img/Microsoft.svg");
    headerText = "MICROSOFT AUTHORED";
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
                <div className={styles.text} style={{ color: "#11910D" }}>
                  NEW
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
                <div className={styles.text} style={{ color: "#F7630C" }}>
                  POPULAR
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
    <Card key={user.title} className={clsx(styles.card, styleCSS.card)}>
      <CardHeader
        header={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
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
                <img src={star} alt="Star" height={16} />
                <div
                  className={styles.text}
                  style={{
                    color: "#11910D",
                    fontWeight: "600",
                  }}
                >
                  NEW
                </div>
              </>
            ) : null}
            {tags.includes("popular") ? (
              <>
                <img
                  src={fire}
                  alt="Fire"
                  height={16}
                  style={{
                    paddingLeft: "6px",
                  }}
                />
                <div
                  className={styles.text}
                  style={{
                    color: "#F7630C",
                    fontWeight: "600",
                  }}
                >
                  POPULAR
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
        <FluentUILink className={styles.cardTitle} onClick={openPanel}>
          {user.title}
        </FluentUILink>
        <div
          style={{
            verticalAlign: "middle",
            display: "flex",
            paddingTop: "2px",
            alignItems: "center",
            columnGap: "3px",
          }}
        >
          <div className={styles.cardTextBy}>by</div>
          <div style={{ fontSize: "12px" }}>
            <ShowcaseMultipleAuthors
              key={"author_" + user.title}
              user={user}
              cardPanel={false}
            />
          </div>
        </div>
        <div
          className={styles.cardDescription}
          style={{
            paddingTop: "10px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: "3",
            WebkitBoxOrient: "vertical",
          }}
        >
          {user.description}
        </div>
        {/* Panel is Fluent UI 8. Must use ThemeProvider */}
        <ThemeProvider
          theme={colorMode != "dark" ? lightTheme : darkTheme}
        >
          <Panel
            headerText={user.title}
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
          style={{ paddingTop: "10px", position: "absolute", bottom: "0px" }}
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
            <ShowcaseCardTag key={user.title} tags={user.tags} moreTag={true} />
          </div>
        </div>
      </div>
      <CardPreview className={styleCSS.cardBreakLine} />
      <CardFooter>
        <Input
          id={"input_" + user.title}
          size="small"
          spellCheck={false}
          defaultValue={azdInitCommand}
          style={{
            flex: "1",
            border: "1px solid #d1d1d1",
            fontSize: "11px",
            fontFamily: "Consolas, Courier New, Courier, monospace",
            WebkitTextFillColor: "#717171",
          }}
        />
        <Popover withArrow size="small">
          <PopoverTrigger disableButtonEnhancement>
            <Button
              size="small"
              className={styleCSS.copyButton}
              onClick={() => {
                navigator.clipboard.writeText(azdInitCommand);
              }}
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

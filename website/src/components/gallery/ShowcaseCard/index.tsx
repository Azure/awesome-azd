/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import styles from "./styles.module.css";
import { Tag, Tags, type User, type TagType } from "../../../data/tags";
import { TagList } from "../../../data/users";
import { sortBy } from "@site/src/utils/jsUtils";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  Card,
  shorthands,
  makeStyles,
  CardHeader,
  CardFooter,
  Button,
  CardPreview,
  Link as FluentUILink,
  ToggleButton,
} from "@fluentui/react-components";
import { useBoolean } from "@fluentui/react-hooks";
import {
  initializeIcons,
  IRenderFunction,
  IStyleSet,
  Label,
  ILabelStyles,
  Pivot,
  PivotItem,
  DefaultButton,
  Panel,
  PanelType,
  IPanelProps,
  FontWeights,
  Popup,
  IconButton,
} from "@fluentui/react";
import { title } from "process";

const TagComp = React.forwardRef<HTMLLIElement, Tag>(
  ({ label, description }) => (
    <Button
      appearance="outline"
      size="small"
      title={description}
      style={{
        height: "20px",
        alignContent: "center",
        backgroundColor: "#F0F0F0",
        padding: "0 5px",
        marginTop: "3px",
        fontSize: "10px",
        fontFamily: '"Segoe UI-Semibold", Helvetica',
        color: "#606060",
        minWidth: "0px",
      }}
    >
      {label}
    </Button>
  )
);

const TagCompFluentUI8 = React.forwardRef<HTMLLIElement, Tag>(({ label }) => (
  <DefaultButton
    sizes="smallest"
    text={label}
    style={{
      height: "20px",
      alignContent: "center",
      backgroundColor: "#F0F0F0",
      borderColor: "#F0F0F0",
      fontSize: "10px",
      marginTop: "3px",
      fontFamily: '"Segoe UI-Semibold", Helvetica',
      color: "#606060",
      padding: "0px",
      minWidth: "0px",
    }}
  />
));

function ShowcaseCardTag({
  tags,
  moreTag,
}: {
  tags: TagType[];
  moreTag: boolean;
}) {
  const tagObjects = tags.map((tag) => ({ tag, ...Tags[tag] }));

  // Keep same order for all tags
  const tagObjectsSorted = sortBy(tagObjects, (tagObject) =>
    TagList.indexOf(tagObject.tag)
  );

  const length = tagObjectsSorted.length;
  const rest = length - 7;

  if (moreTag) {
    if (length > 7) {
      return (
        <>
          {tagObjectsSorted.slice(0, 7).map((tagObject, index) => {
            const id = `showcase_card_tag_${tagObject.tag}`;
            if (
              tagObject.clientHeight < tagObject.scrollHeight ||
              tagObject.clientWidth < tagObject.scrollWidth
            ) {
              return <div>hi</div>;
            }
            return (
              <div>
                <TagComp key={index} id={id} {...tagObject} />
              </div>
            );
          })}
          <Button
            appearance="outline"
            size="small"
            style={{
              height: "20px",
              alignContent: "center",
              marginTop: "3px",
              backgroundColor: "#F0F0F0",
              paddingTop: "3px",
              fontFamily: '"Segoe UI-Semibold", Helvetica',
              color: "#606060",
              fontSize: "10px",
              minWidth: "0px",
            }}
          >
            + {rest} more
          </Button>
        </>
      );
    } else {
      return (
        <>
          {tagObjectsSorted.map((tagObject, index) => {
            const id = `showcase_card_tag_${tagObject.tag}`;

            return (
              <div>
                <TagComp key={index} id={id} {...tagObject} />
              </div>
            );
          })}
        </>
      );
    }
  } else {
    return (
      <>
        {tagObjectsSorted.map((tagObject, index) => {
          const id = `showcase_card_tag_${tagObject.tag}`;

          return <TagCompFluentUI8 key={index} id={id} {...tagObject} />;
        })}
      </>
    );
  }
}

function ShowcaseMultipleWebsites(
  authorName: string,
  websiteLink: string,
  length: number,
  i: number
) {
  const styles = useStyles();
  if (i != length - 1) {
    return (
      <FluentUILink
        className={styles.cardAuthor}
        href={websiteLink}
        target="_blank"
      >
        {authorName},{" "}
      </FluentUILink>
    );
  } else {
    return (
      <FluentUILink
        className={styles.cardAuthor}
        href={websiteLink}
        target="_blank"
      >
        {authorName}
      </FluentUILink>
    );
  }
}

function ShowcaseMultipleAuthors({ user }: { user: User }) {
  const authors = user.author;
  const websites = user.website;
  const styles = useStyles();
  let i = 0;

  if (authors.includes(", ")) {
    var multiWebsites = websites.split(", ");
    var multiAuthors = authors.split(", ");

    return (
      <div
        style={{
          display: "-webkit-box",
          overflow: "hidden",
          WebkitLineClamp: "1",
          WebkitBoxOrient: "vertical",
        }}
      >
        {multiWebsites.map((value, index) => {
          return ShowcaseMultipleWebsites(
            multiAuthors[index],
            multiWebsites[index],
            multiWebsites.length,
            i++
          );
        })}
      </div>
    );
  }

  return (
    <FluentUILink className={styles.cardAuthor} href={websites} target="_blank">
      {authors}
    </FluentUILink>
  );
}

const useStyles = makeStyles({
  card: {
    ...shorthands.margin("auto"),
    width: "350px",
    height: "368px",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  text: {
    color: "#606060",
    fontSize: "10px",
    fontFamily: '"Segoe UI-Semibold", Helvetica',
  },
  cardTitle: {
    verticalAlign: "middle",
    fontSize: "16px",
    fontFamily: '"Segoe UI-Bold", Helvetica',
    color: "#6656d1",
  },
  cardTextBy: {
    fontSize: "12px",
    fontFamily: '"Segoe UI-Regular", Helvetica',
    color: "#707070",
  },
  cardAuthor: {
    fontFamily: '"Segoe UI-Regular", Helvetica',
    color: "#6656d1",
  },
  cardDescription: {
    fontSize: "14px",
    fontFamily: '"Segoe UI-Regular", Helvetica',
    color: "#707070",
  },
  cardTag: {
    fontSize: "10px",
    fontFamily: '"Segoe UI-Semibold", Helvetica',
    color: "#606060",
  },
  cardFooterQuickUse: {
    fontSize: "10px",
    fontFamily: '"Segoe UI-Semibold", Helvetica',
    color: "#424242",
  },
  cardFooterAzdCommand: {
    fontSize: "11px",
    fontFamily: '"Consolas-Regular", Helvetica',
    color: "#606060",
  },
});

function ShowcaseCard({ user }: { user: User }) {
  const styles = useStyles();
  const author = user.author;
  const source = user.source;
  const star = useBaseUrl("/img/sparkle.svg");
  const fire = useBaseUrl("/img/fire.svg");
  let azdInitCommand =
    "azd init -t " + source.replace("https://github.com/", "");
  let headerLogo = useBaseUrl("/img/community.svg");
  let headerText = "COMMUNITY AUTHORED";

  // Panel
  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] =
    useBoolean(false);
  initializeIcons();
  if (author.includes("Azure Dev") || author.includes("Azure Content Team")) {
    headerLogo = useBaseUrl("/img/microsoft.svg");
    headerText = "MICROSOFT AUTHORED";
  }
  const searchboxStyles = {
    root: { margin: "5px", height: "auto", width: "100%" },
  };
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
            <img src={headerLogo} height={16} style={{ margin: "5px 0px" }} />
            <div
              className={styles.text}
              style={{ color: "#606060", paddingLeft: "3px" }}
            >
              {headerText}
            </div>
            <img
              src={star}
              alt="Star"
              height={16}
              style={{ paddingLeft: "10px" }}
            />
            <div className={styles.text} style={{ color: "#11910D" }}>
              NEW
            </div>
            <img
              src={fire}
              alt="Fire"
              height={16}
              style={{ paddingLeft: "10px" }}
            />
            <div className={styles.text} style={{ color: "#F7630C" }}>
              POPULAR
            </div>
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
    <Card
      key={user.title}
      className={styles.card}
      style={{
        background: "linear-gradient(#FAFAFA 0 0)bottom/100% 45px no-repeat",
      }}
    >
      <CardHeader
        header={
          <div>
            <img
              src={headerLogo}
              height={16}
              style={{ float: "left", margin: "5px 0px" }}
            />
            <div
              className={styles.text}
              style={{ float: "left", color: "#606060", margin: "5px 3px" }}
            >
              {headerText}
            </div>
            <div
              className={styles.text}
              style={{ float: "right", color: "#F7630C", margin: "5px 3px" }}
            >
              POPULAR
            </div>
            <img
              src={fire}
              alt="Fire"
              height={16}
              style={{ float: "right", margin: "5px 0px" }}
            />
            <div
              className={styles.text}
              style={{ float: "right", color: "#11910D", margin: "5px 3px" }}
            >
              NEW
            </div>
            <img
              src={star}
              alt="Star"
              height={16}
              style={{ float: "right", margin: "5px 0px" }}
            />
          </div>
        }
      />
      <CardPreview style={{ borderTop: "solid #F0F0F0" }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          maxHeight: "inherit",
        }}
      >
        <FluentUILink
          href={source}
          className={styles.cardTitle}
          target="_blank"
        >
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
            <ShowcaseMultipleAuthors user={user} />
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
          onClick={openPanel}
        >
          {user.description}
        </div>
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
        <div
          style={{ paddingTop: "10px", position: "absolute", bottom: "0px" }}
        >
          <div
            className={styles.cardTag}
            style={{
              display: "flex",
              overflow: "hidden",
              maxHeight: "73px",
              columnGap: "5px",
              flexFlow: "wrap",
            }}
            onClick={openPanel}
          >
            <ShowcaseCardTag tags={user.tags} moreTag={true} />
          </div>
        </div>
      </div>
      <CardPreview
        style={{ borderTop: "solid #F0F0F0", backgroundColor: "#FAFAFA" }}
      ></CardPreview>
      <CardFooter style={{ alignItems: "center", width: "100%" }}>
        <div
          className={styles.cardFooterQuickUse}
          style={{ whiteSpace: "nowrap" }}
        >
          Quick Use
        </div>
        <Button
          style={{ padding: "0px" }}
          onClick={() => {
            navigator.clipboard.writeText(azdInitCommand);
          }}
        >
          <div
            className={styles.cardFooterAzdCommand}
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              paddingLeft: "3px",
            }}
          >
            {azdInitCommand}
          </div>
        </Button>
        <Button
          style={{ minWidth: "20px", padding: "0px", minHeight: "20px" }}
          onClick={() => {
            navigator.clipboard.writeText(azdInitCommand);
          }}
        >
          <img src={useBaseUrl("/img/copy.svg")} height={20} alt="Copy" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function closeCard(parentDiv) {
  let parent = document.getElementById(parentDiv);
  parent.style.display = "none";
  localStorage.setItem("contributionCardDisplay", parent.style.display);
}

export function ShowcaseContributionCard(): React.ReactElement {
  const styles = useStyles();
  if (localStorage.getItem("contributionCardDisplay")) {
    return <></>;
  }
  return (
    <Card className={styles.card} id="contributionCard">
      <ToggleButton
        onClick={() => closeCard("contributionCard")}
        size="small"
        appearance="transparent"
        style={{
          padding: "0px",
          margin: "0px",
          alignSelf: "flex-end",
          minWidth: "20px",
          height: "0px",
        }}
        icon={
          <img src={useBaseUrl("/img/close.svg")} height={20} alt="Close" />
        }
      ></ToggleButton>
      <img
        src={useBaseUrl("/img/contributionCard.svg")}
        alt="contributionCard"
        style={{ maxHeight: "110px", alignSelf: "flex-start" }}
      />
      <div
        style={{
          color: "#242424",
          fontSize: "24px",
          fontFamily: '"Segoe UI-Semibold", Helvetica',
        }}
      >
        See your template here!
      </div>
      <div
        style={{
          color: "#242424",
          fontSize: "14px",
          fontFamily: '"Segoe UI-Regular", Helvetica',
        }}
      >
        <p
          style={{
            margin: "0px",
          }}
        >
          awesome-azd is looking for new templates!{" "}
        </p>
        <p
          style={{
            margin: "0px",
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>
      <div style={{ display: "flex" }}>
        <Button
          size="small"
          style={{
            flex: 1,
            color: "#ffffff",
            fontFamily: '"Segoe UI-Semibold", Helvetica',
            fontSize: "14px",
            backgroundColor: "#6656d1",
            height: "32px",
            whiteSpace: "nowrap",
          }}
        >
          Submit a template
        </Button>
        <Button
          size="small"
          appearance="transparent"
          style={{
            flex: 1,
            color: "#6656d1",
            fontFamily: '"Segoe UI-Semibold", Helvetica',
            fontSize: "14px",
            height: "32px",
            whiteSpace: "nowrap",
          }}
        >
          Request a template
        </Button>
      </div>
    </Card>
  );
}

function ShowcaseCardPanel({ user }: { user: User }) {
  const [isPopupVisible, { toggle: toggleIsPopupVisible }] = useBoolean(false);
  let azdInitCommand = "azd init -t " + user.source.replace("https://github.com/", "");
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", columnGap: "5px" }}>
        <div className={styles.cardTextBy}>by</div>
        <div style={{ fontSize: "14px" }}>
          <ShowcaseMultipleAuthors user={user} />
        </div>
        <FluentUILink
          href={user.website}
          target="_blank"
          style={{ color: "#6656d1" }}
        >
          <img
            src={useBaseUrl("/img/redirect.svg")}
            alt="Redirect"
            height={13}
          />
        </FluentUILink>
        <div>•</div>
        <div>Last Update: </div>
        <div>•</div>
        <FluentUILink
          href={user.source}
          target="_blank"
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: "5px",
            color: "#6656d1",
          }}
        >
          View in GitHub
          <img
            src={useBaseUrl("/img/redirect.svg")}
            alt="Redirect"
            height={13}
          />
        </FluentUILink>
      </div>
      <div
        className={styles.cardTag}
        style={{
          display: "flex",
          overflow: "hidden",
          maxHeight: "73px",
          columnGap: "5px",
          flexFlow: "wrap",
        }}
      >
        <ShowcaseCardTag tags={user.tags} moreTag={false} />
      </div>
      <Pivot aria-label="Template Detials and Legal">
        <PivotItem
          style={{
            color: "#242424",
            fontFamily: '"Segoe UI-Semibold", Helvetica;',
            fontSize: "14px",
            fontWeight: "400px",
          }}
          headerText="Template Details"
        >
          <Label>
            <div>{user.description}</div>
            <div>
              <div>Quick Use</div>
              <DefaultButton onClick={toggleIsPopupVisible} text="˅" />
              {isPopupVisible && (
                <Popup>
                  <div>
                    If you already have the Azure Dev CLI installed on your
                    machine, using this template is as simple as running this
                    command in a new directory.
                  </div>
                  <div>Terminal Command</div>
                  {/* <IconButton
                    iconProps={<img src={useBaseUrl("/img/close.svg")} height={20} alt="Close" />}>
                  </IconButton> */}
                  <div>{azdInitCommand}</div>
                </Popup>
              )}
            </div>
          </Label>
        </PivotItem>
        <PivotItem headerText="Legal">
          <Label>Pivot #2</Label>
        </PivotItem>
      </Pivot>
    </div>
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

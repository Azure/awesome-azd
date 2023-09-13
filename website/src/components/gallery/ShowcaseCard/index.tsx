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
  Label,
  Pivot,
  PivotItem,
  DefaultButton,
  Panel,
  PanelType,
  IPanelProps,
  FontWeights,
  Popup,
  Separator,
  IPivotStyles
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
        border: "1px solid #E0E0E0",
        padding: "0 5px",
        marginTop: "3px",
        fontSize: "10px",
        fontFamily: "Segoe UI",
        color: "#616161",
        minWidth: "0px",
      }}
    >
      {label}
    </Button>
  )
);

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
  const rest = length - 8;

  if (moreTag) {
    if (length > 8) {
      return (
        <>
          {tagObjectsSorted.slice(0, 8).map((tagObject, index) => {
            const id = `showcase_card_tag_${tagObject.tag}`;
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
              backgroundColor: "#F0F0F0",
              border: "1px solid #E0E0E0",
              padding: "0 5px",
              marginTop: "3px",
              fontSize: "10px",
              fontFamily: "Segoe UI",
              color: "#616161",
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

          return (
            <div>
              <TagComp key={index} id={id} {...tagObject} />
            </div>
          );
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
    minWidth:'300px',
  },
  text: {
    color: "#606060",
    fontSize: "10px",
    fontFamily: "Segoe UI",
  },
  cardTitle: {
    verticalAlign: "middle",
    fontSize: "16px",
    fontFamily: "Segoe UI",
    color: "#6656d1",
    fontWeight: "600",
  },
  cardTextBy: {
    fontSize: "12px",
    fontFamily: "Segoe UI",
    color: "#707070",
  },
  cardAuthor: {
    fontFamily: "Segoe UI",
    color: "#6656d1",
  },
  cardDescription: {
    fontSize: "14px",
    fontFamily: "Segoe UI",
    color: "#707070",
  },
  cardTag: {
    fontSize: "10px",
    fontFamily: "Segoe UI",
    color: "#606060",
  },
  cardFooterQuickUse: {
    fontSize: "10px",
    fontFamily: "Segoe UI",
    color: "#424242",
    fontWeight: "600",
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
            <img src={headerLogo} height={16} style={{ margin: "5px 0px",fontWeight:'550'}} />
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
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img src={headerLogo} height={16} />
            <div
              className={styles.text}
              style={{
                fontWeight: "600",
                flex: "1",
                paddingLeft: "3px",
              }}
            >
              {headerText}
            </div>
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
          style={{ padding: "0px", fontWeight: "400" }}
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
  // access localStorage until window is defined
  if (typeof window !== "undefined") {
    localStorage.setItem("contributionCardDisplay", parent.style.display);
  }
}

export function ShowcaseContributionCard(): React.ReactElement {
  const styles = useStyles();
  // access localStorage until window is defined
  if (
    typeof window !== "undefined" &&
    localStorage.getItem("contributionCardDisplay")
  ) {
    return null;
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
          fontFamily: "Segoe UI",
            fontWeight: "550",
            height:'0px',
        }}
      >
        See your template here!
      </div>
      <div
        style={{
          color: "#242424",
          fontSize: "14px",
          fontFamily: "Segoe UI",
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
      <div style={{ display: "flex", paddingTop: "10px" }}>
        <Button
          size="small"
          style={{
            flex: 1,
            color: "#ffffff",
            fontFamily: "Segoe UI",
            fontSize: "14px",
            backgroundColor: "#6656d1",
            height: "32px",
            whiteSpace: "nowrap",
              fontWeight: "550",
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
            fontFamily: "Segoe UI",
            fontSize: "14px",
            height: "32px",
            whiteSpace: "nowrap",
              fontWeight: "550",
              paddingLeft:'10px'
          }}
        >
          Request a template
        </Button>
      </div>
    </Card>
  );
}

function ShowcaseCardPanel({ user }: { user: User }) {
  let [
    isPopupVisibleTemplateDetails,
    { toggle: toggleIsPopupVisibleTemplateDetails },
  ] = useBoolean(true);

  const [
    IsPopupVisibleAzureCalculator,
    { toggle: toggleIsPopupVisibleAzureCalculator },
  ] = useBoolean(true);

  const templateURL = user.source.replace("https://github.com/", "");
  const azdInitCommand = "azd init -t " + templateURL;
  const copySVG = useBaseUrl("/img/copy.svg");
  const chevronSVG = useBaseUrl("/img/leftChevron.svg");
  const pivotStyles: IPivotStyles = {
    linkIsSelected: [
      {
        selectors: {
          ":before": {
            backgroundColor: "#6656D1",
          },
        },
      },
    ],
    root: "",
    link: "",
    linkContent: "",
    text: "",
    count: "",
    icon: "",
    linkInMenu: "",
    overflowMenuButton: "",
  };
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          columnGap: "5px",
          padding: "10px 0",
        }}
      >
        <div className={styles.cardTextBy}>by</div>
        <div style={{ fontSize: "14px",fontWeight:'400' }}>
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
          columnGap: "5px",
          flexFlow: "wrap",
          padding:'5px 0'
        }}
      >
        <ShowcaseCardTag tags={user.tags} moreTag={false} />
      </div>
      <Pivot aria-label="Template Detials and Legal" styles={pivotStyles} style={{paddingTop:'20px'}}>
        <PivotItem
          style={{
            color: "#242424",
            fontFamily: "Segoe UI",
            fontSize: "14px",
          }}
          headerText="Template Details"
        >
          <Label>
            <div
              style={{
                color: "#242424",
                fontFamily: "Segoe UI",
                fontSize: "14px",
                fontWeight: "400",
              }}
            >
              {user.description}
            </div>
            <div
              style={{
                display: "flex",
                paddingTop: "30px",
                borderBottom: "1px solid #D1D1D1",
              }}
            >
              <div
                style={{
                  color: "#242424",
                  fontFamily: "Segoe UI",
                  fontSize: "14px",
                  flex: "1",
                }}
              >
                Quick Use
              </div>
              <DefaultButton
                style={{
                  backgroundColor: "transparent",
                  borderColor: "transparent",
                  minWidth: "0px",
                  padding: "0px",
                  height: "20px",
                }}
              >
                <img
                  onClick={toggleIsPopupVisibleTemplateDetails}
                  src={chevronSVG}
                  height={20}
                  alt="Expand"
                />
              </DefaultButton>
            </div>
            {isPopupVisibleTemplateDetails && (
              <Popup>
                <div
                  style={{
                    color: "#242424",
                    fontFamily: "Segoe UI",
                    fontSize: "14px",
                    fontWeight: "400",
                    padding: "10px 0",
                  }}
                >
                  If you already have the Azure Dev CLI installed on your
                  machine, using this template is as simple as running this
                  command in a new directory.
                </div>
                <div
                  style={{
                    backgroundColor: "#F5F5F5",
                    border: "1px solid #E0E0E0",
                    display: "flex",
                    height: "32px",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      flex: "1",
                      color: "#242424",
                      fontFamily: "Segoe UI",
                      fontSize: "12px",
                      paddingLeft: "5px",
                    }}
                  >
                    Terminal Command
                  </div>
                  <DefaultButton
                    style={{
                      padding: "0px",
                      minHeight: "20px",
                      borderColor: "transparent",
                      backgroundColor: "transparent",
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(azdInitCommand);
                    }}
                  >
                    <img src={copySVG} height={20} alt="Copy" />
                    <div style={{ color: "#6656D1" }}>Copy</div>
                  </DefaultButton>
                </div>
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E0E0E0",
                    height: "46px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      margin: "auto",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      color: "#616161",
                      fontFamily: '"Consolas-Regular", Helvetica;',
                      fontSize: "14px",
                      fontWeight: "400",
                    }}
                  >
                    {azdInitCommand}
                  </div>
                </div>
                <div
                  style={{
                    paddingTop: "10px",
                  }}
                >
                  <Separator alignContent="start">Or</Separator>
                </div>

                <div
                  style={{
                    color: "#242424",
                    fontFamily: "Segoe UI",
                    fontSize: "14px",
                    fontWeight: "400",
                    padding: "10px 0",
                  }}
                >
                  If using the{" "}
                  <a
                    href={
                      "https://marketplace.visualstudio.com/items?itemName=ms-azuretools.azure-dev"
                    }
                    target="_blank"
                    style={{ color: "#6656D1" }}
                  >
                    azd VS Code extension
                  </a>{" "}
                  you can paste this URL in the VS Code command palette to lorem
                  ipsum dolor sit amet, consectetur adipiscing elit.
                </div>

                <div
                  style={{
                    backgroundColor: "#F5F5F5",
                    border: "1px solid #E0E0E0",
                    display: "flex",
                    height: "32px",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      flex: "1",
                      color: "#242424",
                      fontFamily: "Segoe UI",
                      paddingLeft: "5px",
                      fontSize: "12px",
                    }}
                  >
                    Terminal URL
                  </div>
                  <DefaultButton
                    style={{
                      padding: "0px",
                      minHeight: "20px",
                      borderColor: "transparent",
                      backgroundColor: "transparent",
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(templateURL);
                    }}
                  >
                    <img src={copySVG} height={20} alt="Copy" />
                    <div style={{ color: "#6656D1", fontSize: "12px" }}>
                      Copy
                    </div>
                  </DefaultButton>
                </div>
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E0E0E0",
                    height: "46px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      margin: "auto",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      color: "#616161",
                      fontFamily: '"Consolas-Regular", Helvetica;',
                      fontSize: "14px",
                      fontWeight: "400",
                    }}
                  >
                    {templateURL}
                  </div>
                </div>
              </Popup>
            )}
            <div>
              <div
                style={{
                  display: "flex",
                  paddingTop: "30px",
                  borderBottom: "1px solid #D1D1D1",
                }}
              >
                <div
                  style={{
                    color: "#242424",
                    fontFamily: "Segoe UI",
                    fontSize: "14px",
                    flex: "1",
                  }}
                >
                  Included in this template
                </div>
                <DefaultButton
                  style={{
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                    minWidth: "0px",
                    padding: "0px",
                    height: "20px",
                  }}
                >
                  <img
                    onClick={toggleIsPopupVisibleAzureCalculator}
                    src={chevronSVG}
                    height={20}
                    alt="Expand"
                  />
                </DefaultButton>
              </div>
              {IsPopupVisibleAzureCalculator && (
                <Popup>
                  <div
                    style={{
                      color: "#242424",
                      fontFamily: "Segoe UI",
                      fontSize: "14px",
                      fontWeight: "400",
                      padding: "10px 0",
                    }}
                  >
                    The services used in this template are subject to their
                    normal usage fees and charges. Learn more about the cost of
                    individual services by visiting the{" "}
                    <a
                      href="https://azure.microsoft.com/en-us/pricing/calculator/"
                      target="_blank"
                      style={{ color: "#6656D1" }}
                    >
                      Azure Pricing Calculator
                    </a>
                    .
                  </div>
                  <ShowcaseCardAzureTag tags={user.tags} />
                </Popup>
              )}
            </div>
          </Label>
        </PivotItem>
        <PivotItem
          style={{
            color: "#424242",
            fontFamily: "Segoe UI",
            fontSize: "14px",
            fontWeight: "400",
          }}
          headerText="Legal"
        >
          <Label>
            <div
              style={{
                color: "#242424",
                fontSize: "14px",
                fontFamily: "Segoe UI",
                fontWeight: "400",
              }}
            >
              <div
                style={{
                  padding: "10px 0",
                }}
              >
                Awesome AZD Templates is a place for Azure Developer CLI users
                to discover open-source Azure Developer CLI templates.
              </div>
              <div
                style={{
                  padding: "10px 0",
                }}
              >
                Please note that each template is licensed by its respective
                owner (which may or may not be Microsoft) under the agreement
                which accompanies the template. It is your responsibility to
                determine what license applies to any template you choose to
                use.
              </div>
              <div
                style={{
                  padding: "10px 0",
                }}
              >
                Microsoft is not responsible for any non-Microsoft code and does
                not screen templates included in the Awesome AZD Templates for
                security, privacy, compatibility, or performance issues.
              </div>
              <div
                style={{
                  padding: "10px 0",
                }}
              >
                The templates included in Awesome AZD Templates are not
                supported by any Microsoft support program or service. Awesome
                AZD Templates and any Microsoft-provided templates are provided
                without warranty of any kind.
              </div>
            </div>
          </Label>
        </PivotItem>
      </Pivot>
    </div>
  );
}

function ShowcaseCardAzureTag({ tags }: { tags: TagType[] }) {
  const tagObjects = tags.map((tag) => ({ tag, ...Tags[tag] }));

  // Keep same order for all tags
  const tagObjectsSorted = sortBy(tagObjects, (tagObject) =>
    TagList.indexOf(tagObject.tag)
  );

  return (
    <>
      {tagObjectsSorted.map((tagObject) => {
        const azureService = tagObject.label.includes("Azure");

        return azureService ? (
          <div
            style={{
              display: "flex",
              padding: "5px 0",
            }}
          >
            <div
              style={{
                height: "40px",
                width: "40px",
                float: "left",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#F5F5F5",
              }}
            >
              <img
                src={useBaseUrl(tagObject.azureIcon)}
                alt="Azure Service Icon"
                height={20}
              />
            </div>
            <div
              style={{ float: "right", height: "40px", paddingLeft: "20px" }}
            >
              <div
                style={{
                  color: "#242424",
                  fontSize: "14px",
                  fontFamily: "Segoe UI",
                }}
              >
                {tagObject.label}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    color: "#707070",
                    fontSize: "12px",
                    fontFamily: "Segoe UI",
                    fontWeight: "400",
                  }}
                >
                  Azure Service
                </div>
                <div
                  style={{
                    color: "#707070",
                    fontSize: "12px",
                    fontFamily: "Segoe UI",
                    fontWeight: "400",
                    padding:'0 6px'
                  }}
                >
                  •
                </div>
                <a
                  href={tagObject.url}
                  target="_blank"
                  style={{
                    color: "#6656d1",
                    fontSize: "12px",
                    fontFamily: "Segoe UI",
                    fontWeight: "400",
                  }}
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        ) : null;
      })}
    </>
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

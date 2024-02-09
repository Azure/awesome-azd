/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { Tags, type User, type TagType } from "../../../data/tags";
import { TagList } from "../../../data/users";
import { sortBy } from "@site/src/utils/jsUtils";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { Link as FluentUILink } from "@fluentui/react-components";
import { useBoolean, useId } from "@fluentui/react-hooks";
import {
  Label,
  Pivot,
  PivotItem,
  DefaultButton,
  Separator,
  IPivotStyles,
  Popup,
  Callout,
  Text,
  DirectionalHint,
} from "@fluentui/react";
import ShowcaseMultipleAuthors from "../ShowcaseMultipleAuthors/index";
import ShowcaseCardTag from "../ShowcaseTag/index";
import { useColorMode } from "@docusaurus/theme-common";

function CopyButton({ url, colorMode }: { url: string; colorMode: string }) {
  const copySVG = useBaseUrl("/img/purpleCopy.svg");
  const buttonId = useId("copyButton");
  const [isCalloutVisible, { toggle: toggleIsCalloutVisible }] =
    useBoolean(false);
  const labelId = useId("callout-label");
  const descriptionId = useId("callout-description");
  return (
    <div>
      <DefaultButton
        id={buttonId}
        className={styles.purple}
        style={{
          padding: "0px",
          minHeight: "20px",
          borderColor: "transparent",
          backgroundColor: "transparent",
        }}
        onClick={() => {
          toggleIsCalloutVisible();
          navigator.clipboard.writeText(url);
        }}
      >
        <img src={copySVG} height={20} alt="Copy" />
        <div style={{ fontSize: "12px" }}>Copy</div>
      </DefaultButton>
      {isCalloutVisible && (
        <Callout
          ariaLabelledBy={labelId}
          ariaDescribedBy={descriptionId}
          role="dialog"
          gapSpace={0}
          target={`#${buttonId}`}
          onDismiss={toggleIsCalloutVisible}
          setInitialFocus
          directionalHint={DirectionalHint.topCenter}
          styles={
            colorMode != "dark"
              ? {
                  calloutMain: {
                    padding: "3px 10px",
                  },
                }
              : {
                  beak: { background: "#292929" },
                  beakCurtain: { background: "#292929" },
                  calloutMain: {
                    background: "transparent",
                    padding: "3px 10px",
                  },
                }
          }
        >
          <Text variant="small">Copied</Text>
        </Callout>
      )}
    </div>
  );
}

export default function ShowcaseCardPanel({ user }: { user: User }) {
  const [
    isPopupVisibleTemplateDetails,
    { toggle: toggleIsPopupVisibleTemplateDetails },
  ] = useBoolean(true);

  const [
    IsPopupVisibleAzureCalculator,
    { toggle: toggleIsPopupVisibleAzureCalculator },
  ] = useBoolean(true);

  let templateURL = user.source
    .replace("https://github.com/", "")
    .toLowerCase();
  if (templateURL.includes("azure-samples/")) {
    templateURL = templateURL.replace("azure-samples/", "");
  }
  const azdInitCommand = "azd init -t " + templateURL;
  let chevronSVG = useBaseUrl("/img/leftChevron.svg");

  let pivotTextColor = "black";
  const { colorMode } = useColorMode();
  if (colorMode == "dark") {
    pivotTextColor = "white";
    chevronSVG = useBaseUrl("/img/leftChevronDark.svg");
  }
  const pivotStyles: IPivotStyles = {
    linkIsSelected: [
      {
        selectors: {
          ":before":
            colorMode != "dark"
              ? { backgroundColor: "#6656d1" }
              : { backgroundColor: "#A79CF1" },
          ":hover":
            colorMode != "dark"
              ? { backgroundColor: "#f3f2f1" }
              : { backgroundColor: "#242424" },
        },
      },
    ],
    root: "",
    link: {
      selectors: {
        ":active":
          colorMode != "dark"
            ? { backgroundColor: "#f3f2f1" }
            : { backgroundColor: "#242424" },
        ":hover":
          colorMode != "dark"
            ? { backgroundColor: "#f3f2f1" }
            : { backgroundColor: "#242424" },
      },
    },
    linkContent: "",
    text: {
      color: pivotTextColor,
    },
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
          flexWrap: "wrap",
        }}
      >
        <div className={styles.cardDescription}>by</div>
        <ShowcaseMultipleAuthors
          key={"author_" + user.title}
          user={user}
          cardPanel={true}
        />
        <div className={styles.textColor}>•</div>
        {/* <div>Last Update: </div>
        <div>•</div> */}
        <FluentUILink
          href={user.source}
          target="_blank"
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: "5px",
          }}
          className={styles.color}
        >
          View in GitHub
          {colorMode != "dark" ? (
            <img
              src={useBaseUrl("/img/redirect.svg")}
              alt="Redirect"
              height={13}
            />
          ) : (
            <img
              src={useBaseUrl("/img/redirectDark.svg")}
              alt="Redirect"
              height={13}
            />
          )}
        </FluentUILink>
      </div>
      <div
        className={styles.cardTag}
        style={{
          display: "flex",
          overflow: "hidden",
          columnGap: "5px",
          flexFlow: "wrap",
          padding: "5px 0",
        }}
      >
        <ShowcaseCardTag
          key={"tag_" + user.title}
          tags={user.tags}
          moreTag={false}
        />
      </div>
      <Pivot
        aria-label="Template Details and Legal"
        styles={pivotStyles}
        style={{ paddingTop: "20px" }}
      >
        <PivotItem
          style={{
            fontSize: "14px",
          }}
          headerText="Template Details"
        >
          <Label>
            <div
              className={styles.textColor}
              style={{
                fontSize: "14px",
                fontWeight: "400",
              }}
            >
              {user.description}
            </div>
            <div>
              <div
                className={styles.borderBottomColor}
                style={{
                  display: "flex",
                  paddingTop: "30px",
                }}
              >
                <div
                  className={styles.textColor}
                  style={{
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
                    className={styles.textColor}
                    style={{
                      fontSize: "14px",
                      fontWeight: "400",
                      padding: "10px 0",
                    }}
                  >
                    If you already have the Azure Developer CLI installed on
                    your machine, using this template is as simple as running
                    this command in a new directory.
                  </div>
                  <div
                    className={styles.terminalSquareTopColor}
                    style={{
                      display: "flex",
                      height: "32px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <div
                      className={styles.textColor}
                      style={{
                        flex: "1",
                        fontSize: "12px",
                        paddingLeft: "11px",
                      }}
                    >
                      Terminal Command
                    </div>
                    <CopyButton colorMode={colorMode} url={azdInitCommand} />
                  </div>
                  <div
                    className={styles.terminalSquareBottomColor}
                    style={{
                      height: "46px",
                      padding: "11px",
                    }}
                  >
                    <div
                      className={styles.commandColor}
                      style={{
                        margin: "auto",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        fontFamily: "Consolas, Courier New, Courier, monospace",
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
                    className={styles.textColor}
                    style={{
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
                      className={styles.color}
                    >
                      azd VS Code extension
                    </a>{" "}
                    you can paste this URL in the VS Code command terminal.
                  </div>

                  <div
                    className={styles.terminalSquareTopColor}
                    style={{
                      display: "flex",
                      height: "32px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <div
                      className={styles.textColor}
                      style={{
                        flex: "1",
                        paddingLeft: "11px",
                        fontSize: "12px",
                      }}
                    >
                      Terminal URL
                    </div>
                    <CopyButton colorMode={colorMode} url={templateURL} />
                  </div>
                  <div
                    className={styles.terminalSquareBottomColor}
                    style={{
                      height: "46px",
                      padding: "11px",
                    }}
                  >
                    <div
                      className={styles.commandColor}
                      style={{
                        margin: "auto",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        fontFamily: "Consolas, Courier New, Courier, monospace",
                        fontSize: "14px",
                        fontWeight: "400",
                      }}
                    >
                      {templateURL}
                    </div>
                  </div>
                </Popup>
              )}
            </div>
            <div>
              <div
                className={styles.borderBottomColor}
                style={{
                  display: "flex",
                  paddingTop: "30px",
                }}
              >
                <div
                  className={styles.textColor}
                  style={{
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
                    className={styles.textColor}
                    style={{
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
                      className={styles.color}
                    >
                      Azure Pricing Calculator
                    </a>
                    .
                  </div>
                  <ShowcaseCardAzureTag
                    key={"azure_tag_" + user.title}
                    tags={user.tags}
                    colorMode={colorMode}
                  />
                </Popup>
              )}
            </div>
          </Label>
        </PivotItem>
        <PivotItem
          style={{
            color: "#424242",
            fontSize: "14px",
            fontWeight: "400",
          }}
          headerText="Legal"
        >
          <Label>
            <div
              className={styles.textColor}
              style={{
                fontSize: "14px",
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

function ShowcaseCardAzureTag({
  tags,
  colorMode,
}: {
  tags: TagType[];
  colorMode: string;
}) {
  const tagObjects = tags.map((tag) => ({ tag, ...Tags[tag] }));

  // Keep same order for all tags
  const tagObjectsSorted = sortBy(tagObjects, (tagObject) =>
    TagList.indexOf(tagObject.tag)
  );

  return tagObjectsSorted.map((tagObject, index) => {
    const azureService = tagObject.label.includes("Azure");

    return azureService ? (
      <div
        key={index}
        style={{
          display: "flex",
          padding: "5px 0",
        }}
      >
        <div
          className={styles.squareColor}
          style={{
            height: "40px",
            width: "40px",
            float: "left",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={
              colorMode != "dark" || tagObject.darkModeAzureIcon == null
                ? useBaseUrl(tagObject.azureIcon)
                : useBaseUrl(tagObject.darkModeAzureIcon)
            }
            alt="Azure Service Icon"
            height={20}
          />
        </div>
        <div style={{ float: "right", height: "40px", paddingLeft: "20px" }}>
          <div
            className={styles.textColor}
            style={{
              fontSize: "14px",
            }}
          >
            {tagObject.label}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                color: "#707070",
                fontSize: "12px",
                fontWeight: "400",
              }}
            >
              Azure Service
            </div>
            <div
              style={{
                color: "#707070",
                fontSize: "12px",
                fontWeight: "400",
                padding: "0 6px",
              }}
            >
              •
            </div>
            <a
              href={tagObject.url}
              target="_blank"
              style={{
                fontSize: "12px",
                fontWeight: "400",
              }}
              className={styles.color}
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    ) : null;
  });
}

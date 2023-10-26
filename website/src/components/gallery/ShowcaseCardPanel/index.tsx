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
import { Link as FluentUILink, makeStyles } from "@fluentui/react-components";
import { useBoolean, useId } from "@fluentui/react-hooks";
import {
  Label,
  Pivot,
  PivotItem,
  DefaultButton,
  Separator,
  IPivotStyles,
  Popup,
} from "@fluentui/react";
import { TeachingBubble } from "@fluentui/react/lib/TeachingBubble";
import { DirectionalHint } from "@fluentui/react/lib/Callout";
import ShowcaseMultipleAuthors from "../ShowcaseMultipleAuthors/index";
import ShowcaseCardTag from "../ShowcaseTag/index";

const useStyles = makeStyles({
  cardDescription: {
    fontSize: "14px",
    color: "#707070",
  },
  cardTag: {
    fontSize: "10px",
    color: "#606060",
  },
});

function copyButton(templateURL: string) {
  const copySVG = useBaseUrl("/img/purpleCopy.svg");
  const buttonId = useId("copyButton");
  return (
    <div>
      <DefaultButton
        id={buttonId}
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
        <div style={{ color: "#6656D1", fontSize: "12px" }}>Copy</div>
      </DefaultButton>
    </div>
  );
}

export default function ShowcaseCardPanel({ user }: { user: User }) {
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
  const styles = useStyles();
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
        <div className={styles.cardDescription}>by</div>
        <div style={{ fontSize: "14px", fontWeight: "400" }}>
          <ShowcaseMultipleAuthors
            key={"author_" + user.title}
            user={user}
            cardPanel={true}
          />
        </div>
        <div>•</div>
        {/* <div>Last Update: </div>
        <div>•</div> */}
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
        aria-label="Template Detials and Legal"
        styles={pivotStyles}
        style={{ paddingTop: "20px" }}
      >
        <PivotItem
          style={{
            color: "#242424",
            fontSize: "14px",
          }}
          headerText="Template Details"
        >
          <Label>
            <div
              style={{
                color: "#242424",
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
                    fontSize: "14px",
                    fontWeight: "400",
                    padding: "10px 0",
                  }}
                >
                  If you already have the Azure Developer CLI installed on your
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
                      fontSize: "12px",
                      paddingLeft: "11px",
                    }}
                  >
                    Terminal Command
                  </div>
                  {copyButton(azdInitCommand)}
                </div>
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E0E0E0",
                    height: "46px",
                    padding: "11px",
                  }}
                >
                  <div
                    style={{
                      margin: "auto",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      color: "#616161",
                      fontFamily: '"Consolas-Regular", Helvetica',
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
                      paddingLeft: "11px",
                      fontSize: "12px",
                    }}
                  >
                    Terminal URL
                  </div>
                  {copyButton(templateURL)}
                </div>
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E0E0E0",
                    height: "46px",
                    padding: "11px",
                  }}
                >
                  <div
                    style={{
                      margin: "auto",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      color: "#616161",
                      fontFamily: '"Consolas-Regular", Helvetica',
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
                  <ShowcaseCardAzureTag
                    key={"azure_tag_" + user.title}
                    tags={user.tags}
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
              style={{
                color: "#242424",
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

function ShowcaseCardAzureTag({ tags }: { tags: TagType[] }) {
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
        <div style={{ float: "right", height: "40px", paddingLeft: "20px" }}>
          <div
            style={{
              color: "#242424",
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
                color: "#7160E8",
                fontSize: "12px",
                fontWeight: "400",
              }}
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    ) : null;
  });
}

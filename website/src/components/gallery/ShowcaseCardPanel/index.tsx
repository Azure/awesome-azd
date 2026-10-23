/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { type User } from "../../../data/tags";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { Link as FluentUILink } from "@fluentui/react-components";
import { useBoolean } from "@fluentui/react-hooks";
import {
  Label,
  Pivot,
  PivotItem,
  IPivotStyles,
} from "@fluentui/react";
import ShowcaseMultipleAuthors from "../ShowcaseMultipleAuthors/index";
import ShowcaseCardTag from "../ShowcaseTag/index";
import { useColorMode } from "@docusaurus/theme-common";
import { getTemplateTags } from "../../../utils/galleryTags";
import TemplateQuickUse from "./TemplateQuickUse";
import TemplateIncludedServices from "./TemplateIncludedServices";

export default function ShowcaseCardPanel({ user }: { user: User }) {
  const [
    isPopupVisibleTemplateDetails,
    { toggle: toggleIsPopupVisibleTemplateDetails },
  ] = useBoolean(true);

  const [
    IsPopupVisibleAzureCalculator,
    { toggle: toggleIsPopupVisibleAzureCalculator },
  ] = useBoolean(true);

  let pivotTextColor = "black";
  const { colorMode } = useColorMode();
  const chevronSVG = useBaseUrl(
    colorMode == "dark" ? "/img/leftChevronDark.svg" : "/img/leftChevron.svg"
  );
  if (colorMode == "dark") {
    pivotTextColor = "white";
  }
  const pivotStyles: IPivotStyles = {
    linkIsSelected: [
      {
        selectors: {
          ":before":
            colorMode != "dark"
              ? { backgroundColor: "#0369A1" }
              : { backgroundColor: "#38BDF8" },
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
  const tags = getTemplateTags(user);
  return (
    <div className={styles.panelContent}>
      <div className={styles.authorRow}>
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
          rel="noopener noreferrer"
          className={`${styles.color} ${styles.sourceLink}`}
        >
          View in GitHub
        </FluentUILink>
      </div>
      <div className={styles.cardTag}>
        <ShowcaseCardTag
          key={"tag_" + user.title}
          tags={tags}
          moreTag={false}
        />
      </div>
      <Pivot
        aria-label="Template Details and Legal"
        styles={pivotStyles}
        className={styles.detailsTabs}
      >
        <PivotItem className={styles.detailsTab} headerText="Template Details">
          <Label>
            <div className={`${styles.textColor} ${styles.bodyText}`}>
              {user.description}
            </div>
            <TemplateQuickUse
              template={user}
              colorMode={colorMode}
              expanded={isPopupVisibleTemplateDetails}
              onToggle={toggleIsPopupVisibleTemplateDetails}
              chevronIcon={chevronSVG}
            />
            <TemplateIncludedServices
              tags={tags}
              templateTitle={user.title}
              colorMode={colorMode}
              expanded={IsPopupVisibleAzureCalculator}
              onToggle={toggleIsPopupVisibleAzureCalculator}
              chevronIcon={chevronSVG}
            />
          </Label>
        </PivotItem>
        <PivotItem className={styles.legalTab} headerText="Legal">
          <Label>
            <div className={`${styles.textColor} ${styles.bodyText}`}>
              <div className={styles.legalParagraph}>
                Awesome AZD Templates is a place for Azure Developer CLI users
                to discover open-source Azure Developer CLI templates.
              </div>
              <div className={styles.legalParagraph}>
                Please note that each template is licensed by its respective
                owner (which may or may not be Microsoft) under the agreement
                which accompanies the template. It is your responsibility to
                determine what license applies to any template you choose to
                use.
              </div>
              <div className={styles.legalParagraph}>
                Microsoft is not responsible for any non-Microsoft code and does
                not screen templates included in the Awesome AZD Templates for
                security, privacy, compatibility, or performance issues.
              </div>
              <div className={styles.legalParagraph}>
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

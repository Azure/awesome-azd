/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { type Template } from "../../../data/tags";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useBoolean, useId } from "@fluentui/react-hooks";
import {
  DefaultButton,
  Separator,
  Popup,
  Callout,
  Text,
  DirectionalHint,
  type ICalloutContentStyles,
} from "@fluentui/react";
import { getOpenInVSCodeUrl } from "../../../utils/vscode";
import { useClipboard } from "../../../utils/useClipboard";
import {
  getTemplateIdentifier,
  formatAzdInitCommand,
} from "../../../utils/templateCommands";

const lightCalloutStyles: Partial<ICalloutContentStyles> = {
  calloutMain: {
    padding: "3px 10px",
  },
};

const darkCalloutStyles: Partial<ICalloutContentStyles> = {
  beak: { background: "#292929" },
  beakCurtain: { background: "#292929" },
  calloutMain: {
    background: "transparent",
    padding: "3px 10px",
  },
};

function CopyButton({ url, colorMode }: { url: string; colorMode: string }) {
  const { status: copyStatus, copy } = useClipboard();
  const copySVG = useBaseUrl("/img/purpleCopy.svg");
  const buttonId = useId("copyButton");
  const [isCalloutVisible, { setTrue: showCallout, setFalse: hideCallout }] =
    useBoolean(false);
  const isCopyFeedbackVisible = isCalloutVisible && copyStatus !== "failed";
  const labelId = useId("callout-label");
  return (
    <div>
      <DefaultButton
        id={buttonId}
        className={styles.purple}
        onClick={() => {
          if (isCopyFeedbackVisible) {
            hideCallout();
          } else {
            showCallout();
          }
          void copy(url);
        }}
      >
        <img src={copySVG} height={20} alt="Copy" />
        <div className={styles.copyLabel}>Copy</div>
      </DefaultButton>
      {isCopyFeedbackVisible && (
        <Callout
          ariaLabelledBy={labelId}
          role="dialog"
          gapSpace={0}
          target={`#${buttonId}`}
          onDismiss={hideCallout}
          setInitialFocus
          directionalHint={DirectionalHint.topCenter}
          styles={colorMode != "dark" ? lightCalloutStyles : darkCalloutStyles}
        >
          <Text id={labelId} variant="small" role="status" aria-live="polite">{copyStatus === "copied" ? "Copied" : "Copying..."}</Text>
        </Callout>
      )}
    </div>
  );
}

export default function TemplateQuickUse({
  template,
  colorMode,
  expanded,
  onToggle,
  chevronIcon,
}: {
  template: Pick<Template, "source" | "title">;
  colorMode: string;
  expanded: boolean;
  onToggle: () => void;
  chevronIcon: string;
}) {
  const templateIdentifier = getTemplateIdentifier(template.source);
  const azdInitCommand = formatAzdInitCommand(templateIdentifier);
  const openInVSCodeUrl = getOpenInVSCodeUrl(template.source);
  const vsCodeIcon = useBaseUrl("/img/vscode-white.svg");

  return (
    <div>
      <div className={styles.borderBottomColor}>
        <div
          className={`${styles.textColor} ${styles.sectionTitle}`}
        >
          Quick Use
        </div>
        <DefaultButton
          className={styles.sectionToggle}
          onClick={onToggle}
          aria-label="Toggle template details"
        >
          <img
            src={chevronIcon}
            width={20}
            height={20}
            alt=""
          />
        </DefaultButton>
      </div>
      {expanded && (
        <Popup>
          <div
            className={`${styles.textColor} ${styles.helpText}`}
          >
            If you already have the Azure Developer CLI installed on
            your machine, using this template is as simple as running
            this command in a new directory.
          </div>
          <div className={styles.terminalSquareTopColor}>
            <div
              className={`${styles.textColor} ${styles.commandTitle}`}
            >
              Terminal Command
            </div>
            <CopyButton colorMode={colorMode} url={azdInitCommand} />
          </div>
          <div className={styles.terminalSquareBottomColor}>
            <div className={styles.commandColor}>
              {azdInitCommand}
            </div>
          </div>
          <div className={styles.alternativeSeparator}>
            <Separator alignContent="start">
              Or using VS Code for the Web
            </Separator>
          </div>

          <div
            className={`${styles.textColor} ${styles.helpText}`}
          >
            Open this template in VS Code for the Web with azd and other
            Azure development tools ready to use.
          </div>
          <a
            className={styles.openInVSCodeButton}
            href={openInVSCodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-m={JSON.stringify({
              id: template.title,
              cN: "Open in VS Code",
            })}
          >
            <img
              className={styles.vsCodeIcon}
              src={vsCodeIcon}
              alt=""
              aria-hidden="true"
            />
            <span>Open in VS Code</span>
          </a>
          <div className={styles.alternativeSeparator}>
            <Separator alignContent="start">
              Or using the azd extension
            </Separator>
          </div>
          <div
            className={`${styles.textColor} ${styles.helpText}`}
          >
            In the template picker, paste this template identifier.{" "}
            <a
              href={
                "https://marketplace.visualstudio.com/items?itemName=ms-azuretools.azure-dev"
              }
              target="_blank"
              rel="noopener noreferrer"
              className={styles.color}
            >
              Learn more about the azd VS Code extension
            </a>
            .
          </div>

          <div className={styles.terminalSquareTopColor}>
            <div
              className={`${styles.textColor} ${styles.commandTitle}`}
            >
              Template Identifier
            </div>
            <CopyButton colorMode={colorMode} url={templateIdentifier} />
          </div>
          <div className={styles.terminalSquareBottomColor}>
            <div className={styles.commandColor}>
              {templateIdentifier}
            </div>
          </div>
        </Popup>
      )}
    </div>
  );
}

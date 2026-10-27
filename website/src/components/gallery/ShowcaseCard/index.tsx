/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styleCSS from "./styles.module.css";
import { type Template } from "../../../data/tags";
import { getTemplateTags } from "../../../utils/galleryTags";
import { useClipboard } from "../../../utils/useClipboard";
import {
  getTemplateIdentifier,
  formatAzdInitCommand,
} from "../../../utils/templateCommands";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  Card,
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

function ShowcaseCard({ template }: { template: Template }): React.JSX.Element {
  const { status: copyStatus, copy } = useClipboard();
  const [isCopyFeedbackOpen, setCopyFeedbackOpen] = React.useState(false);
  const title = template.title;
  const tags = getTemplateTags(template);
  const source = template.source;
  const star = useBaseUrl("/img/Sparkle.svg");
  const templateIdentifier = getTemplateIdentifier(source);
  const azdInitCommand = formatAzdInitCommand(templateIdentifier);
  const communityLogo = useBaseUrl("/img/Community.svg");
  const msftLogo = useBaseUrl("/img/Microsoft.svg");
  const isMicrosoft = tags.includes("msft");
  const isNew = tags.includes("new");
  const headerLogo = isMicrosoft ? msftLogo : communityLogo;
  const headerText = isMicrosoft ? "Microsoft Authored" : "Community Authored";

  // Adobe Analytics Content
  const contentForAdobeAnalytics = `{\"id\":\"${title}\",\"cN\":\"Copy Button (azd init)\"}`;

  // Panel
  const { colorMode } = useColorMode();
  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] =
    useBoolean(false);
  const onRenderNavigationContent: IRenderFunction<IPanelProps> =
    React.useCallback(
      (props, defaultRender) => (
        <>
          <div className={styleCSS.panelHeader}>
            <img
              src={headerLogo}
              alt="Logo"
              width={16}
              height={16}
              className={styleCSS.panelHeaderLogo}
            />
            <div className={styleCSS.headerTextCardPanel}>{headerText}</div>
            {isNew ? (
              <>
                <img
                  src={star}
                  alt="Star"
                  width={16}
                  height={16}
                />
                <div className={styleCSS.newBadge}>New</div>
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
      [headerLogo, headerText, isNew, star]
    );

  return (
    <Card key={title} className={styleCSS.card}>
      <CardHeader
        header={
          <div className={styleCSS.cardHeaderContent}>
            <img
              src={headerLogo}
              width={16}
              height={16}
              alt="logo"
              className={styleCSS.headerLogo}
            />
            <div className={styleCSS.headerText}>{headerText}</div>
            {isNew ? (
              <>
                <img
                  src={star}
                  alt="Star"
                  width={16}
                  height={16}
                />
                <div
                  className={styleCSS.newBadge}
                >
                  New
                </div>
              </>
            ) : null}
          </div>
        }
      />
      <CardPreview className={styleCSS.cardBreakLine} />
      <div className={styleCSS.cardBody}>
        <FluentUILink className={styleCSS.cardTitle} onClick={openPanel} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(); } }}>
          {title}
        </FluentUILink>
        <div className={styleCSS.cardByline}>
          <div className={styleCSS.cardTextBy}>by</div>
          <ShowcaseMultipleAuthors
            key={"author_" + title}
            template={template}
            cardPanel={false}
          />
        </div>
        <div className={styleCSS.cardDescription}>{template.description}</div>
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
            <ShowcaseCardPanel template={template} />
          </Panel>
        </ThemeProvider>
        <div className={styleCSS.cardTagContainer}>
          <div className={styleCSS.cardTagsWrapper}>
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
          readOnly
          defaultValue={azdInitCommand}
          className={styleCSS.input}
          placeholder={azdInitCommand}
          aria-label={`azd init command for ${title}`}
        />
        <Popover
          trapFocus
          withArrow
          size="small"
          open={isCopyFeedbackOpen && copyStatus !== "failed"}
          onOpenChange={(_event, data) => setCopyFeedbackOpen(data.open)}
        >
          <PopoverTrigger disableButtonEnhancement>
            <Button
              size="small"
              className={styleCSS.copyIconButton}
              aria-label={`Copy azd init command for ${title}`}
              onClick={() => {
                void copy(azdInitCommand);
              }}
              data-m={contentForAdobeAnalytics}
            >
              <img src={useBaseUrl("/img/Copy.svg")} width={20} height={20} alt="" />
            </Button>
          </PopoverTrigger>

          <PopoverSurface className={styleCSS.copyFeedback}>
            <div>{copyStatus === "copied" ? "Copied!" : "Copying..."}</div>
          </PopoverSurface>
        </Popover>
      </CardFooter>
    </Card>
  );
}

export default React.memo(ShowcaseCard);

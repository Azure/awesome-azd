/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useState } from "react";
import Head from "@docusaurus/Head";
import { useHistory, useLocation } from "@docusaurus/router";
import { useColorMode } from "@docusaurus/theme-common";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import {
  Body1,
  Body1Strong,
  Button,
  Caption1,
  Card,
  Display,
  Divider,
  FluentProvider,
  Image,
  Label,
  LargeTitle,
  Link,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Subtitle1,
  Subtitle2,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  Title3,
  webDarkTheme,
  webLightTheme,
} from "@fluentui/react-components";
import { Callout, DirectionalHint } from "@fluentui/react";
import { useBoolean, useId } from "@fluentui/react-hooks";
import ShowcaseMultipleData from "@site/src/ai/components/gallery/ShowcaseMultipleData";
import ShowcaseCardTag, {
  ShowcaseCardGreyTag,
} from "@site/src/ai/components/gallery/ShowcaseTag";
import { Tags, type Template } from "@site/src/ai/data/tags";
import { allTemplates } from "@site/src/ai/data/templates";
import {
  loadRepositoryMetrics,
  type RepositoryMetrics,
} from "@site/src/ai/utils/repositoryMetadata";
import { initializeFluentIcons } from "@site/src/utils/fluentIcons";
import styles from "./styles.module.css";

initializeFluentIcons();

const compactNumberFormatter = Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const dateFormatter = Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function CopyButton({
  command,
  index,
  image,
}: {
  command: string;
  index: string;
  image: React.ReactNode;
}) {
  const { colorMode } = useColorMode();
  const buttonId = useId("copyButton" + index);
  const [isCalloutVisible, { toggle: toggleIsCalloutVisible }] =
    useBoolean(false);
  const labelId = useId("callout-label" + index);
  const descriptionId = useId("callout-description" + index);
  return (
    <>
      <Button
        id={buttonId}
        className={styles.copyIconButton}
        onClick={() => {
          toggleIsCalloutVisible();
          void navigator.clipboard.writeText(command).catch((error) => {
            console.error("Unable to copy the azd command:", error);
          });
        }}
      >
        {image}
      </Button>
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
          <Text className={styles.colorBlack}>Copied</Text>
        </Callout>
      )}
    </>
  );
}

function findTemplateData(owner: string, repo: string) {
  const repoUrl = "https://github.com/" + owner + "/" + repo;
  return allTemplates.find((template) =>
    [template.source, ...(template.legacy_sources ?? [])].some(
      (source) => source.toLowerCase() === repoUrl.toLowerCase(),
    ),
  );
}

const GitHubInfo = ({
  githubData,
  updatedOn,
}: {
  githubData: RepositoryMetrics | null;
  updatedOn: boolean;
}) => {
  const { colorMode } = useColorMode();
  const forkIcon = useBaseUrl(
    colorMode === "dark" ? "/img/ai/forkDark.svg" : "/img/ai/fork.svg",
  );
  const starIcon = useBaseUrl(
    colorMode === "dark" ? "/img/ai/starDark.svg" : "/img/ai/star.svg",
  );

  if (!githubData) {
    return null;
  }

  return !updatedOn ? (
    <>
      {Number.isFinite(githubData.forks) ? (
        <>
          <Body1>•</Body1>
          <Image alt="fork" src={forkIcon} height={16} width={16} />
          <Body1>{compactNumberFormatter.format(githubData.forks)}</Body1>
        </>
      ) : null}
      {Number.isFinite(githubData.stars) ? (
        <>
          <Body1>•</Body1>
          <Image alt="star" src={starIcon} height={16} width={16} />
          <Body1>{compactNumberFormatter.format(githubData.stars)}</Body1>
        </>
      ) : null}
    </>
  ) : (
    <>
      {githubData.updatedOn ? (
        <Body1>{dateFormatter.format(new Date(githubData.updatedOn))}</Body1>
      ) : (
        <Body1>N/A</Body1>
      )}
    </>
  );
};

function CustomImage({
  src,
  url,
  className,
  sameDarkIcon,
  alt,
}: {
  src: string;
  url?: string | null;
  className?: string | null;
  sameDarkIcon: boolean;
  alt: string;
}) {
  const { colorMode } = useColorMode();
  const imageSource = useBaseUrl(
    colorMode !== "dark" || sameDarkIcon ? src : `${src.slice(0, -4)}Dark.svg`,
  );

  return (
    <Image
      className={className ?? undefined}
      src={imageSource}
      height={20}
      onClick={
        url
          ? () => window.open(url, "_blank", "noopener,noreferrer")
          : undefined
      }
      alt={alt}
    />
  );
}

function ArchOrScreenshotImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      className={styles.archOrScreenshotImage}
      src={useBaseUrl(src)}
      alt={alt}
    />
  );
}

const TemplateDetail = ({ template }: { template?: Template }) => {
  const [githubData, setGithubData] = useState<RepositoryMetrics | null>(null);
  const { colorMode } = useColorMode();
  const history = useHistory();
  const galleryUrl = useBaseUrl("/templates/ai");
  const backgroundImage = useBaseUrl(
    colorMode === "dark"
      ? "/img/ai/coverBackgroundTemplatePageDark.png"
      : "/img/ai/coverBackground.png",
  );
  const sourceUrl = template ? new URL(template.source) : undefined;
  const [sourceOwner = "", sourceRepo = ""] =
    sourceUrl?.pathname.split("/").filter(Boolean) ?? [];

  useEffect(() => {
    if (!template) {
      return;
    }

    let active = true;
    setGithubData(null);
    loadRepositoryMetrics(template.source)
      .then((data) => {
        if (active) {
          setGithubData(data);
        }
      })
      .catch((error) => {
        console.error("Error loading repository metadata:", error);
      });

    return () => {
      active = false;
    };
  }, [template]);

  if (!template) {
    return (
      <FluentProvider
        theme={colorMode != "dark" ? webLightTheme : webDarkTheme}
        className={styles.container}
      >
        <div className={styles.pageNotFoundContainer}>
          <Display>404 Page Not Found</Display>
          <LargeTitle>The page you are looking for does not exist.</LargeTitle>
        </div>
      </FluentProvider>
    );
  }
  let githubRepo = sourceOwner + "/" + sourceRepo;
  if (githubRepo.includes("azure-samples/")) {
    githubRepo = sourceRepo;
  }
  const azdInitCommand = "azd init -t " + githubRepo;
  const repoUrl = template.source;
  const vscodeAzureUrl = `https://vscode.dev/azure?azdTemplateUrl=${repoUrl}`;
  const tags = [
    ...template.tags,
    ...template.app_type,
    ...template.azure_service,
    ...template.models,
  ];
  const modelTags = template.models;
  const buildingBlock = template.template_type === "building_block";
  const retired = template.deleted === true;
  const retirementMessage =
    template.deletion_reason === "archived"
      ? "This template has been removed from the gallery because its source repository is archived."
      : template.deletion_reason === "deleted"
        ? "This template has been removed from the gallery because its source repository is no longer available."
        : template.deletion_reason === "renamed"
          ? "This listing has been removed from the gallery because the source repository moved."
          : "This template has been removed from the gallery.";
  // Azure Service Table
  const columns = [
    { columnKey: "resource", label: "Resource" },
    { columnKey: "description", label: "Description" },
    { columnKey: "category", label: "Category" },
  ];
  const azureIcons = template.azure_service;

  // Adobe Analytics Content
  const contentForAdobeAnalytics = `{\"id\":\"${template.title}\",\"cN\":\"Demo Video\"}`;

  // url
  const msftPricing = "https://azure.microsoft.com/pricing/calculator/";
  const azd = "https://aka.ms/azd";
  const freeAzure =
    "https://azure.microsoft.com/pricing/purchase-options/azure-account/?icid=azure-github-io";
  const buildingBlocksDocs =
    "https://learn.microsoft.com/en-us/azure/developer/ai/azure-ai-for-developers";

  return (
    <FluentProvider
      theme={colorMode != "dark" ? webLightTheme : webDarkTheme}
      className={styles.container}
    >
      <div className={styles.templateDetailPageContainer}>
        <Image
          src={backgroundImage}
          className={styles.background}
          alt="backgroundImage"
          onError={({ currentTarget }) => {
            currentTarget.style.display = "none";
          }}
        />
        <div className={styles.templateDetailAreaContainer}>
          <div className={styles.templateDetailArea}>
            <Button
              className={styles.backButton}
              onClick={() => {
                history.push(galleryUrl);
              }}
            >
              <CustomImage
                className={styles.linkSection}
                src="/img/ai/arrowLeft.svg"
                url={null}
                sameDarkIcon={false}
                alt="Back"
              />
              <Body1Strong>Back to templates</Body1Strong>
            </Button>
            {retired ? (
              <MessageBar
                intent="warning"
                className={styles.retiredTemplateBanner}
              >
                <MessageBarBody>
                  <MessageBarTitle>
                    Template removed from gallery
                  </MessageBarTitle>
                  {retirementMessage}
                  {template.replacement_source ? (
                    <>
                      {" "}
                      <Link
                        href={template.replacement_source}
                        target="_blank"
                        rel="noopener noreferrer"
                        inline
                      >
                        View the current template repository.
                      </Link>
                    </>
                  ) : null}
                </MessageBarBody>
              </MessageBar>
            ) : null}
            <div className={styles.templateDetailPageSection}>
              <div className={styles.sectionOne}>
                <div className={styles.sectionOneTop}>
                  <div className={styles.titleMetadata}>
                    <Link
                      href={template.authorUrl[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      appearance="subtle"
                    >
                      <Body1>{sourceOwner}</Body1>
                    </Link>
                    <Body1>/</Body1>
                    <Link
                      href={template.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      appearance="subtle"
                    >
                      <Body1>{sourceRepo}</Body1>
                    </Link>
                    <GitHubInfo githubData={githubData} updatedOn={false} />
                  </div>
                  <Title3 className={styles.templateTitle}>
                    {template.title}
                  </Title3>
                  {!retired ? (
                    <>
                      <div className={styles.codeSnippet}>
                        <div className={styles.codeSnippetLeft}>
                          <div>
                            <span className={styles.azdText}>azd init </span>
                            <span className={styles.azdTextBlue}>-t </span>
                            <span className={styles.azdTextGreen}>
                              {sourceRepo}
                            </span>
                          </div>
                        </div>
                        <CopyButton
                          index="1"
                          command={azdInitCommand}
                          image={
                            <CustomImage
                              className={null}
                              src="/img/ai/Copy.svg"
                              url={null}
                              sameDarkIcon={false}
                              alt="copy"
                            />
                          }
                        />
                      </div>
                      <div className={styles.learnAzdSection}>
                        <Caption1>
                          Use the Azure Developer CLI (azd) to deploy this
                          template.{" "}
                          <Link
                            href={azd}
                            target="_blank"
                            rel="noopener noreferrer"
                            inline
                          >
                            Learn more about azd
                          </Link>{" "}
                          <CustomImage
                            className={styles.inlineIcon}
                            src="/img/ai/openBlue.svg"
                            url={azd}
                            sameDarkIcon={false}
                            alt="open"
                          />
                        </Caption1>
                      </div>
                    </>
                  ) : null}
                </div>
                {!retired ? (
                  <>
                    <Divider className={styles.orDivider}>or</Divider>
                    <div className={styles.heroButtons}>
                      <Button
                        appearance="primary"
                        icon={
                          <CustomImage
                            className={null}
                            src="/img/ai/vscode.svg"
                            url={null}
                            sameDarkIcon={true}
                            alt="VS Code"
                          />
                        }
                        onClick={() => {
                          window.open(
                            vscodeAzureUrl,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }}
                      >
                        Open in VS Code for the Web
                      </Button>
                      <Button
                        icon={
                          <CustomImage
                            className={styles.inlineIcon}
                            src="/img/ai/open.svg"
                            url={null}
                            sameDarkIcon={false}
                            alt="open"
                          />
                        }
                        onClick={() => {
                          window.open(
                            template.source,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }}
                      >
                        View on GitHub
                      </Button>
                    </div>
                  </>
                ) : null}
              </div>
              <div className={styles.sectionTwo}></div>
              <div className={styles.sectionThree}>
                <div className={styles.overview}>
                  <Subtitle1>About this template</Subtitle1>
                  <Body1 className={styles.description}>
                    {template.description}
                  </Body1>
                  {template.screenshot ? (
                    <div className={styles.screenshotDiagram}>
                      <ArchOrScreenshotImage
                        src={template.screenshot}
                        alt="app screenshot"
                      />
                    </div>
                  ) : null}
                  {buildingBlock ? (
                    <div className={styles.messageBarGap}>
                      <MessageBar
                        key={"messageBar" + template.title}
                        intent="warning"
                        icon={
                          <CustomImage
                            src="/img/ai/warning.svg"
                            url={null}
                            className={null}
                            sameDarkIcon={false}
                            alt="warning"
                          />
                        }
                        className={styles.messageBar}
                      >
                        <MessageBarBody>
                          <MessageBarTitle>
                            This template is a building block.
                          </MessageBarTitle>
                          Building blocks are not a full application sample, but
                          a component or partial application, meant to be used
                          together with other building blocks.
                          <div className={styles.messageBarBody}>
                            Learn more about{" "}
                            <Link
                              href={buildingBlocksDocs}
                              target="_blank"
                              rel="noopener noreferrer"
                              inline
                            >
                              Building blocks.
                            </Link>{" "}
                            <CustomImage
                              className={null}
                              src={"/img/ai/openBlue.svg"}
                              url={freeAzure}
                              sameDarkIcon={false}
                              alt="open"
                            />
                          </div>
                        </MessageBarBody>
                      </MessageBar>
                    </div>
                  ) : null}
                  <div className={styles.prerequisitesSection}>
                    <Subtitle1>Prerequisites</Subtitle1>
                    {!buildingBlock && (
                      <div className={styles.messageBarGap}>
                        <MessageBar
                          key={"infoBar" + template.title}
                          intent="info"
                        >
                          <MessageBarBody>
                            <MessageBarTitle>New to Azure?</MessageBarTitle>
                            Get $200 in credits when you sign up for an Azure
                            free account. Credits can be used on most Azure
                            services, including for AI app templates.{" "}
                            <span style={{ whiteSpace: "nowrap" }}>
                              <Link
                                href={freeAzure}
                                target="_blank"
                                rel="noopener noreferrer"
                                inline
                              >
                                Try Azure for free
                              </Link>{" "}
                              <CustomImage
                                className={styles.inlineIcon}
                                src={"/img/ai/openBlue.svg"}
                                url={freeAzure}
                                sameDarkIcon={false}
                                alt="open"
                              />
                            </span>
                          </MessageBarBody>
                        </MessageBar>
                      </div>
                    )}
                    <div className={styles.prerequisitesList}>
                      <div className={styles.checkText}>
                        <CustomImage
                          className={null}
                          src={"/img/ai/CheckMarkCircle.svg"}
                          url={null}
                          sameDarkIcon={false}
                          alt="checkMark"
                        />
                        <Body1>Sign up for an Azure account.</Body1>
                      </div>
                      <div className={styles.checkText}>
                        <CustomImage
                          className={null}
                          src={"/img/ai/CheckMarkCircle.svg"}
                          url={null}
                          sameDarkIcon={false}
                          alt="checkMark"
                        />
                        <Body1>Request access to Azure OpenAI Service.</Body1>
                      </div>
                      <div className={styles.checkText}>
                        <CustomImage
                          className={null}
                          src={"/img/ai/CheckMarkCircle.svg"}
                          url={null}
                          sameDarkIcon={false}
                          alt="checkMark"
                        />
                        <Body1>
                          Have the Azure permissions required to deploy.
                        </Body1>
                      </div>
                      {template.prerequisites &&
                        template.prerequisites.map((item) => {
                          const tagObject = Tags[item];
                          return (
                            <div
                              key={"prereq_" + item}
                              className={styles.checkText}
                            >
                              <CustomImage
                                className={null}
                                src={"/img/ai/CheckMarkCircle.svg"}
                                url={null}
                                sameDarkIcon={false}
                                alt="checkMark"
                              />
                              <Body1>
                                <Link
                                  href={tagObject.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {tagObject.label}
                                </Link>
                              </Body1>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {template.architectureDiagram ? (
                    <div className={styles.overview}>
                      <Subtitle1>Architecture</Subtitle1>
                      <div className={styles.architectureDiagram}>
                        <ArchOrScreenshotImage
                          src={template.architectureDiagram}
                          alt="architecture diagram"
                        />
                      </div>
                    </div>
                  ) : null}
                  <Subtitle1>Resources included</Subtitle1>
                  <Body1 className={styles.deployText}>
                    This template deploys the following resources.
                  </Body1>
                  <Table aria-label="Azure Service Table">
                    <TableHeader>
                      <TableRow>
                        {columns.map((column) => (
                          <TableHeaderCell key={column.columnKey}>
                            {column.label}
                          </TableHeaderCell>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {azureIcons.map((item) => {
                        const tagObject = Tags[item];
                        const label = tagObject.label;
                        const productDescription = tagObject.productDescription;
                        const category = tagObject.category;
                        if (!productDescription) {
                          return null;
                        }
                        if (!tagObject.icon) {
                          throw new Error(
                            `Missing icon for Azure service tag '${item}'`,
                          );
                        }
                        return (
                          <TableRow key={label}>
                            <TableCell>
                              <div key={label} className={styles.iconTag}>
                                <div className={styles.icon}>
                                  <CustomImage
                                    className={null}
                                    src={tagObject.icon}
                                    url={null}
                                    sameDarkIcon={
                                      tagObject.darkIcon == undefined
                                    }
                                    alt={tagObject.label}
                                  />
                                </div>
                                <div className={styles.iconTextGroup}>
                                  <Body1Strong>{label}</Body1Strong>
                                  <Caption1>Azure</Caption1>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Caption1>{productDescription}</Caption1>
                            </TableCell>
                            <TableCell>
                              <Caption1>{category}</Caption1>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className={styles.sectionFour}>
                <Card
                  key={"Template Detail Page " + template.title}
                  className={styles.card}
                  appearance="filled"
                >
                  <Subtitle2 className={styles.summary}>Summary</Subtitle2>
                  <div className={styles.summarySection}>
                    <div className={styles.summaryRow}>
                      <div className={styles.summaryLeftImageSection}>
                        <CustomImage
                          className={null}
                          src="/img/ai/Person.svg"
                          url={null}
                          sameDarkIcon={false}
                          alt="Person"
                        />
                        <Body1>Created by</Body1>
                      </div>
                    </div>
                    <div className={styles.summaryDataSection}>
                      <ShowcaseMultipleData
                        template={template}
                        tagType="author"
                      />
                    </div>
                  </div>
                  <div className={styles.summarySection}>
                    <div className={styles.summaryRow}>
                      <div className={styles.summaryLeftImageSection}>
                        <CustomImage
                          className={null}
                          src="/img/ai/Calendar.svg"
                          url={null}
                          sameDarkIcon={false}
                          alt="Calendar"
                        />
                        <Body1>Last updated</Body1>
                      </div>
                    </div>
                    <div className={styles.summaryDataSection}>
                      <GitHubInfo githubData={githubData} updatedOn={true} />
                    </div>
                  </div>
                  <div className={styles.summarySection}>
                    <div className={styles.summaryRow}>
                      <div className={styles.summaryLeftImageSection}>
                        <CustomImage
                          className={null}
                          src="/img/ai/Code.svg"
                          url={null}
                          sameDarkIcon={false}
                          alt="Code"
                        />
                        <Body1>Languages</Body1>
                      </div>
                    </div>
                    <div className={styles.summaryDataSection}>
                      <ShowcaseMultipleData
                        template={template}
                        tagType="language"
                      />
                    </div>
                  </div>
                  <div className={styles.summarySection}>
                    <div className={styles.summaryRow}>
                      <div className={styles.summaryLeftImageSection}>
                        <CustomImage
                          className={null}
                          src="/img/ai/Cube.svg"
                          url={null}
                          sameDarkIcon={false}
                          alt="Cube"
                        />
                        <Body1>Models</Body1>
                      </div>
                    </div>
                    <div className={styles.summaryDataSection}>
                      <ShowcaseMultipleData
                        template={template}
                        tagType="model"
                      />
                    </div>
                  </div>
                  <div className={styles.summarySection}>
                    <div className={styles.summaryRow}>
                      <div className={styles.summaryLeftImageSection}>
                        <CustomImage
                          className={null}
                          src="/img/ai/Tag.svg"
                          url={null}
                          sameDarkIcon={false}
                          alt="Tag"
                        />
                        <Body1>Tags</Body1>
                      </div>
                    </div>
                    <div className={styles.summaryDataSection}>
                      <div className={styles.cardTag}>
                        <ShowcaseCardTag
                          key={"tag_" + template.title}
                          tags={tags}
                          page={true}
                        />
                        {modelTags && (
                          <ShowcaseCardGreyTag
                            key={"tag_model_" + template.title}
                            tags={modelTags}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.divider}>
                    <Divider />
                  </div>
                  <div className={styles.pricingCalculatorSection}>
                    <div className={styles.summaryRow}>
                      <div className={styles.summaryLeftImageSection}>
                        <CustomImage
                          className={null}
                          src="/img/ai/Calculator.svg"
                          url={null}
                          sameDarkIcon={false}
                          alt="Calculator"
                        />
                        <Label required>Estimated cost</Label>
                      </div>
                    </div>
                    <div className={styles.summaryDataSection}>
                      <div className={styles.pricingCalculator}>
                        <Link
                          href={msftPricing}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Body1>Pricing calculator</Body1>
                        </Link>
                        <CustomImage
                          className={styles.linkSection}
                          src="/img/ai/openBlue.svg"
                          url={msftPricing}
                          sameDarkIcon={false}
                          alt="open"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
                {!retired ? (
                  <div className={styles.codeSpaceText}>
                    <Label required />
                    <Body1>
                      You're only charged when you deploy to Azure. You can try
                      this template locally or in{" "}
                      <Link
                        href={vscodeAzureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        appearance="subtle"
                        inline
                      >
                        VS Code for the Web
                      </Link>{" "}
                      at no cost.
                    </Body1>
                  </div>
                ) : null}
                {template.video && (
                  <div
                    className={styles.video}
                    data-m={contentForAdobeAnalytics}
                  >
                    <iframe
                      className={styles.iframe}
                      src={template.video}
                      title={`${template.title} demo video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FluentProvider>
  );
};

export default function TemplateDetailPage() {
  const location = useLocation();
  const slug =
    location.pathname.split("/templates/ai/repo/")[1]?.split("/") ?? [];
  const [owner = "", repo = ""] = slug;
  const template = findTemplateData(owner, repo);
  const title = template
    ? template.title + " | AI app templates"
    : "AI app templates";
  const description =
    "AI app templates are well-maintained, easy to deploy, reference implementations that help to ensure a high-quality starting point for your AI apps.";
  const canonicalRepositoryPath = template
    ? new URL(template.source).pathname
        .split("/")
        .filter(Boolean)
        .slice(0, 2)
        .join("/")
    : `${owner}/${repo}`;
  const url = `https://azure.github.io/awesome-azd/templates/ai/repo/${canonicalRepositoryPath}`;
  const imageUrl = "https://azure.github.io/awesome-azd/img/logo.png";

  return (
    <main>
      <Head>
        <title>{title}</title>
        <link rel="canonical" href={url} />
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:description" content={description} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={url} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={imageUrl} />
      </Head>
      <Layout>
        <TemplateDetail template={template} />
      </Layout>
    </main>
  );
}

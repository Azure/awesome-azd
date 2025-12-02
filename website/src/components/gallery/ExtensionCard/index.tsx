/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState } from "react";
import styleCSS from "./styles.module.css";
import { type Extension } from "../../../data/tags";
import { Capabilities } from "../../../data/extensions";
import {
  Card,
  CardHeader,
  CardFooter,
  Button,
  Text,
} from "@fluentui/react-components";
import { Copy16Regular, Open16Regular } from "@fluentui/react-icons";

function ExtensionCard({ extension }: { extension: Extension }): JSX.Element {
  const [copied, setCopied] = useState(false);
  const installCommand = `azd extension install ${extension.namespace}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={styleCSS.card}>
      <CardHeader
        header={
          <div className={styleCSS.cardHeader}>
            <Text weight="semibold" size={500}>
              {extension.title}
            </Text>
            <Text size={200} className={styleCSS.namespace}>
              @{extension.namespace}
            </Text>
          </div>
        }
        description={
          <div className={styleCSS.authorInfo}>
            <Text size={300}>by {extension.author}</Text>
            {extension.latestVersion && (
              <Text size={200} className={styleCSS.version}>
                v{extension.latestVersion.version}
              </Text>
            )}
          </div>
        }
      />

      <div className={styleCSS.cardBody}>
        <Text className={styleCSS.description}>{extension.description}</Text>

        <div className={styleCSS.capabilities}>
          {extension.capabilities.map((cap) => (
            <span key={cap} className={styleCSS.capabilityBadge}>
              {Capabilities[cap]?.label || cap}
            </span>
          ))}
        </div>

        <div className={styleCSS.tags}>
          {extension.tags.map((tag) => (
            <span key={tag} className={styleCSS.tagBadge}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <CardFooter className={styleCSS.cardFooter}>
        <div className={styleCSS.installSection}>
          <div className={styleCSS.installCommand}>
            <code>{installCommand}</code>
          </div>
          <Button
            appearance="subtle"
            size="small"
            icon={<Copy16Regular />}
            onClick={handleCopy}
            className={styleCSS.copyButton}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>

        <div className={styleCSS.links}>
          {extension.source && (
            <Button
              appearance="subtle"
              size="small"
              icon={<Open16Regular />}
              as="a"
              href={extension.source}
              target="_blank"
              rel="noopener noreferrer"
            >
              Source
            </Button>
          )}
        </div>

        {extension.latestVersion?.examples && extension.latestVersion.examples.length > 0 && (
          <details className={styleCSS.examples}>
            <summary className={styleCSS.examplesSummary}>
              Usage Examples ({extension.latestVersion.examples.length})
            </summary>
            <div className={styleCSS.examplesContent}>
              {extension.latestVersion.examples.map((example, idx) => (
                <div key={idx} className={styleCSS.example}>
                  <Text weight="semibold" size={300}>
                    {example.name}
                  </Text>
                  <Text size={200} className={styleCSS.exampleDescription}>
                    {example.description}
                  </Text>
                  <code className={styleCSS.exampleUsage}>{example.usage}</code>
                </div>
              ))}
            </div>
          </details>
        )}
      </CardFooter>
    </Card>
  );
}

export default React.memo(ExtensionCard);

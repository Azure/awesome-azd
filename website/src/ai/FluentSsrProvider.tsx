/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useMemo } from "react";
import { useLocation } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  createDOMRenderer,
  RendererProvider,
  renderToStyleElements,
  type GriffelRenderer,
} from "@fluentui/react-components";

const styleResourceNamespace = "griffel";
const styleResourcePrefix = `${styleResourceNamespace}:`;

type FluentStyleElementProps = React.StyleHTMLAttributes<HTMLStyleElement> & {
  "data-container"?: string;
  "data-make-styles-bucket"?: string;
  "data-priority"?: number | string;
};

function restoreFluentStyleMetadata(): void {
  if (typeof document === "undefined") {
    return;
  }

  document
    .querySelectorAll<HTMLStyleElement>(
      `style[data-href^="${styleResourcePrefix}"]`,
    )
    .forEach((styleElement) => {
      const resource = styleElement.dataset.href
        ?.split(" ")
        .find((href) => href.startsWith(styleResourcePrefix));
      if (!resource) {
        return;
      }

      const [, bucket, priority, encodedContainer] = resource.split(":");
      styleElement.setAttribute("data-make-styles-bucket", bucket);
      styleElement.setAttribute("data-priority", priority);
      styleElement.setAttribute("data-make-styles-rehydration", "true");

      if (encodedContainer) {
        styleElement.setAttribute(
          "data-container",
          decodeURIComponent(encodedContainer),
        );
      }
    });
}

restoreFluentStyleMetadata();

function FluentServerStyles({
  renderer,
}: {
  renderer: GriffelRenderer;
}): React.JSX.Element | null {
  if (typeof document !== "undefined") {
    return null;
  }

  const styleElements = renderToStyleElements(
    renderer,
  ) as React.ReactElement<FluentStyleElementProps>[];

  return (
    <>
      {styleElements.map((styleElement, index) =>
        React.cloneElement(styleElement, {
          href: [
            styleResourceNamespace,
            styleElement.props["data-make-styles-bucket"],
            styleElement.props["data-priority"] ?? 0,
            encodeURIComponent(styleElement.props["data-container"] ?? ""),
            index,
          ].join(":"),
          precedence: `griffel-${index}`,
        }),
      )}
    </>
  );
}

export default function FluentSsrProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const location = useLocation();
  const galleryPath = useBaseUrl("/templates/ai").replace(/\/+$/, "");
  const currentPath = location.pathname.replace(/\/+$/, "");
  const renderer = useMemo(() => createDOMRenderer(), []);
  const serverRenderFluentStyles =
    currentPath === galleryPath ||
    currentPath.startsWith(`${galleryPath}/repo/`);

  return (
    <RendererProvider renderer={renderer}>
      {children}
      {serverRenderFluentStyles ? (
        <FluentServerStyles renderer={renderer} />
      ) : null}
    </RendererProvider>
  );
}

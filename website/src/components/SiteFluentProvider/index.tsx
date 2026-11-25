/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { useColorMode } from "@docusaurus/theme-common";
import {
  FluentProvider,
  makeStaticStyles,
  mergeClasses,
  webDarkTheme,
  webLightTheme,
} from "@fluentui/react-components";

const providerClassName = "site-fluent-provider";

// Docusaurus sets data-theme before React hydrates, but SSR emits light Fluent
// tokens. Override the differing tokens so the whole page matches first paint.
const useDarkModeStyles = makeStaticStyles({
  [`html[data-theme="dark"] .${providerClassName}`]: Object.fromEntries(
    Object.entries(webDarkTheme)
      .filter(
        ([token, value]) => webLightTheme[token as keyof typeof webLightTheme] !== value,
      )
      .map(([token, value]) => [`--${token}`, value]),
  ),
});

export default function SiteFluentProvider({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  const { colorMode } = useColorMode();
  useDarkModeStyles();

  return (
    <FluentProvider
      className={mergeClasses(providerClassName, className)}
      theme={colorMode === "dark" ? webDarkTheme : webLightTheme}
    >
      {children}
    </FluentProvider>
  );
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { useColorMode } from "@docusaurus/theme-common";
import {
  FluentProvider,
  webDarkTheme,
  webLightTheme,
} from "@fluentui/react-components";

export default function SiteFluentProvider({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  const { colorMode } = useColorMode();

  return (
    <FluentProvider
      className={className}
      theme={colorMode === "dark" ? webDarkTheme : webLightTheme}
    >
      {children}
    </FluentProvider>
  );
}

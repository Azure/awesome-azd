/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { describe, expect, test } from "@jest/globals";
import {
  formatAzdInitCommand,
  getTemplateIdentifier,
} from "../src/utils/templateCommands";

describe("template commands", () => {
  test.each([
    ["https://github.com/Azure-Samples/My-App", "my-app"],
    ["https://github.com/Example/My-App", "example/my-app"],
    [
      "https://github.com/Azure-Samples/Examples/tree/main/App",
      "examples/tree/main/app",
    ],
  ])("preserves the identifier and init command for %s", (source, identifier) => {
    expect(getTemplateIdentifier(source)).toBe(identifier);
    expect(formatAzdInitCommand(identifier)).toBe(`azd init -t ${identifier}`);
  });
});

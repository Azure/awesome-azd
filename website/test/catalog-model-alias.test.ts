/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { describe, expect, jest, test } from "@jest/globals";

jest.mock("../static/templates.json", () => ({
  __esModule: true,
  default: [
    {
      id: "model-alias",
      title: "Model alias",
      description: "Tests model alias compatibility.",
      author: "Example",
      authorUrl: "https://github.com/example",
      source: "https://github.com/example/model-alias",
      tags: ["aiapplication"],
      languages: [],
      frameworks: [],
      azureServices: [],
      IaC: [],
      models: ["meta"],
      appType: [],
    },
  ],
}));
jest.mock("../src/catalog/template-use-cases.json", () => ({
  __esModule: true,
  default: {
    "https://github.com/example/model-alias": ["Build a web app"],
  },
}));

const { catalogTemplates } = require("../src/catalog/catalogData");

describe("catalog model aliases", () => {
  test("retains canonical model IDs for legacy tag filters", () => {
    expect(catalogTemplates).toHaveLength(1);
    expect(catalogTemplates[0].models).toEqual(["Code Llama"]);
    expect(catalogTemplates[0].compatibilityTags).toEqual(
      expect.arrayContaining(["meta", "llama"]),
    );
  });
});

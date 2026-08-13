import { describe, expect, test } from "@jest/globals";
import { getOpenInVSCodeUrl } from "../src/utils/vscode";

describe("getOpenInVSCodeUrl", () => {
  test("opens the template in the VS Code for the Web /azure experience", () => {
    const templateSource =
      "https://github.com/Azure-Samples/todo-nodejs-mongo";
    const url = new URL(getOpenInVSCodeUrl(templateSource));

    expect(url.origin).toBe("https://vscode.dev");
    expect(url.pathname).toBe("/azure");
    expect(url.searchParams.get("vscode-azure-exp")).toBe("azd");
    expect(url.searchParams.get("az-referer")).toBe("awesome-azd");
    expect(url.searchParams.get("azdTemplateUrl")).toBe(templateSource);
  });

  test("preserves template source query parameters", () => {
    const templateSource =
      "https://github.com/example/template?ref=feature/test";
    const url = new URL(getOpenInVSCodeUrl(templateSource));

    expect(url.searchParams.get("azdTemplateUrl")).toBe(templateSource);
  });
});

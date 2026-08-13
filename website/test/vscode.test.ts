import { describe, expect, test } from "@jest/globals";
import { getOpenInVSCodeUrl } from "../src/utils/vscode";

describe("getOpenInVSCodeUrl", () => {
  test("opens the template in the VS Code for the Web /azure experience", () => {
    expect(
      getOpenInVSCodeUrl("https://github.com/Azure-Samples/todo-nodejs-mongo")
    ).toBe(
      "https://vscode.dev/azure?vscode-azure-exp=azd&az-referer=awesome-azd&azdTemplateUrl=https%3A%2F%2Fgithub.com%2FAzure-Samples%2Ftodo-nodejs-mongo"
    );
  });

  test("encodes template source query parameters", () => {
    const url = getOpenInVSCodeUrl(
      "https://github.com/example/template?ref=feature/test"
    );

    expect(url).toContain(
      "azdTemplateUrl=https%3A%2F%2Fgithub.com%2Fexample%2Ftemplate%3Fref%3Dfeature%2Ftest"
    );
    expect(url).toContain("vscode-azure-exp=azd");
    expect(url).toContain("az-referer=awesome-azd");
  });
});

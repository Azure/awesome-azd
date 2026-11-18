import { afterEach, describe, expect, test } from "@jest/globals";

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

const {
  normalizeSource,
  updateTemplateUseCases,
} = require("../scripts/update-template-use-cases");

const createdPaths: string[] = [];

function createUseCasesFile(contents: unknown = {}) {
  const filePath = path.join(
    process.cwd(),
    `.test-template-use-cases-${crypto.randomUUID()}.json`,
  );
  fs.writeFileSync(filePath, `${JSON.stringify(contents, null, 2)}\n`);
  createdPaths.push(filePath);
  return filePath;
}

afterEach(() => {
  for (const filePath of createdPaths.splice(0)) {
    fs.rmSync(filePath, { force: true });
  }
});

describe("updateTemplateUseCases", () => {
  test("adds a reviewable primary use case for a new template", () => {
    const useCasesPath = createUseCasesFile();

    const result = updateTemplateUseCases({
      sourceRepo: "https://GitHub.com/Example/Template.git",
      primaryUseCase: "Build a web app",
      useCasesPath,
    });

    expect(result).toEqual({
      skipped: false,
      source: "https://github.com/example/template",
    });
    expect(JSON.parse(fs.readFileSync(useCasesPath, "utf8"))).toEqual({
      "https://github.com/example/template": ["Build a web app"],
    });
  });

  test("does not overwrite an existing reviewed classification", () => {
    const useCasesPath = createUseCasesFile({
      "https://github.com/example/template": ["Build an API"],
    });

    const result = updateTemplateUseCases({
      sourceRepo: "https://github.com/example/template",
      primaryUseCase: "Build a web app",
      useCasesPath,
    });

    expect(result.skipped).toBe(true);
    expect(JSON.parse(fs.readFileSync(useCasesPath, "utf8"))).toEqual({
      "https://github.com/example/template": ["Build an API"],
    });
  });

  test("rejects unsupported classifications", () => {
    const useCasesPath = createUseCasesFile();

    expect(() =>
      updateTemplateUseCases({
        sourceRepo: "https://github.com/example/template",
        primaryUseCase: "Something else",
        useCasesPath,
      }),
    ).toThrow("Unsupported primary use case");
  });
});

describe("normalizeSource", () => {
  test("strips a Git suffix before a fragment", () => {
    expect(
      normalizeSource(
        "https://github.com/Example/Template.git#readme",
      ),
    ).toBe("https://github.com/example/template");
  });

  test("strips GitHub repository subpaths", () => {
    expect(
      normalizeSource(
        "https://github.com/Example/Template/tree/main/examples/demo",
      ),
    ).toBe("https://github.com/example/template");
  });
});

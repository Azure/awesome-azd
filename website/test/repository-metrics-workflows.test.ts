import { describe, expect, test } from "@jest/globals";
import fs from "node:fs";
import path from "node:path";

const yaml = require("js-yaml");
const repositoryRoot = path.resolve(__dirname, "..", "..");

function readWorkflow(fileName: string): any {
  const workflowPath = path.join(
    repositoryRoot,
    ".github",
    "workflows",
    fileName,
  );
  return yaml.load(fs.readFileSync(workflowPath, "utf8"));
}

describe("repository metrics workflows", () => {
  test("opens a tested weekly PR for the bundled snapshot", () => {
    const workflow = readWorkflow(
      "update-repository-metrics.yml",
    );
    expect(workflow.on.schedule).toEqual([
      { cron: "0 17 * * 1" },
    ]);
    expect(workflow.permissions).toEqual({
      contents: "write",
      "pull-requests": "write",
    });

    const steps =
      workflow.jobs["update-repository-metrics"].steps;
    expect(
      steps.find(
        (step: any) =>
          step.name === "Update bundled repository metrics",
      ).run,
    ).toContain(
      "node scripts/update-repository-metrics-snapshot.js",
    );
    expect(
      steps.find(
        (step: any) => step.name === "Test updated snapshot",
      ).run,
    ).toBe("npm test -- --runInBand");
    const createPullRequest = steps.find(
      (step: any) =>
        step.name === "Create or update Pull Request",
    );
    expect(createPullRequest.run).toContain(
      "website/src/catalog/repository-metrics.generated.json",
    );
    expect(createPullRequest.run).toContain("gh pr create");
  });

  test("runs website testing and live metrics validation before release", () => {
    const workflow = readWorkflow("release.yml");
    expect(workflow.jobs["test-website"].uses).toBe(
      "./.github/workflows/website-test.yml",
    );

    const deploy = workflow.jobs.deploy;
    expect(deploy.needs).toEqual(["guard", "test-website"]);
    const validateIndex = deploy.steps.findIndex(
      (step: any) =>
        step.name === "Validate live repository metrics",
    );
    const buildIndex = deploy.steps.findIndex(
      (step: any) => step.name === "Build website",
    );
    const deployIndex = deploy.steps.findIndex(
      (step: any) => step.id === "deployment",
    );

    expect(validateIndex).toBeGreaterThan(-1);
    expect(
      deploy.steps[validateIndex].run,
    ).toContain(
      "if ! node scripts/validate-repository-metrics.js",
    );
    expect(
      deploy.steps[validateIndex].run,
    ).toContain("::warning::");
    expect(
      deploy.steps[validateIndex].run,
    ).toContain("deploying with bundled star counts");
    expect(validateIndex).toBeLessThan(buildIndex);
    expect(buildIndex).toBeLessThan(deployIndex);
  });
});

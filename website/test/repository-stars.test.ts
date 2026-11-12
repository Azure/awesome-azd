/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "@jest/globals";
import {
  getRepositorySlug,
  getRepositoryStars,
} from "../src/catalog/repositoryMetrics";
import { RepositoryStarCount } from "../src/components/catalog/CatalogPage/RepositoryStarCount";

const aggregate = {
  repositories: {
    "example/one": { stars: 381 },
    "example/zero": { stars: 0 },
  },
};

describe("repository star metadata", () => {
  test("maps canonical public GitHub repositories to star counts", () => {
    expect(getRepositorySlug("https://github.com/Example/One")).toBe(
      "example/one",
    );
    expect(
      getRepositoryStars(aggregate, "https://github.com/Example/One"),
    ).toBe(381);
    expect(
      getRepositoryStars(aggregate, "https://github.com/example/zero"),
    ).toBe(0);
    expect(
      getRepositoryStars(aggregate, "https://github.com/example/missing"),
    ).toBeUndefined();
  });

  test("renders zero and positive counts but hides missing stars", () => {
    const render = (stars?: number) =>
      renderToStaticMarkup(
        React.createElement(RepositoryStarCount, {
          stars,
          icon: React.createElement("span", null, "star"),
        }),
      );

    expect(render()).toBe("");
    expect(render(0)).toContain('role="img"');
    expect(render(0)).toContain('aria-label="0 GitHub stars"');
    expect(render(381)).toContain('aria-label="381 GitHub stars"');
    expect(render(381)).toContain(">381<");
  });
});

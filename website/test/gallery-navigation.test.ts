/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { describe, expect, jest, test } from "@jest/globals";

jest.mock(
  "@docusaurus/ExecutionEnvironment",
  () => ({
    __esModule: true,
    default: { canUseDOM: false },
  }),
  { virtual: true },
);

import {
  createTemplateDetailNavigationState,
  getGalleryReturnLocation,
} from "../src/utils/galleryNavigation";

describe("gallery detail navigation", () => {
  test("round-trips an internal templates return location", () => {
    const navigationState = {
      scrollTopPosition: 640,
      focusedElementId: "template-example-link",
    };
    const detailState = createTemplateDetailNavigationState(
      {
        pathname: "/awesome-azd/templates",
        search: "?type=ai&page=2",
        hash: "",
      },
      navigationState,
    );

    expect(getGalleryReturnLocation(detailState)).toEqual({
      pathname: "/awesome-azd/templates",
      search: "?type=ai&page=2",
      hash: "",
      state: navigationState,
    });
  });

  test("rejects malformed or non-gallery return locations", () => {
    expect(
      getGalleryReturnLocation({
        galleryReturnLocation: {
          pathname: "https://example.com/templates",
          search: "",
          hash: "",
          state: {
            scrollTopPosition: 0,
            focusedElementId: undefined,
          },
        },
      }),
    ).toBeUndefined();
    expect(
      getGalleryReturnLocation({
        galleryReturnLocation: {
          pathname: "/awesome-azd/templates/example/repository",
          search: "",
          hash: "",
          state: {
            scrollTopPosition: -1,
            focusedElementId: undefined,
          },
        },
      }),
    ).toBeUndefined();
  });
});

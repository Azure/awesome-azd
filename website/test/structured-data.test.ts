/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { describe, expect, test } from "@jest/globals";
import { serializeStructuredData } from "../src/utils/structuredData";

describe("structured data serialization", () => {
  test("escapes script terminators without changing the JSON value", () => {
    const structuredData = {
      name: "</script><script>globalThis.injected = true</script>",
      description: "A < B",
    };

    const serialized = serializeStructuredData(structuredData);

    expect(serialized).not.toContain("<");
    expect(serialized).not.toContain("</script");
    expect(serialized).toContain("\\u003c/script>");
    expect(JSON.parse(serialized)).toEqual(structuredData);
  });
});

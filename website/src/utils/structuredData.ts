/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export function serializeStructuredData(value: object): string {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    throw new Error("Structured data must be JSON serializable.");
  }

  return serialized.replace(/</g, "\\u003c");
}

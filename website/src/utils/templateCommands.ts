/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export function getTemplateIdentifier(templateSource: string): string {
  return templateSource
    .replace("https://github.com/", "")
    .toLowerCase()
    .replace("azure-samples/", "");
}

export function formatAzdInitCommand(templateIdentifier: string): string {
  return "azd init -t " + templateIdentifier;
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { unsortedExtensions } from '../src/data/extensions';
import { Tags, type TagType } from '../src/data/tags';

describe('Extension Tags Validation', () => {
  test('all extension tags exist in Tags definition', () => {
    const invalidTags: { extensionId: string; tag: TagType }[] = [];
    const validTagKeys = Object.keys(Tags);

    unsortedExtensions.forEach((extension) => {
      extension.tags.forEach((tag) => {
        if (!validTagKeys.includes(tag)) {
          invalidTags.push({ extensionId: extension.id, tag });
        }
      });
    });

    if (invalidTags.length > 0) {
      console.error('Invalid tags found:');
      invalidTags.forEach(({ extensionId, tag }) => {
        console.error(`  Extension: ${extensionId}, Tag: ${tag}`);
      });
    }

    expect(invalidTags).toHaveLength(0);
  });

  test('all extensions have required fields', () => {
    const invalidExtensions: string[] = [];

    unsortedExtensions.forEach((extension) => {
      if (
        !extension.id ||
        !extension.namespace ||
        !extension.title ||
        !extension.description ||
        !extension.author ||
        !extension.tags ||
        !extension.capabilities
      ) {
        invalidExtensions.push(extension.id || 'unknown');
      }
    });

    if (invalidExtensions.length > 0) {
      console.error('Extensions with missing required fields:');
      invalidExtensions.forEach((id) => {
        console.error(`  ${id}`);
      });
    }

    expect(invalidExtensions).toHaveLength(0);
  });

  test('all extensions have at least one capability', () => {
    const extensionsWithoutCapabilities: string[] = [];

    unsortedExtensions.forEach((extension) => {
      if (!extension.capabilities || extension.capabilities.length === 0) {
        extensionsWithoutCapabilities.push(extension.id);
      }
    });

    if (extensionsWithoutCapabilities.length > 0) {
      console.error('Extensions without capabilities:');
      extensionsWithoutCapabilities.forEach((id) => {
        console.error(`  ${id}`);
      });
    }

    expect(extensionsWithoutCapabilities).toHaveLength(0);
  });

  test('extension IDs are unique', () => {
    const ids = unsortedExtensions.map((ext) => ext.id);
    const uniqueIds = new Set(ids);

    expect(ids.length).toBe(uniqueIds.size);
  });

  test('extension namespaces are valid', () => {
    const invalidNamespaces: string[] = [];

    unsortedExtensions.forEach((extension) => {
      // Namespace should be lowercase, alphanumeric with hyphens and dots
      const namespaceRegex = /^[a-z0-9.-]+$/;
      if (!namespaceRegex.test(extension.namespace)) {
        invalidNamespaces.push(
          `${extension.id} has invalid namespace: ${extension.namespace}`
        );
      }
    });

    if (invalidNamespaces.length > 0) {
      console.error('Invalid namespaces:');
      invalidNamespaces.forEach((msg) => {
        console.error(`  ${msg}`);
      });
    }

    expect(invalidNamespaces).toHaveLength(0);
  });
});

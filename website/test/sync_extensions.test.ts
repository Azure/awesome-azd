import { describe, expect, test } from '@jest/globals';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const {
  BUILT_IN_REGISTRY_URL,
  syncBuiltInExtensions,
  writeCatalogAtomically,
} = require('../scripts/sync-extensions');
const { readExtensionRegistry } = require('../scripts/read-extension-registry');

describe('Extension catalog synchronization', () => {
  test('reads extension metadata through azd validation, list, and show', () => {
    const commands: string[][] = [];
    const execute = (args: string[]) => {
      commands.push(args);
      if (args[1] === 'source') {
        return { valid: true };
      }
      if (args[1] === 'list') {
        return [{ id: 'microsoft.azd.test' }];
      }
      return {
        Id: 'microsoft.azd.test',
        Name: 'Test extension',
        Description: 'Test description',
        Capabilities: ['custom-commands'],
      };
    };

    expect(readExtensionRegistry(BUILT_IN_REGISTRY_URL, execute)).toEqual([
      {
        id: 'microsoft.azd.test',
        displayName: 'Test extension',
        description: 'Test description',
        capabilities: ['custom-commands'],
      },
    ]);
    expect(commands.map((args) => args.slice(0, 2))).toEqual([
      ['extension', 'source'],
      ['extension', 'list'],
      ['extension', 'show'],
    ]);
    expect(commands[0]).toContain('--strict');
    expect(commands.every((args) => args.includes(BUILT_IN_REGISTRY_URL))).toBe(true);
  });

  test('rejects an empty registry returned by azd', () => {
    const execute = (args: string[]) =>
      args[1] === 'source' ? { valid: true } : [];

    expect(() => readExtensionRegistry(BUILT_IN_REGISTRY_URL, execute)).toThrow(
      'azd returned no extensions',
    );
  });

  test('synchronizes built-ins and preserves curated and community metadata', () => {
    const current = [
      {
        id: 'microsoft.azd.existing',
        namespace: 'existing',
        displayName: 'Old name',
        description: 'Old description',
        author: 'Curated Team',
        authorUrl: 'https://github.com/Azure',
        source: 'https://example.com/curated-source',
        registryUrl: BUILT_IN_REGISTRY_URL,
        latestVersion: '1.0.0',
        capabilities: ['custom-commands'],
        platforms: ['linux/amd64'],
        tags: ['msft', 'ai'],
      },
      {
        id: 'microsoft.azd.removed',
        displayName: 'Removed',
        description: 'No longer upstream',
        author: 'Azure Dev',
        source: 'https://example.com/removed',
        registryUrl: BUILT_IN_REGISTRY_URL,
        capabilities: [],
        tags: ['msft'],
      },
      {
        id: 'community.extension',
        namespace: 'community',
        displayName: 'Community extension',
        description: 'Community description',
        author: 'Community Author',
        source: 'https://example.com/community',
        registryUrl: 'https://example.com/registry.json',
        latestVersion: '2.0.0',
        capabilities: [],
        platforms: [],
        tags: ['community'],
      },
    ];
    const registry = [
      {
        id: 'microsoft.azd.new',
        displayName: 'New extension',
        description: 'New description',
        capabilities: ['metadata'],
      },
      {
        id: 'microsoft.azd.existing',
        displayName: 'Current name',
        description: 'Current description',
        capabilities: ['custom-commands', 'metadata'],
      },
    ];

    const result = syncBuiltInExtensions(current, registry);

    expect(result.extensions.map((extension: { id: string }) => extension.id)).toEqual([
      'microsoft.azd.existing',
      'microsoft.azd.new',
      'community.extension',
    ]);
    expect(result.extensions[0]).toEqual({
      id: 'microsoft.azd.existing',
      displayName: 'Current name',
      description: 'Current description',
      author: 'Curated Team',
      authorUrl: 'https://github.com/Azure',
      source: 'https://example.com/curated-source',
      registryUrl: BUILT_IN_REGISTRY_URL,
      capabilities: ['custom-commands', 'metadata'],
      tags: ['msft', 'ai'],
    });
    expect(result.extensions[1]).toMatchObject({
      id: 'microsoft.azd.new',
      author: 'Azure Dev',
      registryUrl: BUILT_IN_REGISTRY_URL,
      tags: ['msft', 'new'],
    });
    expect(result.extensions[2]).not.toHaveProperty('namespace');
    expect(result.extensions[2]).not.toHaveProperty('latestVersion');
    expect(result.extensions[2]).not.toHaveProperty('platforms');
    expect(result.changes.added).toEqual(['microsoft.azd.new']);
    expect(result.changes.removed).toEqual(['microsoft.azd.removed']);
    expect(result.changed).toBe(true);
  });

  test('rejects a built-in id that conflicts with a community extension', () => {
    const current = [
      {
        id: 'conflicting.extension',
        displayName: 'Community extension',
        description: 'Community description',
        author: 'Community Author',
        source: 'https://example.com/community',
        registryUrl: 'https://example.com/registry.json',
        capabilities: [],
        tags: ['community'],
      },
    ];

    expect(() =>
      syncBuiltInExtensions(current, [
        {
          id: 'conflicting.extension',
          displayName: 'Built-in extension',
          description: 'Built-in description',
          capabilities: [],
        },
      ]),
    ).toThrow('conflicts with a community extension');
  });

  test('includes registry removals in the synchronized catalog', () => {
    const current = Array.from({ length: 8 }, (_, index) => ({
      id: `microsoft.azd.${index}`,
      displayName: `Extension ${index}`,
      description: 'Description',
      author: 'Azure Dev',
      source: `https://example.com/${index}`,
      registryUrl: BUILT_IN_REGISTRY_URL,
      capabilities: [],
      tags: ['msft'],
    }));
    const registry = current.slice(0, 4).map(({ id, displayName, description }) => ({
      id,
      displayName,
      description,
      capabilities: [],
    }));

    const result = syncBuiltInExtensions(current, registry);

    expect(result.extensions).toHaveLength(4);
    expect(result.changes.removed).toEqual([
      'microsoft.azd.4',
      'microsoft.azd.5',
      'microsoft.azd.6',
      'microsoft.azd.7',
    ]);
  });

  test('replaces the catalog atomically', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'extension-sync-'));
    const outputPath = path.join(directory, 'extensions.json');
    fs.writeFileSync(outputPath, '[]\n');

    try {
      writeCatalogAtomically([{ id: 'microsoft.azd.test' }], outputPath);

      expect(JSON.parse(fs.readFileSync(outputPath, 'utf-8'))).toEqual([
        { id: 'microsoft.azd.test' },
      ]);
      expect(fs.readdirSync(directory)).toEqual(['extensions.json']);
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
});

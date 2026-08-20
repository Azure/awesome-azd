import { describe, expect, test } from '@jest/globals';
import { Tags } from '../src/data/tags';
import { CAPABILITY_BADGES } from '../src/data/extensionCapabilities';
import Templates from '../static/templates.json';
import Extensions from '../static/extensions.json';

describe('Template tests', () => {
    test('Tags exists', () => {
        // Get the unique tags from all templates by iterating all templates and taking the tags into a map
        var tags = new Array<string>();
        Templates.forEach(template => {
            // Collect tags from all arrays
            const allTags = [
                ...(template.tags || []),
                ...(template.languages || []),
                ...(template.frameworks || []),
                ...(template.azureServices || []),
                ...(template.IaC || []),
            ];
            allTags.forEach(tag => {
                if (!tags.includes(tag)) {
                    tags.push(tag);
                }
            });
        });
        // Check if all tags exist in the Tags enum
        tags.forEach(tag => {
            const tagDefinition = Tags[tag];
            if (tagDefinition === undefined) {
                console.error(`Error: The tag "${tag}" is not defined in ./src/data/tags.tsx.`);
            }
            expect(tagDefinition).toBeDefined();
        });
    });
});

describe('Extension tests', () => {
    test('Extension tags exist', () => {
        var tags = new Array<string>();
        Extensions.forEach((extension: any) => {
            (extension.tags || []).forEach((tag: string) => {
                if (!tags.includes(tag)) {
                    tags.push(tag);
                }
            });
        });
        tags.forEach(tag => {
            const tagDefinition = Tags[tag];
            if (tagDefinition === undefined) {
                console.error(`Error: The extension tag "${tag}" is not defined in ./src/data/tags.tsx.`);
            }
            expect(tagDefinition).toBeDefined();
        });
    });

    test('Extension IDs are unique', () => {
        const ids = Extensions.map((ext: any) => ext.id);
        const uniqueIds = new Set(ids);
        expect(ids.length).toBe(uniqueIds.size);
    });

    test('Extensions have required fields', () => {
        Extensions.forEach((extension: any) => {
            expect(extension.id).toBeDefined();
            expect(extension.displayName).toBeDefined();
            expect(extension.description).toBeDefined();
            expect(extension.author).toBeTruthy();
            expect(extension.source).toBeTruthy();
            expect(extension.registryUrl).toBeTruthy();
            expect(extension.capabilities).toBeDefined();
            expect(Array.isArray(extension.capabilities)).toBe(true);
        });
    });

    // Capabilities are written straight from azd into the catalog by the sync
    // workflow, but three separate places must know about each one: the `ext-`
    // tag definition, that tag's "Extension Capability" type (which is how
    // ShowcaseLeftFilters selects sidebar entries), and the card's badge map.
    // Each gap degrades silently — a missing tag or wrong type drops the
    // capability from the filter sidebar, and a missing badge entry renders it
    // as a raw kebab-case label. Assert all three so a new azd capability fails
    // the sync job instead of shipping a half-wired badge.
    test('Extension capabilities are fully wired for display and filtering', () => {
        Extensions.forEach((extension: any) => {
            extension.capabilities.forEach((capability: string) => {
                const tag = `ext-${capability}`;
                const tagDefinition = Tags[tag];
                if (tagDefinition === undefined) {
                    console.error(
                        `Error: capability "${capability}" on extension "${extension.id}" has no "${tag}" entry in ./src/data/tags.tsx.`
                    );
                } else if (tagDefinition.type !== 'Extension Capability') {
                    console.error(
                        `Error: tag "${tag}" has type "${tagDefinition.type}" but must be "Extension Capability" to appear in the filter sidebar.`
                    );
                }
                if (CAPABILITY_BADGES[capability] === undefined) {
                    console.error(
                        `Error: capability "${capability}" on extension "${extension.id}" has no entry in ./src/data/extensionCapabilities.ts, so its card badge would render as raw text.`
                    );
                }
                expect(tagDefinition).toBeDefined();
                expect(tagDefinition.type).toBe('Extension Capability');
                expect(CAPABILITY_BADGES[capability]).toBeDefined();
            });
        });
    });
});

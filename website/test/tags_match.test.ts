import { describe, expect, test } from '@jest/globals';
import { Tags } from '../src/data/tags';
import Templates from '../static/templates.json';

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

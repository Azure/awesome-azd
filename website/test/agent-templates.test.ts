import { describe, expect, test } from '@jest/globals';
import AgentTemplates from '../static/agent-templates.json';

describe('Agent template tests', () => {
    test('Agent templates have required fields', () => {
        AgentTemplates.forEach((template: any) => {
            expect(template.title).toBeDefined();
            expect(typeof template.title).toBe('string');
            expect(template.description).toBeDefined();
            expect(typeof template.description).toBe('string');
            expect(template.language).toBeDefined();
            expect(typeof template.language).toBe('string');
            expect(template.framework).toBeDefined();
            expect(typeof template.framework).toBe('string');
            expect(template.source).toBeDefined();
            expect(typeof template.source).toBe('string');
            expect(template.tags).toBeDefined();
            expect(Array.isArray(template.tags)).toBe(true);
        });
    });

    test('Agent template titles are unique', () => {
        const titles = AgentTemplates.map((t: any) => t.title);
        const uniqueTitles = new Set(titles);
        if (titles.length !== uniqueTitles.size) {
            const duplicates = titles.filter((t: string, i: number) => titles.indexOf(t) !== i);
            console.error(`Duplicate titles: ${[...new Set(duplicates)].join(', ')}`);
        }
        expect(titles.length).toBe(uniqueTitles.size);
    });

    test('Agent template source URLs are valid GitHub URLs', () => {
        AgentTemplates.forEach((template: any) => {
            expect(template.source).toMatch(/^https:\/\/github\.com\//);
        });
    });

    test('Agent template language values are known', () => {
        const knownLanguages = ['python', 'csharp', 'javascript', 'typescript', 'java'];
        AgentTemplates.forEach((template: any) => {
            if (!knownLanguages.includes(template.language)) {
                console.error(`Unknown language "${template.language}" in template "${template.title}". Add it to the known list if intentional.`);
            }
            expect(knownLanguages).toContain(template.language);
        });
    });

    test('Agent template tags are non-empty strings', () => {
        AgentTemplates.forEach((template: any) => {
            template.tags.forEach((tag: any) => {
                expect(typeof tag).toBe('string');
                expect(tag.length).toBeGreaterThan(0);
            });
        });
    });
});

import { describe, expect, test } from '@jest/globals';
import { createHash } from 'crypto';
import Templates from '../static/templates.json';

// Agent templates are now unified into templates.json and discriminated by
// `templateType: "extension.ai.agent"`. Consumers like `azd ai agent init`
// filter the shared manifest by this field rather than reading a separate file.
const AGENT_TYPE = 'extension.ai.agent';

// Deterministic UUID v5 derivation used at the extension.ai.agent migration.
// Scope: this function — and the determinism test that uses it — apply ONLY to
// extension.ai.agent entries. Gallery templates added via the interactive
// `npm run add-template` script (scripts/update-templates-json.js) get random
// UUIDs and are intentionally exempt from this check.
// Input: "awesome-azd:agent:" + source. Output: RFC 4122 UUID v5 string.
function deterministicAgentId(source: string): string {
    const hash = createHash('sha1').update(`awesome-azd:agent:${source}`).digest();
    const bytes = Buffer.from(hash.subarray(0, 16));
    bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
    const hex = bytes.toString('hex');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

const UUID_V5_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

type RawTemplate = Record<string, any>;

const agents: RawTemplate[] = (Templates as RawTemplate[]).filter(
    (t) => t && t.templateType === AGENT_TYPE
);

describe('Agent template tests (extension.ai.agent)', () => {
    test('at least one agent template exists in templates.json', () => {
        expect(agents.length).toBeGreaterThan(0);
    });

    test('agent templates have required core fields', () => {
        agents.forEach((template) => {
            expect(typeof template.title).toBe('string');
            expect(template.title.length).toBeGreaterThan(0);
            expect(typeof template.description).toBe('string');
            expect(template.description.length).toBeGreaterThan(0);
            expect(typeof template.source).toBe('string');
            expect(template.source).toMatch(/^https:\/\/github\.com\//);
            expect(typeof template.author).toBe('string');
            expect(template.author.length).toBeGreaterThan(0);
            expect(typeof template.id).toBe('string');
            expect(template.id.length).toBeGreaterThan(0);
        });
    });

    test('agent templates use the expected templateType namespace', () => {
        agents.forEach((template) => {
            expect(template.templateType).toBe(AGENT_TYPE);
            expect(template.templateType.startsWith('extension.')).toBe(true);
        });
    });

    test('agent templates have at least one language', () => {
        agents.forEach((template) => {
            expect(Array.isArray(template.languages)).toBe(true);
            expect(template.languages.length).toBeGreaterThan(0);
        });
    });

    test('extensionFramework is a string when present', () => {
        agents.forEach((template) => {
            if (template.extensionFramework != null) {
                expect(typeof template.extensionFramework).toBe('string');
                expect(template.extensionFramework.length).toBeGreaterThan(0);
            }
        });
    });

    test('extensionTags are non-empty strings when present', () => {
        agents.forEach((template) => {
            if (template.extensionTags != null) {
                expect(Array.isArray(template.extensionTags)).toBe(true);
                template.extensionTags.forEach((tag: unknown) => {
                    expect(typeof tag).toBe('string');
                    expect((tag as string).length).toBeGreaterThan(0);
                });
            }
        });
    });

    test('agent template titles are unique', () => {
        const titles = agents.map((t) => t.title);
        expect(titles.length).toBe(new Set(titles).size);
    });

    test('agent template ids are unique across the full manifest', () => {
        const allIds = (Templates as RawTemplate[]).map((t) => t.id).filter(Boolean);
        expect(allIds.length).toBe(new Set(allIds).size);
    });

    test('agent template ids match RFC 4122 UUID v5 format', () => {
        agents.forEach((template) => {
            expect(template.id).toMatch(UUID_V5_REGEX);
        });
    });

    test('extension.ai.agent ids are deterministic from source (agent-only invariant)', () => {
        agents.forEach((template) => {
            const expected = deterministicAgentId(template.source);
            expect(template.id).toBe(expected);
        });
    });
});

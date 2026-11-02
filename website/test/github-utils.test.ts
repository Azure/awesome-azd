import { describe, expect, test } from '@jest/globals';

const {
    escapeMarkdown,
} = require('../../.github/scripts/github-utils.js');

describe('GitHub markdown escaping', () => {
    test('escapes existing backslashes before Markdown metacharacters', () => {
        const metacharacters = ['|', '[', ']', '(', ')', '`', '*', '_', '~', '>', '#'];

        for (const character of metacharacters) {
            expect(escapeMarkdown('\\' + character)).toBe(
                '\\'.repeat(3) + character
            );
        }
    });
});

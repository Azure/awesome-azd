import { describe, expect, test } from '@jest/globals';
import { glob, globSync } from 'glob';
import { Minimatch } from 'minimatch';
import path from 'path';

const TestExclude = require('test-exclude');
const cwd = path.resolve(__dirname, '..');
const options = { cwd, nodir: true };
const normalizePaths = (files: string[]) =>
    files.map((file) => file.split(path.sep).join('/'));

describe('minimatch upgrade compatibility', () => {
    test('bounds globstar-parent preprocessing at optimization level two', () => {
        const matcher = new Minimatch('**/../a/b/'.repeat(8) + '*.ts', {
            optimizationLevel: 2,
            braceExpandMax: 16,
        });
        expect(matcher.globParts.length).toBeGreaterThan(0);
        expect(matcher.globParts.length).toBeLessThanOrEqual(16);
    });

    test('glob matches wildcard and brace patterns synchronously', () => {
        expect(
            normalizePaths(
                globSync('test/{glob-compatibility,tags_match}.test.ts', options)
            ).sort()
        ).toEqual([
            'test/glob-compatibility.test.ts',
            'test/tags_match.test.ts',
        ]);
    });

    test('glob matches recursive patterns and respects ignores asynchronously', async () => {
        expect(
            normalizePaths(
                await glob('test/**/*.test.ts', {
                    ...options,
                    ignore: ['test/!(glob-compatibility).test.ts'],
                })
            )
        ).toEqual(['test/glob-compatibility.test.ts']);
    });

    test('coverage filtering still includes source files and excludes tests', () => {
        const exclude = new TestExclude({ cwd, include: ['src/**/*.tsx'] });
        expect(exclude.shouldInstrument(path.join(cwd, 'src/pages/index.tsx'))).toBe(true);
        expect(exclude.shouldInstrument(path.join(cwd, 'src/pages/index.test.tsx'))).toBe(false);
        expect(exclude.shouldInstrument(path.join(cwd, 'test/glob-compatibility.test.ts'))).toBe(false);
    });
});

import { describe, expect, test } from '@jest/globals';
import {
  isGalleryTemplate,
  filterGalleryTemplates,
  unsortedUsers,
  sortedUsers,
} from '../src/data/users';
import { User } from '../src/data/tags';

// Contract: extension templates (anything with `templateType` set, e.g.
// `extension.ai.agent`) live in templates.json so `azd` can consume a single
// manifest, but they must NEVER leak into the gallery dataset. These tests
// guard that boundary so future refactors can't accidentally surface
// extension templates in the UI.
describe('Gallery filter: exclude entries with templateType set', () => {
  test('isGalleryTemplate returns false for any non-empty templateType', () => {
    const extension = { templateType: 'extension.ai.agent' } as User;
    const future = { templateType: 'extension.mcp.server' } as User;
    const other = { templateType: 'something-else' } as User;
    expect(isGalleryTemplate(extension)).toBe(false);
    expect(isGalleryTemplate(future)).toBe(false);
    expect(isGalleryTemplate(other)).toBe(false);
  });

  test('isGalleryTemplate returns true for standard templates (no templateType)', () => {
    const standard = { templateType: undefined } as unknown as User;
    const nullish = { templateType: null } as unknown as User;
    const missing = {} as User;
    const empty = { templateType: '' } as User;
    expect(isGalleryTemplate(standard)).toBe(true);
    expect(isGalleryTemplate(nullish)).toBe(true);
    expect(isGalleryTemplate(missing)).toBe(true);
    expect(isGalleryTemplate(empty)).toBe(true);
  });

  test('filterGalleryTemplates drops all entries with templateType set', () => {
    const input = [
      { title: 'a', templateType: 'extension.ai.agent' },
      { title: 'b' },
      { title: 'c', templateType: 'extension.mcp.server' },
      { title: 'd', templateType: null },
      { title: 'e', templateType: 'something-else' },
    ] as unknown as User[];
    const result = filterGalleryTemplates(input);
    expect(result.map((u) => u.title)).toEqual(['b', 'd']);
  });

  test('unsortedUsers contains no entries with templateType set', () => {
    const leaked = unsortedUsers.filter(
      (u) => typeof u.templateType === 'string' && u.templateType !== ''
    );
    expect(leaked).toEqual([]);
  });

  test('sortedUsers contains no entries with templateType set', () => {
    const leaked = sortedUsers.filter(
      (u) => typeof u.templateType === 'string' && u.templateType !== ''
    );
    expect(leaked).toEqual([]);
  });
});

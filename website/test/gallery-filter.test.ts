import { describe, expect, test } from '@jest/globals';
import {
  isGalleryTemplate,
  filterGalleryTemplates,
  unsortedUsers,
  sortedUsers,
} from '../src/data/users';
import { User } from '../src/data/tags';

// Contract: extension templates (e.g. `extension.ai.agent`) live in
// templates.json so `azd` can consume a single manifest, but they must NEVER
// leak into the gallery dataset. These tests guard that boundary so future
// refactors can't accidentally surface extension templates in the UI.
describe('Gallery filter: exclude extension.* templates', () => {
  test('isGalleryTemplate returns false for any templateType starting with "extension."', () => {
    const extension = { templateType: 'extension.ai.agent' } as User;
    const future = { templateType: 'extension.mcp.server' } as User;
    expect(isGalleryTemplate(extension)).toBe(false);
    expect(isGalleryTemplate(future)).toBe(false);
  });

  test('isGalleryTemplate returns true for standard templates (no templateType)', () => {
    const standard = { templateType: undefined } as unknown as User;
    const nullish = { templateType: null } as unknown as User;
    const missing = {} as User;
    expect(isGalleryTemplate(standard)).toBe(true);
    expect(isGalleryTemplate(nullish)).toBe(true);
    expect(isGalleryTemplate(missing)).toBe(true);
  });

  test('isGalleryTemplate returns true for non-extension templateType values', () => {
    // Defensive: values that just happen to start with "extension" (no dot)
    // are not in our namespace and should stay in the gallery.
    const sneaky = { templateType: 'extensionless' } as User;
    expect(isGalleryTemplate(sneaky)).toBe(true);
  });

  test('filterGalleryTemplates drops all extension.* entries', () => {
    const input = [
      { title: 'a', templateType: 'extension.ai.agent' },
      { title: 'b' },
      { title: 'c', templateType: 'extension.mcp.server' },
      { title: 'd', templateType: null },
    ] as unknown as User[];
    const result = filterGalleryTemplates(input);
    expect(result.map((u) => u.title)).toEqual(['b', 'd']);
  });

  test('unsortedUsers contains no templateType starting with "extension."', () => {
    const leaked = unsortedUsers.filter((u) =>
      u.templateType?.startsWith('extension.')
    );
    expect(leaked).toEqual([]);
  });

  test('sortedUsers contains no templateType starting with "extension."', () => {
    const leaked = sortedUsers.filter((u) =>
      u.templateType?.startsWith('extension.')
    );
    expect(leaked).toEqual([]);
  });
});

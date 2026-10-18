import {
  formatDayIn,
  formatShortDayIn,
  translator,
  type Dictionary,
} from '@/core/i18n/i18n';
import { Language } from '@/core/preferences/preferences-slice';
import { en } from '@/core/i18n/strings/en';
import { vi } from '@/core/i18n/strings/vi';

/** Every path to a string or a list, e.g. `home.title`. */
function keysOf(node: unknown, prefix = ''): string[] {
  if (typeof node === 'string' || Array.isArray(node)) {
    return [prefix];
  }
  return Object.entries(node as Record<string, unknown>).flatMap(
    ([key, value]) => keysOf(value, prefix ? `${prefix}.${key}` : key),
  );
}

test('Vietnamese has every key English has, and nothing else', () => {
  expect(keysOf(vi).sort()).toEqual(keysOf(en).sort());
});

test('no translation is left empty', () => {
  const empty = (dict: Dictionary) =>
    keysOf(dict).filter(key => {
      const value = key
        .split('.')
        .reduce<unknown>(
          (node, part) => (node as Record<string, unknown>)[part],
          dict,
        );
      return Array.isArray(value) ? value.some(item => !item) : !value;
    });
  expect(empty(en)).toEqual([]);
  expect(empty(vi)).toEqual([]);
});

test('fills the values a string names', () => {
  const t = translator(Language.English);
  expect(t('search.removeLeg', { number: 2 })).toBe('Remove leg 2');
  expect(
    translator(Language.Vietnamese)('search.removeLeg', { number: 2 }),
  ).toBe('Xoá chặng #2');
  // A value the caller forgot stays visible instead of vanishing.
  expect(t('search.removeLeg')).toBe('Remove leg {number}');
});

test('writes dates the way each language does', () => {
  expect(formatDayIn(translator(Language.English), '2026-10-20')).toBe(
    '20 Oct 2026',
  );
  expect(formatDayIn(translator(Language.Vietnamese), '2026-10-20')).toBe(
    '20 Th10, 2026',
  );
  expect(formatShortDayIn(translator(Language.English), '2026-10-20')).toBe(
    '20 Oct',
  );
  expect(formatShortDayIn(translator(Language.Vietnamese), '2026-10-20')).toBe(
    '20 Th10',
  );
});

test('hands out one translator per language', () => {
  expect(translator(Language.Vietnamese)).toBe(translator(Language.Vietnamese));
  expect(translator(Language.Vietnamese).language).toBe(Language.Vietnamese);
});

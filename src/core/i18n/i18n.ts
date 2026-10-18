import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  selectLanguage,
  type Language,
} from '@/core/preferences/preferences-slice';
import { fromDayKey } from '@/core/utils/date';
import { en } from './strings/en';
import { vi } from './strings/vi';

/** The shape every language fills in: English's keys, any wording. */
type Widen<T> = T extends string
  ? string
  : T extends readonly string[]
  ? readonly string[]
  : { [K in keyof T]: Widen<T[K]> };
export type Dictionary = Widen<typeof en>;

/** `'home.title'`, `'search.find'`: every string, never the date lists. */
type Paths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends readonly string[]
    ? never
    : Paths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];
export type TranslationKey = Paths<Dictionary>;

export type TranslateParams = Record<string, string | number>;

/** What a screen gets from `useT()`: the wording and the date names for the language on screen. */
export type Translate = ((
  key: TranslationKey,
  params?: TranslateParams,
) => string) & {
  language: Language;
  dict: Dictionary;
};

const DICTIONARIES: Record<Language, Dictionary> = { en, vi };

const fill = (template: string, params?: TranslateParams) =>
  params
    ? template.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in params ? String(params[name]) : match,
      )
    : template;

function lookup(dict: Dictionary, key: TranslationKey): string {
  let node: unknown = dict;
  for (const part of key.split('.')) {
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : key;
}

const cache = new Map<Language, Translate>();

/** The translator for a language, for code outside components. */
export function translator(language: Language): Translate {
  const cached = cache.get(language);
  if (cached) {
    return cached;
  }
  const dict = DICTIONARIES[language];
  const t = Object.assign(
    (key: TranslationKey, params?: TranslateParams) =>
      fill(lookup(dict, key), params),
    { language, dict },
  );
  cache.set(language, t);
  return t;
}

/** The translator for the language the member chose. */
export function useT(): Translate {
  const language = useSelector(selectLanguage);
  return useMemo(() => translator(language), [language]);
}

/** "Oct 20, 2026" or "20 Th10, 2026" for a `YYYY-MM-DD` day. */
export function formatDayIn(t: Translate, day: string): string {
  const date = fromDayKey(day);
  return t('date.day', {
    month: t.dict.date.monthsShort[date.getMonth()],
    day: date.getDate(),
    year: date.getFullYear(),
  });
}

/** "Oct 20" or "20 Th10". */
export function formatShortDayIn(t: Translate, day: string): string {
  const date = fromDayKey(day);
  return t('date.shortDay', {
    month: t.dict.date.monthsShort[date.getMonth()],
    day: date.getDate(),
  });
}

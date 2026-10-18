import {
  FADE_BAND,
  HYSTERESIS,
  collapseAt,
  nextCollapsed,
  type FormBox,
} from '@/features/dashboard/presentation/collapsible-search-motion';

// A form from 100 to 500 in the scroll content: the pill takes over at 452.
const FORM: FormBox = { top: 100, bottom: 500 };
const AT = FORM.bottom - FADE_BAND;

describe('collapsing', () => {
  test('the pill takes over once the form has nearly left the screen', () => {
    expect(collapseAt(FORM)).toBe(AT);
    expect(nextCollapsed(AT - 1, FORM, false)).toBe(false);
    expect(nextCollapsed(AT, FORM, false)).toBe(true);
  });

  test('does not flicker when the page hovers at the edge', () => {
    // Back a little past the edge: the pill stays.
    expect(nextCollapsed(AT - HYSTERESIS + 1, FORM, true)).toBe(true);
    // Back far enough: the form returns.
    expect(nextCollapsed(AT - HYSTERESIS, FORM, true)).toBe(false);
    // On the way down the same offset still shows the form.
    expect(nextCollapsed(AT - HYSTERESIS + 1, FORM, false)).toBe(false);
  });

  test('never collapses before the form is measured', () => {
    expect(nextCollapsed(10_000, { top: 0, bottom: 0 }, true)).toBe(false);
  });

  test('a short form still has an offset to collapse at', () => {
    expect(collapseAt({ top: 0, bottom: 20 })).toBe(1);
  });
});

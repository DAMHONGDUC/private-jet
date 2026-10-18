import {
  EXPAND_DRAG,
  FADE_BAND,
  HYSTERESIS,
  collapseAt,
  nextCollapsed,
  onDragEnd,
  onGlideEnd,
  settleTarget,
  type FormBox,
} from '@/features/dashboard/presentation/collapsible-search-motion';

// A form from 100 to 500 in the scroll content: the pill takes over at 452.
const FORM: FormBox = { top: 100, bottom: 500 };
const AT = FORM.bottom - FADE_BAND;

const drag = (
  from: number,
  to: number,
  velocity = 0,
  glideCancelsScroll = false,
) => onDragEnd({ from, to, velocity, form: FORM, glideCancelsScroll });

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

describe('letting go', () => {
  test('a form left half hidden settles on the nearer end', () => {
    expect(settleTarget(200, FORM)).toBe(FORM.top);
    expect(settleTarget(400, FORM)).toBe(FORM.bottom);
    expect(drag(150, 200)).toEqual({
      scrollTo: FORM.top,
      expandAfterGlide: false,
    });
    expect(drag(300, 400)).toEqual({
      scrollTo: FORM.bottom,
      expandAfterGlide: false,
    });
  });

  test('a form fully in view or fully away is left where it is', () => {
    expect(settleTarget(FORM.top, FORM)).toBeNull();
    expect(settleTarget(50, FORM)).toBeNull();
    expect(settleTarget(FORM.bottom, FORM)).toBeNull();
    expect(settleTarget(1200, FORM)).toBeNull();
  });

  test('a glide is left to finish before settling', () => {
    expect(drag(150, 200, 1.5)).toEqual({
      scrollTo: null,
      expandAfterGlide: false,
    });
    expect(onGlideEnd(400, FORM, false)).toBe(FORM.bottom);
  });
});

describe('expanding', () => {
  test('a drag back up from the pill scrolls to the top', () => {
    expect(drag(1200, 1200 - EXPAND_DRAG)).toEqual({
      scrollTo: 0,
      expandAfterGlide: false,
    });
  });

  test('a short drag back up keeps the pill', () => {
    expect(drag(1200, 1200 - EXPAND_DRAG + 1)).toEqual({
      scrollTo: null,
      expandAfterGlide: false,
    });
  });

  test('a drag up that started with the form in view does not jump to the top', () => {
    expect(drag(AT - 1, 100).scrollTo).not.toBe(0);
  });

  test('a flick up scrolls to the top at once where a glide allows it', () => {
    expect(drag(1200, 1100, -2)).toEqual({
      scrollTo: 0,
      expandAfterGlide: false,
    });
  });

  test('where a glide would cancel the scroll, it waits for the glide to end', () => {
    expect(drag(1200, 1100, -2, true)).toEqual({
      scrollTo: null,
      expandAfterGlide: true,
    });
    expect(onGlideEnd(700, FORM, true)).toBe(0);
  });

  test('a drag down never expands', () => {
    expect(drag(1200, 1300).scrollTo).toBeNull();
  });
});

// The rules behind the collapsible search, kept apart from the hook so they
// run the same on the UI thread and in tests.

/** The form starts fading this far before the pill takes its place. */
export const FADE_BAND = 48;
/** Scrolling back this far past the collapse point brings the form back, so the pill does not flicker at the edge. */
export const HYSTERESIS = 12;
/** How long the pill takes to come in or go. */
export const PILL_DURATION = 220;

/** Where the form sits in the scroll content. */
export type FormBox = { top: number; bottom: number };

/** The offset at which the pill takes the form's place. */
export function collapseAt(form: FormBox) {
  'worklet';
  return Math.max(form.bottom - FADE_BAND, 1);
}

/** Whether the pill shows at `y`, given whether it showed before. */
export function nextCollapsed(y: number, form: FormBox, wasCollapsed: boolean) {
  'worklet';
  if (form.bottom <= 0) {
    return false;
  }
  const at = collapseAt(form);
  if (y >= at) {
    return true;
  }
  return wasCollapsed && y > at - HYSTERESIS;
}

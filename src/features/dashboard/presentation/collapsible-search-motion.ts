// The rules behind the collapsible search, kept apart from the hook so they
// run the same on the UI thread and in tests.

/** How far a drag back up must go before the full form comes back. */
export const EXPAND_DRAG = 24;
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

/**
 * Where to settle when a drag stops in the band where the form has faded
 * but the pill is not fully in, or null anywhere else. Only that band
 * snaps, to its nearer edge, so a short scroll is never pulled back.
 */
export function settleTarget(y: number, form: FormBox): number | null {
  'worklet';
  const start = collapseAt(form) - FADE_BAND;
  const end = form.bottom;
  if (y <= start + 1 || y >= end - 1) {
    return null;
  }
  return y - start < (end - start) / 2 ? start : end;
}

export type DragEnd = {
  /** Where the drag started and ended. */
  from: number;
  to: number;
  /** The glide the finger left; 0 when it lifted still. */
  velocity: number;
  form: FormBox;
  /** Android drops a programmatic scroll started during a glide. */
  glideCancelsScroll: boolean;
};

/**
 * What to do when the finger lifts: scroll somewhere now, wait for the
 * glide to end before scrolling to the top, or nothing.
 */
export function onDragEnd({
  from,
  to,
  velocity,
  form,
  glideCancelsScroll,
}: DragEnd): { scrollTo: number | null; expandAfterGlide: boolean } {
  'worklet';
  const gliding = velocity !== 0;
  const wentUp = from - to >= EXPAND_DRAG;
  if (wentUp && from >= collapseAt(form)) {
    // A drag back up from the pill asks for the whole form.
    if (gliding && glideCancelsScroll) {
      return { scrollTo: null, expandAfterGlide: true };
    }
    return { scrollTo: 0, expandAfterGlide: false };
  }
  return {
    scrollTo: gliding ? null : settleTarget(to, form),
    expandAfterGlide: false,
  };
}

/** What to do when a glide comes to rest. */
export function onGlideEnd(
  y: number,
  form: FormBox,
  expandAfterGlide: boolean,
): number | null {
  'worklet';
  return expandAfterGlide ? 0 : settleTarget(y, form);
}

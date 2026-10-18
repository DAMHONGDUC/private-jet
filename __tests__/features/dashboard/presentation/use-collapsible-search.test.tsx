import { act, renderHook, waitFor } from '@testing-library/react-native';
import { scrollTo } from 'react-native-reanimated';
import {
  FADE_BAND,
  type FormBox,
} from '@/features/dashboard/presentation/collapsible-search-motion';
import { useCollapsibleSearch } from '@/features/dashboard/presentation/use-collapsible-search';

// The stock mock drops scroll handlers and reactions and hands out a new
// shared value on every render. This one keeps shared values across renders,
// returns the scroll handlers as given so a test can feed them events, and
// runs reactions when `flushReactions` is called, the way the UI thread
// would after a frame.
jest.mock('react-native-reanimated', () => {
  const { useRef } = require('react');
  const mock = jest.requireActual('react-native-reanimated/mock');
  const reactions = new Set<{
    prepare: () => unknown;
    react: (now: unknown, before: unknown) => void;
    last: unknown;
  }>();
  return {
    ...mock,
    __esModule: true,
    useSharedValue: (init: unknown) => {
      const ref = useRef(null);
      if (!ref.current) {
        ref.current = mock.useSharedValue(init);
      }
      return ref.current;
    },
    useAnimatedScrollHandler: (handlers: unknown) => handlers,
    useAnimatedReaction: (
      prepare: () => unknown,
      react: (now: unknown, before: unknown) => void,
    ) => {
      const ref = useRef(null);
      if (!ref.current) {
        ref.current = { prepare, react, last: null };
        reactions.add(ref.current);
      }
      ref.current.prepare = prepare;
      ref.current.react = react;
    },
    scrollTo: jest.fn(),
    flushReactions: () => {
      for (const reaction of reactions) {
        const now = reaction.prepare();
        if (now !== reaction.last) {
          reaction.react(now, reaction.last);
          reaction.last = now;
        }
      }
    },
  };
});

const { flushReactions } = jest.requireMock('react-native-reanimated') as {
  flushReactions: () => void;
};

// A form from 100 to 500 in the scroll content: the pill takes over at 452.
const FORM: FormBox = { top: 100, bottom: 500 };
const COLLAPSE_AT = FORM.bottom - FADE_BAND;

type Handlers = {
  onScroll: (event: { contentOffset: { y: number } }) => void;
  onEndDrag?: (event: unknown) => void;
  onMomentumEnd?: (event: unknown) => void;
};

async function setup() {
  const { result } = await renderHook(() => useCollapsibleSearch());
  await act(() => {
    result.current.onFormLayout({
      nativeEvent: {
        layout: {
          x: 0,
          y: FORM.top,
          width: 400,
          height: FORM.bottom - FORM.top,
        },
      },
    } as never);
  });
  const handlers = () => result.current.onScroll as unknown as Handlers;
  /** Scrolls to `y`, letting the drag and any glide end there. */
  const scrollToY = (y: number) =>
    act(() => {
      const event = { contentOffset: { y }, velocity: { x: 0, y: 0 } };
      handlers().onScroll(event);
      handlers().onEndDrag?.(event);
      handlers().onMomentumEnd?.(event);
      flushReactions();
    });
  return { result, scrollToY };
}

beforeEach(() => {
  jest.mocked(scrollTo).mockClear();
});

test('the pill comes in once the form has nearly scrolled away', async () => {
  const { result, scrollToY } = await setup();

  await scrollToY(COLLAPSE_AT - 1);
  expect(result.current.progress.value).toBe(0);

  await scrollToY(COLLAPSE_AT);
  expect(result.current.progress.value).toBe(1);
});

test('the pill stays pinned while the page keeps scrolling down', async () => {
  const { result, scrollToY } = await setup();

  for (const y of [COLLAPSE_AT, 800, 1200, 1600]) {
    await scrollToY(y);
    expect(result.current.progress.value).toBe(1);
  }
});

test('a short scroll up from the bottom keeps the pill and does not jump', async () => {
  const { result, scrollToY } = await setup();
  await scrollToY(1600);

  await scrollToY(1570);
  await scrollToY(1540);

  expect(result.current.progress.value).toBe(1);
  expect(scrollTo).not.toHaveBeenCalled();
});

test('scrolling never moves the page by itself, wherever it stops', async () => {
  const { scrollToY } = await setup();

  // Inside the form, in the fade band, just past the collapse point, far down.
  for (const y of [
    50,
    FORM.top + 10,
    COLLAPSE_AT - 20,
    COLLAPSE_AT + 5,
    FORM.bottom - 5,
    1200,
    300,
  ]) {
    await scrollToY(y);
  }

  expect(scrollTo).not.toHaveBeenCalled();
});

test('scrolling back to the form brings it back and lets the pill go', async () => {
  const { result, scrollToY } = await setup();
  await scrollToY(1200);

  await scrollToY(COLLAPSE_AT - 40);

  expect(result.current.progress.value).toBe(0);
});

test('only a tap on the pill goes back to the top', async () => {
  const { result, scrollToY } = await setup();
  await scrollToY(1200);

  await act(() => result.current.expand());

  // The scroll runs on the UI thread's next frame.
  await waitFor(() => expect(scrollTo).toHaveBeenCalledTimes(1));
  expect(jest.mocked(scrollTo).mock.calls[0].slice(1)).toEqual([0, 0, true]);
});

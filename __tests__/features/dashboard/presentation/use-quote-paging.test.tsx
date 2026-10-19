import { act, renderHook } from '@testing-library/react-native';
import {
  LOAD_MORE_MS,
  QUOTES_PAGE_SIZE,
  useQuotePaging,
} from '@/features/dashboard/presentation/use-quote-paging';
import type { LegQuotes } from '@/features/dashboard/domain/entities/charter';

const leg = {
  origin: 'SYD',
  destination: 'MEB',
  date: '2026-10-20',
  passengers: 2,
};
const group = (count: number): LegQuotes => ({
  leg,
  quotes: Array.from(
    { length: count },
    (_, index) => ({ id: `q${index}` } as LegQuotes['quotes'][number]),
  ),
});

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const landLoad = () => act(() => jest.advanceTimersByTime(LOAD_MORE_MS));

test('a leg loads ten more at a time, one load at a time', async () => {
  const results = [group(4), group(25)];
  const { result } = await renderHook(() => useQuotePaging(results));
  expect(result.current.limits).toEqual([4, QUOTES_PAGE_SIZE]);

  await act(() => result.current.loadMoreLeg(1));
  expect(result.current.loadingLeg).toBe(1);
  // A second request while one is on its way does nothing.
  await act(() => result.current.loadMoreLeg(1));
  await landLoad();
  expect(result.current).toMatchObject({ limits: [4, 20], loadingLeg: null });

  await act(() => result.current.loadMoreLeg(1));
  await landLoad();
  // The last page holds only the five left.
  expect(result.current.limits).toEqual([4, 25]);
});

test('starts again on new results and keeps a chosen jet in view', async () => {
  const { result, rerender } = await renderHook(
    ({
      results,
      selections,
    }: {
      results: LegQuotes[];
      selections: Record<number, string>;
    }) => useQuotePaging(results, selections),
    { initialProps: { results: [group(30)], selections: {} } },
  );
  await act(() => result.current.loadMoreLeg(0));
  await landLoad();
  expect(result.current.limits).toEqual([20]);

  await rerender({ results: [group(30)], selections: { 0: 'q14' } });
  expect(result.current.limits).toEqual([15]);
});

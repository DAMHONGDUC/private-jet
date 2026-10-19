import { useCallback, useEffect, useRef, useState } from 'react';
import type { LegQuotes } from '../domain/entities/charter';

/** How many jets each leg shows at first, and how many more each load adds. */
export const QUOTES_PAGE_SIZE = 10;
/** Stands in for a page request's round trip, so the spinner is seen. */
export const LOAD_MORE_MS = 600;

export type QuotePaging = {
  /** How many jets to show for each leg. */
  limits: number[];
  /** The leg whose next page is on its way, if any. */
  loadingLeg: number | null;
  /** Loads the next page of the given leg; does nothing while a load is on its way. */
  loadMoreLeg: (legIndex: number) => void;
};

type Pages = {
  results: LegQuotes[] | undefined;
  counts: number[];
  loadingLeg: number | null;
};

/**
 * Pages the jets of each leg, ten at a time, one load at a time. New results
 * start again from the first page, and a chosen jet always stays in view.
 */
export function useQuotePaging(
  results: LegQuotes[] | undefined,
  selections: Record<number, string> = {},
): QuotePaging {
  const [pages, setPages] = useState<Pages>({
    results,
    counts: [],
    loadingLeg: null,
  });
  // A new search resets the pages during render, without a frame of stale counts.
  const current: Pages =
    pages.results === results
      ? pages
      : { results, counts: [], loadingLeg: null };
  if (pages.results !== results) {
    setPages(current);
  }

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  const limits = (results ?? []).map((group, index) => {
    const paged = (current.counts[index] ?? 1) * QUOTES_PAGE_SIZE;
    const chosen = group.quotes.findIndex(
      quote => quote.id === selections[index],
    );
    return Math.min(group.quotes.length, Math.max(paged, chosen + 1));
  });

  const loading = current.loadingLeg !== null;
  const loadMoreLeg = useCallback(
    (legIndex: number) => {
      if (loading) {
        return;
      }
      setPages(now => ({ ...now, loadingLeg: legIndex }));
      timer.current = setTimeout(() => {
        timer.current = null;
        // A search that changed meanwhile has its own pages; this load is not one of them.
        setPages(now => {
          if (now.results !== results) {
            return now;
          }
          const counts = [...now.counts];
          counts[legIndex] = (counts[legIndex] ?? 1) + 1;
          return { ...now, counts, loadingLeg: null };
        });
      }, LOAD_MORE_MS);
    },
    [loading, results],
  );

  return { limits, loadingLeg: current.loadingLeg, loadMoreLeg };
}

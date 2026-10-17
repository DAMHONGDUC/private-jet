import { skipToken } from '@reduxjs/toolkit/query';
import { useSelector } from 'react-redux';
import type { CharterRequest, JetQuote, LegQuotes } from '../domain/entities/charter';
import { selectQuoteSelections, selectSubmittedCharter } from './charter-search-slice';
import { useSearchChartersQuery } from './dashboard-api';

export type CharterSelection = {
  request: CharterRequest | null;
  results: LegQuotes[] | undefined;
  /** The chosen quote per leg, undefined where none is chosen yet. */
  chosen: (JetQuote | undefined)[];
  chosenCount: number;
  /** Every leg has a jet. */
  complete: boolean;
  total: number;
  currency: string;
};

/** The search on screen, its quotes (from the RTK Query cache) and the jets chosen so far. */
export function useCharterSelection(): CharterSelection {
  const request = useSelector(selectSubmittedCharter);
  const selections = useSelector(selectQuoteSelections);
  const { currentData: results } = useSearchChartersQuery(request ?? skipToken);

  const chosen = (results ?? []).map((group, index) => group.quotes.find(quote => quote.id === selections[index]));
  const picked = chosen.filter((quote): quote is JetQuote => !!quote);

  return {
    request,
    results,
    chosen,
    chosenCount: picked.length,
    complete: !!results && results.length > 0 && picked.length === results.length,
    total: picked.reduce((sum, quote) => sum + quote.price, 0),
    currency: picked[0]?.currency ?? 'EUR',
  };
}

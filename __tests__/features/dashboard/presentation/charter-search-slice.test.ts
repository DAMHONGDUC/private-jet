import {
  MAX_RECENT_AIRPORTS,
  airportSelected,
  airportsSwapped,
  charterSearchSlice,
  dateSelected,
  legAdded,
  legRemoved,
  passengersSelected,
  quoteChosen,
  quoteToggled,
  searchSubmitted,
  tripTypeSelected,
  type CharterSearchState,
} from '@/features/dashboard/presentation/charter-search-slice';
import { checkDraft } from '@/features/dashboard/domain/entities/charter';
import type { UnknownAction } from '@reduxjs/toolkit';

const reduce = (actions: UnknownAction[], state?: CharterSearchState) =>
  actions.reduce(
    charterSearchSlice.reducer,
    state ?? charterSearchSlice.reducer(undefined, { type: '@@init' }),
  );

const filled = () =>
  reduce([
    airportSelected({ target: 'outbound', end: 'origin', code: 'GVA' }),
    airportSelected({ target: 'outbound', end: 'destination', code: 'NCE' }),
    dateSelected({ target: 'outbound', date: '2026-10-20' }),
    passengersSelected({ target: 'outbound', count: 2 }),
  ]);

test('fills the outbound leg, swaps it and keeps the passengers in range', () => {
  const state = reduce(
    [
      airportsSwapped('outbound'),
      passengersSelected({ target: 'outbound', count: 40 }),
    ],
    filled(),
  );

  expect(state.draft.outbound).toEqual({
    origin: 'NCE',
    destination: 'GVA',
    date: '2026-10-20',
    passengers: 16,
  });
});

test('remembers recent airports, newest first and without repeats', () => {
  const codes = ['HEL', 'LBG', 'FAB', 'NCE', 'GVA', 'DXB', 'HEL'];
  const state = reduce(
    codes.map(code =>
      airportSelected({ target: 'outbound', end: 'origin', code }),
    ),
  );

  expect(state.recentAirports).toEqual(['HEL', 'DXB', 'GVA', 'NCE', 'FAB']);
  expect(state.recentAirports).toHaveLength(MAX_RECENT_AIRPORTS);
});

test('a new trip type starts the form over and drops the results', () => {
  const searched = reduce(
    [searchSubmitted(checkDraft(filled().draft).request!)],
    filled(),
  );

  const state = reduce([tripTypeSelected('multiCity')], searched);

  expect(state.submitted).toBeNull();
  expect(state.draft.outbound.origin).toBeNull();
  expect(state.draft.legs).toHaveLength(1);
});

test('a multi-city leg starts where the last one lands and the last leg stays', () => {
  let state = reduce([
    tripTypeSelected('multiCity'),
    airportSelected({ target: 0, end: 'destination', code: 'NCE' }),
    passengersSelected({ target: 0, count: 3 }),
    legAdded(),
  ]);
  expect(state.draft.legs[1]).toEqual({
    origin: 'NCE',
    destination: null,
    date: null,
    passengers: 3,
  });

  state = reduce([legRemoved(0), legRemoved(0)], state);
  expect(state.draft.legs).toHaveLength(1);
});

test('remembers one jet per leg, toggles it off, and forgets them on a new search', () => {
  const request = checkDraft(filled().draft).request!;
  let state = reduce(
    [
      searchSubmitted(request),
      quoteToggled({ legIndex: 0, quoteId: 'a' }),
      quoteChosen({ legIndex: 1, quoteId: 'b' }),
    ],
    filled(),
  );
  expect(state.selections).toEqual({ 0: 'a', 1: 'b' });

  state = reduce([quoteToggled({ legIndex: 0, quoteId: 'a' })], state);
  expect(state.selections).toEqual({ 1: 'b' });

  state = reduce([searchSubmitted(request)], state);
  expect(state.selections).toEqual({});
});

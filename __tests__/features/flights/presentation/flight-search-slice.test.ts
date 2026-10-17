import {
  MAX_RECENT_SEARCHES,
  airportsSwapped,
  destinationSelected,
  flightSearchSlice,
  originSelected,
  passengersChanged,
  searchSubmitted,
  selectFlightSearchParams,
  timeSelected,
  type FlightSearchState,
} from '@/features/flights/presentation/flight-search-slice';

const reduce = flightSearchSlice.reducer;
const initial = () => reduce(undefined, { type: 'init' });

test('picking the airport already on the other end swaps the two', () => {
  let state = reduce(initial(), originSelected('HEL'));
  state = reduce(state, destinationSelected('GVA'));
  state = reduce(state, originSelected('GVA'));

  expect(state).toMatchObject({ origin: 'GVA', destination: 'HEL' });
  expect(reduce(state, airportsSwapped())).toMatchObject({ origin: 'HEL', destination: 'GVA' });
});

test('keeps passengers between 1 and the booking maximum', () => {
  expect(reduce(initial(), passengersChanged(0)).passengers).toBe(1);
  expect(reduce(initial(), passengersChanged(99)).passengers).toBe(8);
});

test('remembers the last searches, newest first and without duplicates', () => {
  let state: FlightSearchState = initial();
  for (const code of ['HEL', 'GVA', 'HEL', 'NCE', 'FAB']) {
    state = reduce(reduce(state, originSelected(code)), searchSubmitted());
  }

  expect(state.recent.map(item => item.origin)).toEqual(['FAB', 'NCE', 'HEL']);
  expect(state.recent).toHaveLength(MAX_RECENT_SEARCHES);
});

test('turns the form into search params, leaving out what is "any"', () => {
  const state = reduce(reduce(initial(), destinationSelected('DXB')), timeSelected('morning'));

  expect(selectFlightSearchParams({ flightSearch: state })).toEqual({
    destination: 'DXB',
    time: 'morning',
    passengers: 1,
  });
});

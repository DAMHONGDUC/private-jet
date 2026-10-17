import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  MAX_SEARCH_PASSENGERS,
  type DepartureWindow,
  type FlightSearchParams,
  type JetCategory,
} from '../domain/entities/flight';

/** One search as the form holds it; `null` means any. */
export type SearchCriteria = {
  origin: string | null;
  destination: string | null;
  /** `YYYY-MM-DD`, local. */
  date: string | null;
  time: DepartureWindow | null;
  passengers: number;
  category: JetCategory | null;
};

/** UI state only: the search form and the last searches. The flights live in RTK Query. */
export type FlightSearchState = SearchCriteria & { recent: SearchCriteria[] };

export const MAX_RECENT_SEARCHES = 3;

const emptyCriteria: SearchCriteria = {
  origin: null,
  destination: null,
  date: null,
  time: null,
  passengers: 1,
  category: null,
};

const initialState: FlightSearchState = { ...emptyCriteria, recent: [] };

const criteriaOf = ({ origin, destination, date, time, passengers, category }: FlightSearchState): SearchCriteria => ({
  origin,
  destination,
  date,
  time,
  passengers,
  category,
});

const sameCriteria = (a: SearchCriteria, b: SearchCriteria) =>
  a.origin === b.origin &&
  a.destination === b.destination &&
  a.date === b.date &&
  a.time === b.time &&
  a.passengers === b.passengers &&
  a.category === b.category;

export const flightSearchSlice = createSlice({
  name: 'flightSearch',
  initialState,
  reducers: {
    /** Picking the airport already on the other end swaps the two. */
    originSelected(state, action: PayloadAction<string | null>) {
      if (action.payload && action.payload === state.destination) {
        state.destination = state.origin;
      }
      state.origin = action.payload;
    },
    destinationSelected(state, action: PayloadAction<string | null>) {
      if (action.payload && action.payload === state.origin) {
        state.origin = state.destination;
      }
      state.destination = action.payload;
    },
    airportsSwapped(state) {
      [state.origin, state.destination] = [state.destination, state.origin];
    },
    dateSelected(state, action: PayloadAction<string | null>) {
      state.date = action.payload;
    },
    timeSelected(state, action: PayloadAction<DepartureWindow | null>) {
      state.time = action.payload;
    },
    passengersChanged(state, action: PayloadAction<number>) {
      state.passengers = Math.min(MAX_SEARCH_PASSENGERS, Math.max(1, Math.round(action.payload)));
    },
    categorySelected(state, action: PayloadAction<JetCategory | null>) {
      state.category = action.payload;
    },
    /** Puts the current search first in the recent list, without duplicates. */
    searchSubmitted(state) {
      const current = criteriaOf(state);
      state.recent = [current, ...state.recent.filter(item => !sameCriteria(item, current))].slice(
        0,
        MAX_RECENT_SEARCHES,
      );
    },
    recentSearchApplied(state, action: PayloadAction<SearchCriteria>) {
      Object.assign(state, action.payload);
    },
    searchCleared(state) {
      Object.assign(state, emptyCriteria);
    },
  },
});

export const {
  originSelected,
  destinationSelected,
  airportsSwapped,
  dateSelected,
  timeSelected,
  passengersChanged,
  categorySelected,
  searchSubmitted,
  recentSearchApplied,
  searchCleared,
} = flightSearchSlice.actions;

type WithSearch = { [flightSearchSlice.name]: FlightSearchState };

export const selectFlightSearch = (state: WithSearch) => state.flightSearch;

/** The form as search params; memoised so the query hook sees a stable object. */
export const selectFlightSearchParams = createSelector(
  selectFlightSearch,
  ({ origin, destination, date, time, passengers, category }): FlightSearchParams => ({
    ...(origin ? { origin } : {}),
    ...(destination ? { destination } : {}),
    ...(date ? { date } : {}),
    ...(time ? { time } : {}),
    passengers,
    ...(category ? { category } : {}),
  }),
);

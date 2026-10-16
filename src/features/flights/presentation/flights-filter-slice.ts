import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FlightSearchParams, JetCategory } from '../domain/entities/flight';

/** UI state only: which filters are chosen. The flights live in RTK Query. */
export type FlightsFilterState = {
  origin: string | null;
  category: JetCategory | null;
};

const initialState: FlightsFilterState = { origin: null, category: null };

export const flightsFilterSlice = createSlice({
  name: 'flightsFilter',
  initialState,
  reducers: {
    originToggled(state, action: PayloadAction<string>) {
      state.origin = state.origin === action.payload ? null : action.payload;
    },
    categoryToggled(state, action: PayloadAction<JetCategory>) {
      state.category = state.category === action.payload ? null : action.payload;
    },
    filtersCleared() {
      return initialState;
    },
  },
});

export const { originToggled, categoryToggled, filtersCleared } = flightsFilterSlice.actions;

type WithFilter = { [flightsFilterSlice.name]: FlightsFilterState };

export const selectFlightsFilter = (state: WithFilter) => state.flightsFilter;

/** The filters as search params; memoised so the query hook sees a stable object. */
export const selectFlightSearchParams = createSelector(
  selectFlightsFilter,
  ({ origin, category }): FlightSearchParams => ({
    ...(origin ? { origin } : {}),
    ...(category ? { category } : {}),
  }),
);

import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  MAX_CHARTER_PASSENGERS,
  MAX_MULTI_CITY_LEGS,
  checkDraft,
  emptyDraftLeg,
  type CharterDraft,
  type CharterRequest,
  type DraftLeg,
  type TripType,
} from '../domain/entities/charter';

/** Which leg a field belongs to: the one-way/round-trip outbound, or a multi-city leg by index. */
export type LegTarget = 'outbound' | number;
export type AirportEnd = 'origin' | 'destination';

/** UI state only: the form, the search it last ran and recent airports. Quotes live in RTK Query. */
export type CharterSearchState = {
  draft: CharterDraft;
  /** The request whose results are on screen; null before the first search. */
  submitted: CharterRequest | null;
  /** IATA codes, most recent first. */
  recentAirports: string[];
};

export const MAX_RECENT_AIRPORTS = 5;

const freshDraft = (tripType: TripType): CharterDraft => ({
  tripType,
  outbound: emptyDraftLeg(),
  returnDate: null,
  legs: tripType === 'multiCity' ? [emptyDraftLeg()] : [],
});

const initialState: CharterSearchState = { draft: freshDraft('oneWay'), submitted: null, recentAirports: [] };

function legOf(draft: CharterDraft, target: LegTarget): DraftLeg | undefined {
  return target === 'outbound' ? draft.outbound : draft.legs[target];
}

export const charterSearchSlice = createSlice({
  name: 'charterSearch',
  initialState,
  reducers: {
    /** Starts the form over, as the original does, and clears the results. */
    tripTypeSelected(state, action: PayloadAction<TripType>) {
      if (action.payload !== state.draft.tripType) {
        state.draft = freshDraft(action.payload);
        state.submitted = null;
      }
    },
    airportSelected(state, action: PayloadAction<{ target: LegTarget; end: AirportEnd; code: string }>) {
      const { target, end, code } = action.payload;
      const leg = legOf(state.draft, target);
      if (!leg) {
        return;
      }
      leg[end] = code;
      state.recentAirports = [code, ...state.recentAirports.filter(item => item !== code)].slice(
        0,
        MAX_RECENT_AIRPORTS,
      );
    },
    airportsSwapped(state, action: PayloadAction<LegTarget>) {
      const leg = legOf(state.draft, action.payload);
      if (leg) {
        [leg.origin, leg.destination] = [leg.destination, leg.origin];
      }
    },
    dateSelected(state, action: PayloadAction<{ target: LegTarget; date: string }>) {
      const leg = legOf(state.draft, action.payload.target);
      if (leg) {
        leg.date = action.payload.date;
      }
    },
    returnDateSelected(state, action: PayloadAction<string>) {
      state.draft.returnDate = action.payload;
    },
    passengersSelected(state, action: PayloadAction<{ target: LegTarget; count: number }>) {
      const leg = legOf(state.draft, action.payload.target);
      if (leg) {
        leg.passengers = Math.min(MAX_CHARTER_PASSENGERS, Math.max(1, Math.round(action.payload.count)));
      }
    },
    /** A new leg starts where the last one lands, with the same party. */
    legAdded(state) {
      const { legs } = state.draft;
      if (legs.length >= MAX_MULTI_CITY_LEGS) {
        return;
      }
      const last = legs[legs.length - 1];
      legs.push({ ...emptyDraftLeg(), origin: last?.destination ?? null, passengers: last?.passengers ?? 0 });
    },
    /** The last remaining leg stays. */
    legRemoved(state, action: PayloadAction<number>) {
      if (state.draft.legs.length > 1) {
        state.draft.legs.splice(action.payload, 1);
      }
    },
    searchSubmitted(state, action: PayloadAction<CharterRequest>) {
      state.submitted = action.payload;
    },
  },
});

export const {
  tripTypeSelected,
  airportSelected,
  airportsSwapped,
  dateSelected,
  returnDateSelected,
  passengersSelected,
  legAdded,
  legRemoved,
  searchSubmitted,
} = charterSearchSlice.actions;

type WithCharterSearch = { [charterSearchSlice.name]: CharterSearchState };

export const selectCharterSearch = (state: WithCharterSearch) => state.charterSearch;
export const selectCharterDraft = (state: WithCharterSearch) => state.charterSearch.draft;
export const selectSubmittedCharter = (state: WithCharterSearch) => state.charterSearch.submitted;

/** True when the form no longer matches the results on screen, so searching again would change them. */
export const selectDraftChanged = createSelector(
  selectCharterDraft,
  selectSubmittedCharter,
  (draft, submitted) =>
    submitted !== null && JSON.stringify(checkDraft(draft).request ?? null) !== JSON.stringify(submitted),
);

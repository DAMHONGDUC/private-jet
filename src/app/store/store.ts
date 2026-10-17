import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/core/store/base-api';
import { charterSearchSlice } from '@/features/dashboard/presentation/charter-search-slice';
import { flightSearchSlice } from '@/features/flights/presentation/flight-search-slice';
import type { AppDependencies } from '../di/container';

type StoreOptions = {
  /**
   * RTK batches subscriber notifications per animation frame by default.
   * Tests pass 'tick' so notifications land inside React's act().
   */
  autoBatch?: 'raf' | 'tick';
};

/** A store per call, so tests get their own cache and their own mock data. */
export function createAppStore(dependencies: AppDependencies, { autoBatch = 'raf' }: StoreOptions = {}) {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      [flightSearchSlice.name]: flightSearchSlice.reducer,
      [charterSearchSlice.name]: charterSearchSlice.reducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ thunk: { extraArgument: dependencies } }).concat(baseApi.middleware),
    enhancers: getDefaultEnhancers => getDefaultEnhancers({ autoBatch: { type: autoBatch } }),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

import { configureStore } from '@reduxjs/toolkit';
import { preferencesSlice } from '@/core/preferences/preferences-slice';
import { baseApi } from '@/core/store/base-api';
import { sessionSlice } from '@/features/auth/presentation/session-slice';
import { charterSearchSlice } from '@/features/dashboard/presentation/charter-search-slice';
import { settingsSlice } from '@/features/profile/presentation/settings-slice';
import type { AppDependencies } from '../di/container';

type StoreOptions = {
  /**
   * RTK batches subscriber notifications per animation frame by default.
   * Tests pass 'tick' so notifications land inside React's act().
   */
  autoBatch?: 'raf' | 'tick';
};

/** A store per call, so tests get their own cache and their own mock data. */
export function createAppStore(
  dependencies: AppDependencies,
  { autoBatch = 'raf' }: StoreOptions = {},
) {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      [charterSearchSlice.name]: charterSearchSlice.reducer,
      [sessionSlice.name]: sessionSlice.reducer,
      [settingsSlice.name]: settingsSlice.reducer,
      [preferencesSlice.name]: preferencesSlice.reducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ thunk: { extraArgument: dependencies } }).concat(
        baseApi.middleware,
      ),
    enhancers: getDefaultEnhancers =>
      getDefaultEnhancers({ autoBatch: { type: autoBatch } }),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

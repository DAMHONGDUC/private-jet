import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { createDependencies, type AppDependencies } from '@/app/di/container';
import { createAppStore, type AppStore } from '@/app/store/store';
import { baseApi } from '@/core/store/base-api';

/** A fixed "now" so mock dates, upcoming filters and the chart are stable. */
export const TEST_NOW = new Date('2026-10-16T08:00:00.000Z');

export function createTestDependencies(): AppDependencies {
  return createDependencies({ latencyMs: 0, now: () => TEST_NOW, random: () => 0 });
}

const stores: AppStore[] = [];

export function createTestStore(dependencies = createTestDependencies()): AppStore {
  const store = createAppStore(dependencies, { autoBatch: 'tick' });
  stores.push(store);
  return store;
}

/** Clears every test store's cache, and with it RTK Query's removal timers. */
export function resetTestStores() {
  stores.splice(0).forEach(store => store.dispatch(baseApi.util.resetApiState()));
}

export async function renderWithStore(ui: ReactElement, store = createTestStore()) {
  const utils = await render(<Provider store={store}>{ui}</Provider>);
  return { ...utils, store };
}

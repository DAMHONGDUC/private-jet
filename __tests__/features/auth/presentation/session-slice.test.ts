import { createDependencies } from '@/app/di/container';
import { AppErrorCode, DomainError } from '@/core/error/app-error';
import { baseApi } from '@/core/store/base-api';
import { runQuery } from '@/core/query/run-query';
import { authApi } from '@/features/auth/presentation/auth-api';
import {
  SessionStatus,
  selectSession,
} from '@/features/auth/presentation/session-slice';
import { createTestStore } from '@test-utils/test-store';

/** An endpoint whose backend answers 401, as the HTTP client reports it. */
const probeApi = baseApi.injectEndpoints({
  endpoints: build => ({
    sessionProbe: build.query<null, void>({
      queryFn: () =>
        runQuery(async () => {
          throw new DomainError(AppErrorCode.Unauthorized, 'Expired.');
        }),
    }),
  }),
});

async function signedInStore() {
  const store = createTestStore();
  await store.dispatch(authApi.endpoints.restoreSession.initiate());
  expect(selectSession(store.getState()).status).toBe(SessionStatus.SignedIn);
  return store;
}

test('a 401 from any endpoint signs the member out', async () => {
  const store = await signedInStore();

  await store.dispatch(probeApi.endpoints.sessionProbe.initiate());

  expect(selectSession(store.getState())).toEqual({
    status: SessionStatus.SignedOut,
    user: null,
  });
});

test('a wrong password at sign-in leaves the session alone', async () => {
  const store = await signedInStore();

  await store.dispatch(
    authApi.endpoints.signIn.initiate({
      email: 'demo@blackjet.app',
      password: 'not-the-password',
    }),
  );

  expect(selectSession(store.getState()).status).toBe(SessionStatus.SignedIn);
});

test('the app gaining focus during the launch check keeps the splash up', async () => {
  // A slow check, so the focus lands while it still runs.
  const store = createTestStore(createDependencies({ latencyMs: 50 }));

  const launch = store.dispatch(authApi.endpoints.restoreSession.initiate());
  store.dispatch(baseApi.internalActions.onFocus());

  expect(selectSession(store.getState()).status).toBe(SessionStatus.Restoring);
  await launch;
  expect(selectSession(store.getState()).status).toBe(SessionStatus.SignedIn);
});

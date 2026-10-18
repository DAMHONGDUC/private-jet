import {
  createSlice,
  isRejectedWithValue,
  type UnknownAction,
} from '@reduxjs/toolkit';
import { AppErrorCode, type AppError } from '@/core/error/app-error';
import type { User } from '../domain/entities/user';
import { authApi } from './auth-api';

/** `Restoring` until the launch check answers; the navigator shows the splash meanwhile. */
export enum SessionStatus {
  Restoring = 'restoring',
  SignedIn = 'signedIn',
  SignedOut = 'signedOut',
}

export type SessionState = {
  status: SessionStatus;
  user: User | null;
};

const SIGN_IN_ENDPOINT: keyof typeof authApi.endpoints = 'signIn';

/**
 * Any API call refused with `UNAUTHORIZED` (a 401 from the HTTP client, which
 * has already cleared the tokens) ends the session, so the navigator shows
 * the sign-in screen. A wrong password at sign-in is the one exception.
 */
function isSessionRefused(action: UnknownAction): boolean {
  if (!isRejectedWithValue(action)) {
    return false;
  }
  const error = action.payload as AppError | undefined;
  const { arg } = action.meta as { arg?: { endpointName?: string } };
  return (
    error?.code === AppErrorCode.Unauthorized &&
    arg?.endpointName !== SIGN_IN_ENDPOINT
  );
}

const initialState: SessionState = {
  status: SessionStatus.Restoring,
  user: null,
};

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addMatcher(
        authApi.endpoints.restoreSession.matchFulfilled,
        (state, { payload }) => {
          state.user = payload;
          state.status = payload
            ? SessionStatus.SignedIn
            : SessionStatus.SignedOut;
        },
      )
      .addMatcher(authApi.endpoints.restoreSession.matchRejected, state => {
        state.status = SessionStatus.SignedOut;
      })
      .addMatcher(
        authApi.endpoints.signIn.matchFulfilled,
        (state, { payload }) => {
          state.user = payload;
          state.status = SessionStatus.SignedIn;
        },
      )
      .addMatcher(authApi.endpoints.signOut.matchFulfilled, state => {
        state.user = null;
        state.status = SessionStatus.SignedOut;
      })
      .addMatcher(
        authApi.endpoints.updateProfile.matchFulfilled,
        (state, { payload }) => {
          state.user = payload;
        },
      )
      .addMatcher(isSessionRefused, state => {
        state.user = null;
        state.status = SessionStatus.SignedOut;
      });
  },
});

type WithSession = { [sessionSlice.name]: SessionState };

export const selectSession = (state: WithSession) => state.session;
export const selectUser = (state: WithSession) => state.session.user;

import { createSlice } from '@reduxjs/toolkit';
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
      );
  },
});

type WithSession = { [sessionSlice.name]: SessionState };

export const selectSession = (state: WithSession) => state.session;
export const selectUser = (state: WithSession) => state.session.user;

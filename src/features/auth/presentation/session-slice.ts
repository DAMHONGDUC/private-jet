import { createSlice } from '@reduxjs/toolkit';
import type { User } from '../domain/entities/user';
import { authApi } from './auth-api';

/** `restoring` until the launch check answers; the navigator shows the splash meanwhile. */
export type SessionState = { status: 'restoring' | 'signedIn' | 'signedOut'; user: User | null };

const initialState: SessionState = { status: 'restoring', user: null };

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addMatcher(authApi.endpoints.restoreSession.matchFulfilled, (state, { payload }) => {
        state.user = payload;
        state.status = payload ? 'signedIn' : 'signedOut';
      })
      .addMatcher(authApi.endpoints.restoreSession.matchRejected, state => {
        state.status = 'signedOut';
      })
      .addMatcher(authApi.endpoints.signIn.matchFulfilled, (state, { payload }) => {
        state.user = payload;
        state.status = 'signedIn';
      })
      .addMatcher(authApi.endpoints.signOut.matchFulfilled, state => {
        state.user = null;
        state.status = 'signedOut';
      })
      .addMatcher(authApi.endpoints.updateProfile.matchFulfilled, (state, { payload }) => {
        state.user = payload;
      });
  },
});

type WithSession = { [sessionSlice.name]: SessionState };

export const selectSession = (state: WithSession) => state.session;
export const selectUser = (state: WithSession) => state.session.user;

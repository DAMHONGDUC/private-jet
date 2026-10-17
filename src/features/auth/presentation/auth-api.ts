import { runQuery } from '@/core/query/run-query';
import { baseApi } from '@/core/store/base-api';
import type { Credentials, ProfileUpdate, User } from '../domain/entities/user';
import type { RestoreSession, SignIn, SignOut, UpdateProfile } from '../domain/usecases/auth';

export type AuthDependencies = {
  restoreSession: RestoreSession;
  signIn: SignIn;
  signOut: SignOut;
  updateProfile: UpdateProfile;
};

const deps = (extra: unknown) => extra as AuthDependencies;

export const authApi = baseApi.injectEndpoints({
  endpoints: build => ({
    restoreSession: build.query<User | null, void>({
      queryFn: (_arg, { extra }) => runQuery(() => deps(extra).restoreSession.execute()),
    }),
    /** No credentials signs in with the demo account. */
    signIn: build.mutation<User, Credentials | undefined>({
      queryFn: (credentials, { extra }) => runQuery(() => deps(extra).signIn.execute(credentials)),
    }),
    signOut: build.mutation<null, void>({
      queryFn: async (_arg, { extra }) => runQuery(async () => {
        await deps(extra).signOut.execute();
        return null;
      }),
    }),
    updateProfile: build.mutation<User, ProfileUpdate>({
      queryFn: (update, { extra }) => runQuery(() => deps(extra).updateProfile.execute(update)),
    }),
  }),
});

export const { useRestoreSessionQuery, useSignInMutation, useSignOutMutation, useUpdateProfileMutation } = authApi;

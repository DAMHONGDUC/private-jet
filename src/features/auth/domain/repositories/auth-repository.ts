import type { Credentials, ProfileUpdate, User } from '../entities/user';

export interface AuthRepository {
  /** The member a previous launch left signed in, or null. */
  restoreSession(): Promise<User | null>;
  /** Throws an `UNAUTHORIZED` DomainError for unknown credentials. */
  signIn(credentials: Credentials): Promise<User>;
  /** One-tap sign-in with the demo account (also behind the Apple and Google buttons). */
  signInAsDemo(): Promise<User>;
  signOut(): Promise<void>;
  updateProfile(update: ProfileUpdate): Promise<User>;
}

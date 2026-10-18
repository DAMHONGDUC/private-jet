import type { UserDto } from '../models/user-dto';

export interface AuthDataSource {
  currentSession(): Promise<UserDto | null>;
  /** Null when the email and password do not match an account. */
  signIn(email: string, password: string): Promise<UserDto | null>;
  signInAsDemo(): Promise<UserDto>;
  signOut(): Promise<void>;
  updateUser(
    id: string,
    patch: Pick<UserDto, 'full_name' | 'phone'>,
  ): Promise<UserDto>;
}

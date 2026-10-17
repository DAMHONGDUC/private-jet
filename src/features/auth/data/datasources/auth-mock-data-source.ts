import { delay } from '@/core/utils/delay';
import type { UserDto } from '../models/user-dto';
import type { AuthDataSource } from './auth-data-source';
import { DEMO_CREDENTIALS } from '../../domain/entities/user';
import { buildDemoUser } from './mock/users.mock';

/**
 * One demo account, signed in when the app starts, as if a previous launch
 * had left it so. Signing out lasts until the app restarts.
 */
export class AuthMockDataSource implements AuthDataSource {
  private user: UserDto = buildDemoUser();
  private signedIn = true;

  constructor(private readonly latencyMs = 700) {}

  async currentSession(): Promise<UserDto | null> {
    await delay(this.latencyMs);
    return this.signedIn ? { ...this.user } : null;
  }

  async signIn(email: string, password: string): Promise<UserDto | null> {
    await delay(this.latencyMs);
    if (email !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
      return null;
    }
    this.signedIn = true;
    return { ...this.user };
  }

  async signInAsDemo(): Promise<UserDto> {
    await delay(this.latencyMs);
    this.signedIn = true;
    return { ...this.user };
  }

  async signOut(): Promise<void> {
    await delay(this.latencyMs / 2);
    this.signedIn = false;
  }

  async updateUser(id: string, patch: Pick<UserDto, 'full_name' | 'phone'>): Promise<UserDto> {
    await delay(this.latencyMs);
    if (id === this.user.id) {
      this.user = { ...this.user, ...patch };
    }
    return { ...this.user };
  }
}

import { AppErrorCode, DomainError } from '@/core/error/app-error';
import {
  validateCredentials,
  validateProfileUpdate,
  type Credentials,
  type ProfileUpdate,
  type User,
} from '../entities/user';
import type { AuthRepository } from '../repositories/auth-repository';

export class RestoreSession {
  constructor(private readonly repository: AuthRepository) {}

  execute(): Promise<User | null> {
    return this.repository.restoreSession();
  }
}

export class SignIn {
  constructor(private readonly repository: AuthRepository) {}

  /** Without credentials, signs in with the demo account. */
  async execute(credentials?: Credentials): Promise<User> {
    if (!credentials) {
      return this.repository.signInAsDemo();
    }
    const problem = validateCredentials(credentials);
    if (problem) {
      throw new DomainError(AppErrorCode.Validation, problem);
    }
    return this.repository.signIn({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });
  }
}

export class SignOut {
  constructor(private readonly repository: AuthRepository) {}

  execute(): Promise<void> {
    return this.repository.signOut();
  }
}

export class UpdateProfile {
  constructor(private readonly repository: AuthRepository) {}

  async execute(update: ProfileUpdate): Promise<User> {
    const problem = validateProfileUpdate(update);
    if (problem) {
      throw new DomainError(AppErrorCode.Validation, problem);
    }
    return this.repository.updateProfile({
      fullName: update.fullName.trim(),
      phone: update.phone.trim(),
    });
  }
}

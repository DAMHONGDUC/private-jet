import { AppErrorCode, DomainError } from '@/core/error/app-error';
import type {
  Credentials,
  ProfileUpdate,
  User,
} from '../../domain/entities/user';
import type { AuthRepository } from '../../domain/repositories/auth-repository';
import type { AuthDataSource } from '../datasources/auth-data-source';
import { toUser } from '../mappers/user-mapper';

export class AuthRepositoryImpl implements AuthRepository {
  private currentId: string | null = null;

  constructor(private readonly dataSource: AuthDataSource) {}

  async restoreSession(): Promise<User | null> {
    const dto = await this.dataSource.currentSession();
    this.currentId = dto?.id ?? null;
    return dto ? toUser(dto) : null;
  }

  async signIn({ email, password }: Credentials): Promise<User> {
    const dto = await this.dataSource.signIn(email, password);
    if (!dto) {
      throw new DomainError(
        AppErrorCode.Unauthorized,
        'The email or password is incorrect.',
      );
    }
    this.currentId = dto.id;
    return toUser(dto);
  }

  async signInAsDemo(): Promise<User> {
    const dto = await this.dataSource.signInAsDemo();
    this.currentId = dto.id;
    return toUser(dto);
  }

  async signOut(): Promise<void> {
    await this.dataSource.signOut();
    this.currentId = null;
  }

  async updateProfile({ fullName, phone }: ProfileUpdate): Promise<User> {
    if (!this.currentId) {
      throw new DomainError(
        AppErrorCode.Unauthorized,
        'Sign in to edit your profile.',
      );
    }
    return toUser(
      await this.dataSource.updateUser(this.currentId, {
        full_name: fullName,
        phone,
      }),
    );
  }
}

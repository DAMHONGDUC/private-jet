import type { User } from '../../domain/entities/user';
import type { UserDto } from '../models/user-dto';

export function toUser(dto: UserDto): User {
  return {
    id: dto.id,
    fullName: dto.full_name,
    email: dto.email,
    phone: dto.phone,
    memberSince: dto.member_since,
    tier: dto.tier,
  };
}

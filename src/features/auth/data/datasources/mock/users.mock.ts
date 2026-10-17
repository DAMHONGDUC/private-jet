import { DEMO_CREDENTIALS } from '../../../domain/entities/user';
import type { UserDto } from '../../models/user-dto';

/** The account the app opens signed in to, and the one the demo buttons use. */
export function buildDemoUser(): UserDto {
  return {
    id: 'usr-demo',
    full_name: 'Alexander Reed',
    email: DEMO_CREDENTIALS.email,
    phone: '+1 415 555 0142',
    member_since: '2023-03-14',
    tier: 'Black Card',
  };
}

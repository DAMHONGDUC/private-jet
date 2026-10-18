import { firstError, type FieldErrors } from '@/core/validation/field-errors';

/** The signed-in member. */
export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  /** ISO 8601 date the membership started. */
  memberSince: string;
  tier: string;
};

export type Credentials = { email: string; password: string };

/** The account this demo build signs in to; the login screen prints it. */
export const DEMO_CREDENTIALS: Credentials = {
  email: 'demo@blackjet.app',
  password: 'blackjet123',
};

/** The fields a member can change from the profile. */
export type ProfileUpdate = Pick<User, 'fullName' | 'phone'>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;

/** Each sign-in field's problem. */
export function credentialErrors({
  email,
  password,
}: Credentials): FieldErrors<keyof Credentials> {
  return {
    ...(EMAIL.test(email.trim())
      ? {}
      : { email: 'Enter a valid email address.' }),
    ...(password.length >= MIN_PASSWORD_LENGTH
      ? {}
      : {
          password: `The password has at least ${MIN_PASSWORD_LENGTH} characters.`,
        }),
  };
}

/** The first problem with the sign-in form, or null. */
export function validateCredentials(credentials: Credentials): string | null {
  return firstError(credentialErrors(credentials), ['email', 'password']);
}

/** Each profile field's problem. */
export function profileErrors({
  fullName,
  phone,
}: ProfileUpdate): FieldErrors<keyof ProfileUpdate> {
  return {
    ...(fullName.trim().length >= 2
      ? {}
      : { fullName: 'Enter your full name.' }),
    ...(phone.replace(/[^\d]/g, '').length >= 7
      ? {}
      : { phone: 'Enter a valid phone number.' }),
  };
}

export function validateProfileUpdate(update: ProfileUpdate): string | null {
  return firstError(profileErrors(update), ['fullName', 'phone']);
}

/** "AR" for Alexander Reed. */
export function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1
      ? [parts[0][0], parts[parts.length - 1][0]]
      : [parts[0]?.[0] ?? '?'];
  return letters.join('').toUpperCase();
}

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
export const DEMO_CREDENTIALS: Credentials = { email: 'demo@blackjet.app', password: 'blackjet123' };

/** The fields a member can change from the profile. */
export type ProfileUpdate = Pick<User, 'fullName' | 'phone'>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;

/** The first problem with the sign-in form, or null. */
export function validateCredentials({ email, password }: Credentials): string | null {
  if (!EMAIL.test(email.trim())) {
    return 'Enter a valid email address.';
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `The password has at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

export function validateProfileUpdate({ fullName, phone }: ProfileUpdate): string | null {
  if (fullName.trim().length < 2) {
    return 'Enter your full name.';
  }
  if (phone.replace(/[^\d]/g, '').length < 7) {
    return 'Enter a valid phone number.';
  }
  return null;
}

/** "AR" for Alexander Reed. */
export function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0][0], parts[parts.length - 1][0]] : [parts[0]?.[0] ?? '?'];
  return letters.join('').toUpperCase();
}

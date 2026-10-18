import { firstError, type FieldErrors } from '@/core/validation/field-errors';

export enum CardBrand {
  Visa = 'visa',
  Mastercard = 'mastercard',
  Amex = 'amex',
}

export enum PaymentMethodKind {
  Card = 'card',
  Wallet = 'wallet',
}

/** A card on file, or the Sovereign wallet. */
export type PaymentMethod = {
  id: string;
  kind: PaymentMethodKind;
  brand?: CardBrand;
  last4?: string;
  /** `MM/YY` for cards. */
  expiry?: string;
  holder: string;
  /** Wallet balance, in the wallet's currency. */
  balance?: number;
  currency?: string;
  isDefault: boolean;
};

const BRAND_NAMES: Record<CardBrand, string> = {
  [CardBrand.Visa]: 'Visa',
  [CardBrand.Mastercard]: 'Mastercard',
  [CardBrand.Amex]: 'Amex',
};

/** "Visa •••• 4242" or "Sovereign Wallet". */
export function paymentLabel(method: PaymentMethod): string {
  return method.kind === PaymentMethodKind.Wallet
    ? 'Sovereign Wallet'
    : `${BRAND_NAMES[method.brand ?? 'visa']} •••• ${method.last4}`;
}

export type NewCard = {
  holder: string;
  number: string;
  expiry: string;
  cvc: string;
};

/** Luhn check, so the mock accepts only plausible numbers. */
function luhn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i += 1) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export function brandOf(number: string): CardBrand {
  const digits = number.replace(/\D/g, '');
  if (/^3[47]/.test(digits)) {
    return CardBrand.Amex;
  }
  if (/^(5[1-5]|2[2-7])/.test(digits)) {
    return CardBrand.Mastercard;
  }
  return CardBrand.Visa;
}

const CARD_FIELDS = ['holder', 'number', 'expiry', 'cvc'] as const;
export type CardField = (typeof CARD_FIELDS)[number];

function expiryProblem(expiry: string, now: Date): string | null {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry.trim());
  const month = match ? Number(match[1]) : 0;
  if (!match || month < 1 || month > 12) {
    return 'Enter the expiry as MM/YY.';
  }
  const expiresAfter = new Date(2000 + Number(match[2]), month, 1);
  return expiresAfter.getTime() <= now.getTime()
    ? 'This card has expired.'
    : null;
}

/** Each card field's problem. `now` decides whether the expiry has passed. */
export function newCardErrors(
  card: NewCard,
  now: Date,
): FieldErrors<CardField> {
  const digits = card.number.replace(/\D/g, '');
  const expiry = expiryProblem(card.expiry, now);
  return {
    ...(card.holder.trim().length >= 2
      ? {}
      : { holder: 'Enter the name on the card.' }),
    ...(digits.length >= 13 && digits.length <= 19 && luhn(digits)
      ? {}
      : { number: 'Enter a valid card number.' }),
    ...(expiry ? { expiry } : {}),
    ...(/^\d{3,4}$/.test(card.cvc.trim())
      ? {}
      : { cvc: 'Enter the 3 or 4 digit security code.' }),
  };
}

/** The first problem with a new card, or null. */
export function validateNewCard(card: NewCard, now: Date): string | null {
  return firstError(newCardErrors(card, now), CARD_FIELDS);
}

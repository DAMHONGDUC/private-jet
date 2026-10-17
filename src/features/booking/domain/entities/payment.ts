export type CardBrand = 'visa' | 'mastercard' | 'amex';

/** A card on file, or the BlackJet wallet. */
export type PaymentMethod = {
  id: string;
  kind: 'card' | 'wallet';
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

const BRAND_NAMES: Record<CardBrand, string> = { visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex' };

/** "Visa •••• 4242" or "BlackJet Wallet". */
export function paymentLabel(method: PaymentMethod): string {
  return method.kind === 'wallet' ? 'BlackJet Wallet' : `${BRAND_NAMES[method.brand ?? 'visa']} •••• ${method.last4}`;
}

export type NewCard = { holder: string; number: string; expiry: string; cvc: string };

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
    return 'amex';
  }
  if (/^(5[1-5]|2[2-7])/.test(digits)) {
    return 'mastercard';
  }
  return 'visa';
}

/** The first problem with a new card, or null. `now` decides whether the expiry has passed. */
export function validateNewCard(card: NewCard, now: Date): string | null {
  const digits = card.number.replace(/\D/g, '');
  if (card.holder.trim().length < 2) {
    return 'Enter the name on the card.';
  }
  if (digits.length < 13 || digits.length > 19 || !luhn(digits)) {
    return 'Enter a valid card number.';
  }
  const match = /^(\d{2})\/(\d{2})$/.exec(card.expiry.trim());
  const month = match ? Number(match[1]) : 0;
  if (!match || month < 1 || month > 12) {
    return 'Enter the expiry as MM/YY.';
  }
  const expiresAfter = new Date(2000 + Number(match[2]), month, 1);
  if (expiresAfter.getTime() <= now.getTime()) {
    return 'This card has expired.';
  }
  if (!/^\d{3,4}$/.test(card.cvc.trim())) {
    return 'Enter the 3 or 4 digit security code.';
  }
  return null;
}

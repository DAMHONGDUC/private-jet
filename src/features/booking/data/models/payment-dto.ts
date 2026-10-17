export type PaymentMethodDto = {
  id: string;
  type: 'card' | 'wallet';
  brand: 'visa' | 'mastercard' | 'amex' | null;
  last4: string | null;
  exp_month: number | null;
  exp_year: number | null;
  holder: string;
  balance_cents: number | null;
  currency: string | null;
  is_default: boolean;
};

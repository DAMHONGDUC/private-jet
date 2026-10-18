// The wire uses the same values as the domain enums.
import type {
  CardBrand,
  PaymentMethodKind,
} from '../../domain/entities/payment';

export type PaymentMethodDto = {
  id: string;
  type: PaymentMethodKind;
  brand: CardBrand | null;
  last4: string | null;
  exp_month: number | null;
  exp_year: number | null;
  holder: string;
  balance_cents: number | null;
  currency: string | null;
  is_default: boolean;
};

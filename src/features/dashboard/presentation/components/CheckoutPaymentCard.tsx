import { StyleSheet } from 'react-native';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { Card } from '@/core/ui/Card';
import type { PaymentMethod } from '@/features/booking/domain/entities/payment';
import { PaymentMethodPicker } from '@/features/booking/presentation/components/PaymentMethodPicker';

type Props = {
  methods: PaymentMethod[] | undefined;
  /** The chosen method; the default one while null. */
  value: string | null;
  onChange: (id: string) => void;
  amount: number;
  currency: string;
};

/** How the charter is paid, with what the price covers. */
export function CheckoutPaymentCard({
  methods,
  value,
  onChange,
  amount,
  currency,
}: Props) {
  return (
    <Card style={styles.section}>
      <AppText variant="subtitle">Payment</AppText>
      <PaymentMethodPicker
        methods={methods}
        value={value}
        onChange={onChange}
        amount={amount}
        currency={currency}
      />
      <AppText variant="caption" muted>
        Taxes, fuel, crew and landing fees included. Free cancellation until 24
        hours before departure.
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  section: { gap: AppSpacing.spacing12 },
});

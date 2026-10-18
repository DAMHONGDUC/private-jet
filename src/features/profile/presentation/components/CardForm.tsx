import { StyleSheet, View } from 'react-native';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import type { FieldErrors } from '@/core/validation/field-errors';
import type { CardField } from '@/features/booking/domain/entities/payment';
import { FormField } from '@/features/booking/presentation/components/FormField';

/** "4242424242424242" → "4242 4242 4242 4242". */
const groupDigits = (text: string) =>
  text
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

/** "1228" → "12/28"; deleting the slash deletes the month's last digit too. */
const formatExpiry = (text: string) => {
  const digits = text.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
    : digits;
};

type Props = {
  holder: string;
  number: string;
  expiry: string;
  cvc: string;
  errors: FieldErrors<CardField>;
  onHolderChange: (holder: string) => void;
  /** Called with the digits grouped in fours. */
  onNumberChange: (number: string) => void;
  /** Called with the expiry as MM/YY. */
  onExpiryChange: (expiry: string) => void;
  /** Called with digits only. */
  onCvcChange: (cvc: string) => void;
  /** Focus moves into or out of the security code. */
  onCvcFocusChange: (focused: boolean) => void;
};

/** The new card's fields, formatted as they are typed, and the test numbers. */
export function CardForm({
  holder,
  number,
  expiry,
  cvc,
  errors,
  onHolderChange,
  onNumberChange,
  onExpiryChange,
  onCvcChange,
  onCvcFocusChange,
}: Props) {
  return (
    <View style={styles.form}>
      <FormField
        testID="card-holder"
        label="Name on card"
        autoCapitalize="characters"
        value={holder}
        onChangeText={onHolderChange}
        error={errors.holder}
      />
      <FormField
        testID="card-number"
        label="Card number"
        keyboardType="number-pad"
        placeholder="4242 4242 4242 4242"
        value={number}
        onChangeText={text => onNumberChange(groupDigits(text))}
        error={errors.number}
      />
      <View style={styles.row}>
        <View style={styles.flex}>
          <FormField
            testID="card-expiry"
            label="Expiry"
            keyboardType="number-pad"
            placeholder="MM/YY"
            value={expiry}
            onChangeText={text => onExpiryChange(formatExpiry(text))}
            error={errors.expiry}
          />
        </View>
        <View style={styles.flex}>
          <FormField
            testID="card-cvc"
            label="Security code"
            keyboardType="number-pad"
            placeholder="CVC"
            secureTextEntry
            maxLength={4}
            value={cvc}
            onFocus={() => onCvcFocusChange(true)}
            onBlur={() => onCvcFocusChange(false)}
            onChangeText={text => onCvcChange(text.replace(/\D/g, ''))}
            error={errors.cvc}
          />
        </View>
      </View>
      <AppText variant="caption" muted>
        Test numbers: 4242 4242 4242 4242 (Visa), 5555 5555 5555 4444
        (Mastercard), any future expiry and code.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { gap: AppSpacing.md },
  row: { flexDirection: 'row', gap: AppSpacing.md },
});

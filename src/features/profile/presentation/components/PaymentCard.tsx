import { AppColors } from '@/core/theme/app-colors';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import { BJText } from '@/core/ui/BJText';
import { Wordmark, WordmarkTone } from '@/core/ui/Wordmark';
import { formatMoney } from '@/core/utils/format';
import {
  CardBrand,
  PaymentMethodKind,
  type PaymentMethod,
} from '@/features/booking/domain/entities/payment';

export const CARD_RATIO = 1.586;

const BRAND_NAMES: Record<CardBrand, string> = {
  visa: 'VISA',
  mastercard: 'mastercard',
  amex: 'AMEX',
};
const CARD_FACES: Record<CardBrand, string> = {
  [CardBrand.Visa]:
    'linear-gradient(135deg, #1C1C1C 0%, #3A3A3A 55%, #111111 100%)',
  [CardBrand.Mastercard]:
    'linear-gradient(135deg, #2A2118 0%, #5A4632 60%, #1A140E 100%)',
  [CardBrand.Amex]:
    'linear-gradient(135deg, #1D2A33 0%, #3E5A6B 60%, #121A20 100%)',
};
const WALLET_FACE =
  'linear-gradient(135deg, #000000 0%, #2B2B2B 50%, #000000 100%)';

type Props = {
  method: Pick<
    PaymentMethod,
    'kind' | 'brand' | 'last4' | 'expiry' | 'holder' | 'balance' | 'currency'
  >;
  /** Digits typed so far, for the live preview while adding a card. */
  number?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** A payment method drawn as the card itself: brand, number, holder and expiry, or the wallet balance. */
export function PaymentCard({ method, number, style, testID }: Props) {
  const wallet = method.kind === PaymentMethodKind.Wallet;
  const face = wallet
    ? WALLET_FACE
    : CARD_FACES[method.brand ?? CardBrand.Visa];
  const digits = (number ?? '').replace(/\D/g, '');
  const shown =
    number !== undefined
      ? groups(digits.padEnd(16, '•'))
      : `••••  ••••  ••••  ${method.last4 ?? '••••'}`;

  return (
    <View
      testID={testID}
      style={[styles.card, { backgroundImage: face }, style]}
    >
      <View style={styles.row}>
        <Wordmark tone={WordmarkTone.OnPhoto} />
        <BJText size={16} weight="medium" tone="white">
          {wallet ? 'WALLET' : BRAND_NAMES[method.brand ?? 'visa']}
        </BJText>
      </View>
      {wallet ? (
        <View>
          <BJText size={13} style={styles.muted}>
            Balance
          </BJText>
          <BJText size={28} weight="medium" tone="white">
            {formatMoney(method.balance ?? 0, method.currency ?? 'AUD')}
          </BJText>
        </View>
      ) : (
        <View style={styles.chip} />
      )}
      {wallet ? null : (
        <BJText size={20} tone="white" style={styles.number}>
          {shown}
        </BJText>
      )}
      <View style={styles.row}>
        <View>
          <BJText size={13} style={styles.muted}>
            {wallet ? 'MEMBER' : 'CARD HOLDER'}
          </BJText>
          <BJText size={16} tone="white" numberOfLines={1}>
            {method.holder || 'YOUR NAME'}
          </BJText>
        </View>
        {wallet ? null : (
          <View style={styles.end}>
            <BJText size={13} style={styles.muted}>
              EXPIRES
            </BJText>
            <BJText size={16} tone="white">
              {method.expiry || 'MM/YY'}
            </BJText>
          </View>
        )}
      </View>
    </View>
  );
}

function groups(digits: string): string {
  return digits.slice(0, 16).replace(/(.{4})(?=.)/g, '$1  ');
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: CARD_RATIO,
    borderRadius: 18,
    padding: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chip: {
    width: 42,
    height: 30,
    borderRadius: 6,
    backgroundColor: AppColors.fixed.cardGold,
    opacity: 0.85,
  },
  number: { letterSpacing: 1 },
  muted: { color: 'rgba(255, 255, 255, 0.6)' },
  end: { alignItems: 'flex-end' },
});

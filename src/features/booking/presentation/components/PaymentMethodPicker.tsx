import { View } from 'react-native';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { PressableScale } from '@/core/ui/PressableScale';
import { Shimmer } from '@/core/ui/Shimmer';
import { haptics } from '@/core/ui/haptics';
import { formatMoney } from '@/core/utils/format';
import {
  paymentLabel,
  PaymentMethodKind,
  type PaymentMethod,
} from '../../domain/entities/payment';

type Props = {
  methods: PaymentMethod[] | undefined;
  /** The chosen method; the default one while null. */
  value: string | null;
  onChange: (id: string) => void;
  /** Shown when the wallet cannot cover it. */
  amount?: number;
  currency?: string;
};

/** Cards and the wallet as radio rows; the wallet shows its balance. */
export function PaymentMethodPicker({
  methods,
  value,
  onChange,
  amount,
  currency,
}: Props) {
  const styles = useStyles();
  if (!methods) {
    return (
      <View style={styles.list}>
        <Shimmer width="100%" height={56} radius={12} />
        <Shimmer width="100%" height={56} radius={12} />
      </View>
    );
  }
  const chosen =
    value ?? methods.find(method => method.isDefault)?.id ?? methods[0]?.id;

  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {methods.map(method => {
        const selected = method.id === chosen;
        const short =
          method.kind === PaymentMethodKind.Wallet &&
          amount !== undefined &&
          (method.balance ?? 0) < amount;
        return (
          <PressableScale
            key={method.id}
            testID={`payment-${method.id}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => {
              haptics.selection();
              onChange(method.id);
            }}
            style={[styles.row, selected && styles.selected]}
          >
            <View style={[styles.ring, selected && styles.ringOn]}>
              {selected ? <View style={styles.dot} /> : null}
            </View>
            <View style={styles.text}>
              <AppText variant="subtitle">{paymentLabel(method)}</AppText>
              <AppText
                variant="caption"
                muted
                style={short ? styles.short : undefined}
              >
                {method.kind === PaymentMethodKind.Wallet
                  ? `Balance ${formatMoney(
                      method.balance ?? 0,
                      method.currency ?? currency ?? 'AUD',
                    )}${short ? ' · not enough' : ''}`
                  : `Expires ${method.expiry}${
                      method.isDefault ? ' · Default' : ''
                    }`}
              </AppText>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  list: { gap: AppSpacing.spacing8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.spacing12,
    padding: AppSpacing.spacing12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.iron,
    backgroundColor: palette.secondaryBackground,
  },
  selected: {
    borderColor: palette.accent,
    backgroundColor: palette.accentSoft,
  },
  ring: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: palette.ashGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOn: { borderColor: palette.accent },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.accent,
  },
  text: { flex: 1, gap: 2 },
  short: { color: palette.error },
}));

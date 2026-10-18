import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { AppText } from '@/core/ui/AppText';
import { ActionsDirection, BottomActions } from '@/core/ui/BottomActions';
import { Button } from '@/core/ui/Button';
import { formatMoney } from '@/core/utils/format';

type Props = {
  legCount: number;
  total: number;
  currency: string;
  loading: boolean;
  onPay: () => void;
};

/** The checkout's pinned footer: the trip total and pay. */
export function CheckoutFooter({
  legCount,
  total,
  currency,
  loading,
  onPay,
}: Props) {
  const t = useT();
  return (
    <BottomActions direction={ActionsDirection.Row}>
      <View style={styles.flex}>
        <AppText variant="caption" muted>
          {legCount === 1
            ? t('actions.totalOne')
            : t('actions.total', { count: legCount })}
        </AppText>
        <AppText testID="charter-total" variant="title">
          {formatMoney(total, currency)}
        </AppText>
      </View>
      <Button
        testID="charter-pay"
        title={t(loading ? 'actions.processing' : 'actions.confirmAndPay')}
        loading={loading}
        onPress={onPay}
      />
    </BottomActions>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

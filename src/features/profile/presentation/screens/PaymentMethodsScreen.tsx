import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { BottomSheet } from '@/core/ui/BottomSheet';
import { BottomActions } from '@/core/ui/BottomActions';
import { Button, ButtonVariant } from '@/core/ui/Button';
import { Screen } from '@/core/ui/Screen';
import { Shimmer } from '@/core/ui/Shimmer';
import { ErrorView, errorMessage } from '@/core/ui/StateViews';
import { StatusPill, StatusTone } from '@/core/ui/StatusPill';
import { haptics } from '@/core/ui/haptics';
import {
  paymentLabel,
  PaymentMethodKind,
  type PaymentMethod,
} from '@/features/booking/domain/entities/payment';
import {
  useGetPaymentMethodsQuery,
  useRemoveCardMutation,
  useSetDefaultPaymentMutation,
} from '@/features/booking/presentation/booking-api';
import { PaymentCard } from '../components/PaymentCard';

type Props = { onAddCard: () => void };

/** The wallet and every card, drawn as cards; make one the default or remove it. */
export function PaymentMethodsScreen({ onAddCard }: Props) {
  const styles = useStyles();
  const t = useT();
  const { data: methods, error, refetch } = useGetPaymentMethodsQuery();
  const [setDefault, { isLoading: settingDefault }] =
    useSetDefaultPaymentMutation();
  const [removeCard, { isLoading: removing, error: removeError, reset }] =
    useRemoveCardMutation();
  const [removing_, setRemoving] = useState<PaymentMethod | null>(null);

  if (error) {
    return (
      <Screen>
        <ErrorView error={error} onRetry={refetch} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        {!methods
          ? [0, 1].map(index => (
              <Shimmer key={index} width="100%" height={200} radius={18} />
            ))
          : methods.map(method => (
              <View key={method.id} style={styles.item}>
                <PaymentCard testID={`card-${method.id}`} method={method} />
                <View style={styles.actions}>
                  {method.isDefault ? (
                    <StatusPill label="Default" tone={StatusTone.Inverse} />
                  ) : (
                    <Button
                      testID={`default-${method.id}`}
                      title="Make default"
                      variant={ButtonVariant.Secondary}
                      disabled={settingDefault}
                      onPress={() => {
                        haptics.selection();
                        setDefault(method.id);
                      }}
                    />
                  )}
                  {method.kind === PaymentMethodKind.Card &&
                  !method.isDefault ? (
                    <Button
                      testID={`remove-${method.id}`}
                      title="Remove"
                      variant={ButtonVariant.Danger}
                      onPress={() => {
                        reset();
                        setRemoving(method);
                      }}
                    />
                  ) : null}
                </View>
              </View>
            ))}
      </ScrollView>
      <BottomActions>
        <Button
          testID="add-card"
          title={t('actions.addCard')}
          onPress={onAddCard}
        />
      </BottomActions>

      <BottomSheet
        visible={removing_ !== null}
        title="Remove this card?"
        onClose={() => setRemoving(null)}
        testID="remove-card-sheet"
      >
        <View style={styles.sheet}>
          <AppText muted>
            {removing_
              ? `${paymentLabel(
                  removing_,
                )} will no longer be offered at checkout.`
              : ''}
          </AppText>
          {removeError ? (
            <AppText style={styles.error}>{errorMessage(removeError)}</AppText>
          ) : null}
          <Button
            testID="confirm-remove-card"
            title="Remove card"
            variant={ButtonVariant.Danger}
            loading={removing}
            onPress={async () => {
              if (removing_) {
                try {
                  await removeCard(removing_.id).unwrap();
                  haptics.light();
                  setRemoving(null);
                } catch {
                  haptics.error();
                }
              }
            }}
          />
        </View>
      </BottomSheet>
    </Screen>
  );
}

const useStyles = makeStyles(palette => ({
  content: { padding: AppSpacing.lg, gap: AppSpacing.xl },
  item: { gap: AppSpacing.md },
  actions: { flexDirection: 'row', alignItems: 'center', gap: AppSpacing.md },
  sheet: { gap: AppSpacing.md, paddingTop: AppSpacing.sm },
  error: { color: palette.error },
}));

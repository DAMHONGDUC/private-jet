import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { makeStyles } from '@/core/theme/blackjet';
import { spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { BottomSheet } from '@/core/ui/BottomSheet';
import { Button } from '@/core/ui/Button';
import { Screen } from '@/core/ui/Screen';
import { Shimmer } from '@/core/ui/Shimmer';
import { ErrorView, errorMessage } from '@/core/ui/StateViews';
import { StatusPill } from '@/core/ui/StatusPill';
import { haptics } from '@/core/ui/haptics';
import { paymentLabel, type PaymentMethod } from '@/features/booking/domain/entities/payment';
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
  const { data: methods, error, refetch } = useGetPaymentMethodsQuery();
  const [setDefault, { isLoading: settingDefault }] = useSetDefaultPaymentMutation();
  const [removeCard, { isLoading: removing, error: removeError, reset }] = useRemoveCardMutation();
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
          ? [0, 1].map(index => <Shimmer key={index} width="100%" height={200} radius={18} />)
          : methods.map((method, index) => (
              <Animated.View
                key={method.id}
                entering={FadeInDown.duration(450).delay(index * 90)}
                layout={LinearTransition.duration(300)}
                style={styles.item}
              >
                <PaymentCard testID={`card-${method.id}`} method={method} />
                <View style={styles.actions}>
                  {method.isDefault ? (
                    <StatusPill label="Default" tone="inverse" />
                  ) : (
                    <Button
                      testID={`default-${method.id}`}
                      title="Make default"
                      variant="secondary"
                      disabled={settingDefault}
                      onPress={() => {
                        haptics.selection();
                        setDefault(method.id);
                      }}
                    />
                  )}
                  {method.kind === 'card' && !method.isDefault ? (
                    <Button
                      testID={`remove-${method.id}`}
                      title="Remove"
                      variant="danger"
                      onPress={() => {
                        reset();
                        setRemoving(method);
                      }}
                    />
                  ) : null}
                </View>
              </Animated.View>
            ))}
        <Button testID="add-card" title="Add a card" onPress={onAddCard} />
      </ScrollView>

      <BottomSheet
        visible={removing_ !== null}
        title="Remove this card?"
        onClose={() => setRemoving(null)}
        testID="remove-card-sheet"
      >
        <View style={styles.sheet}>
          <AppText muted>{removing_ ? `${paymentLabel(removing_)} will no longer be offered at checkout.` : ''}</AppText>
          {removeError ? <AppText style={styles.error}>{errorMessage(removeError)}</AppText> : null}
          <Button
            testID="confirm-remove-card"
            title="Remove card"
            variant="danger"
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
  content: { padding: spacing.lg, gap: spacing.xl },
  item: { gap: spacing.md },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sheet: { gap: spacing.md, paddingTop: spacing.sm },
  error: { color: palette.error },
}));

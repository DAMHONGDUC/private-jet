import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { AppText } from '@/core/ui/AppText';
import { ActionsDirection, BottomActions } from '@/core/ui/BottomActions';
import { Button, ButtonVariant } from '@/core/ui/Button';
import { formatMoney } from '@/core/utils/format';
import type { JetQuote } from '../../domain/entities/charter';

type Props = {
  quote: JetQuote;
  legIndex: number;
  legs: number;
  selected: boolean;
  /** Every other leg already has a jet. */
  othersChosen: boolean;
  onChoose: () => void;
  onBack: () => void;
  onCheckout: () => void;
};

/** The quote's pinned footer: the leg price and choose, remove or move on. */
export function QuoteFooter({
  quote,
  legIndex,
  legs,
  selected,
  othersChosen,
  onChoose,
  onBack,
  onCheckout,
}: Props) {
  const t = useT();
  return (
    <BottomActions direction={ActionsDirection.Row} style={styles.footer}>
      <View style={styles.price}>
        <AppText variant="caption" muted>
          {t('actions.totalForLeg')}
        </AppText>
        <AppText testID="quote-price" variant="title">
          {formatMoney(quote.price, quote.currency)}
        </AppText>
      </View>
      {selected ? (
        <>
          <Button
            testID="quote-remove"
            title={t('actions.remove')}
            variant={ButtonVariant.Secondary}
            onPress={onChoose}
          />
          <Button
            testID="quote-next"
            title={t(othersChosen ? 'actions.checkout' : 'actions.backToJets')}
            onPress={othersChosen ? onCheckout : onBack}
          />
        </>
      ) : (
        <Button
          testID="quote-choose"
          title={
            othersChosen
              ? legs > 1
                ? t('actions.chooseAndCheckout')
                : t('actions.bookThisJet')
              : t('actions.chooseForLeg', { number: legIndex + 1 })
          }
          onPress={onChoose}
        />
      )}
    </BottomActions>
  );
}

const styles = StyleSheet.create({
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  price: { flex: 1, gap: 2 },
});

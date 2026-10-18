import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { elevation, radius } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { formatMoney } from '@/core/utils/format';

type Props = {
  chosen: number;
  legs: number;
  total: number;
  currency: string;
  complete: boolean;
  onContinue: () => void;
};

/** Shows once a jet is chosen: how many legs are covered, the running total, Continue. */
export function SelectionBar({
  chosen,
  legs,
  total,
  currency,
  complete,
  onContinue,
}: Props) {
  const styles = useStyles();
  const t = useT();
  return (
    <View testID="selection-bar" style={styles.bar}>
      <View style={styles.text}>
        <AppText variant="caption" muted>
          {legs > 1
            ? t('results.legsChosen', { chosen, legs })
            : t('results.yourJet')}
        </AppText>
        <AppText testID="selection-total" variant="title">
          {formatMoney(total, currency)}
        </AppText>
      </View>
      <Button
        testID="selection-continue"
        title={t(complete ? 'results.continue' : 'results.pickEveryLeg')}
        disabled={!complete}
        onPress={onContinue}
      />
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  bar: {
    position: 'absolute',
    left: AppSpacing.spacing16,
    right: AppSpacing.spacing16,
    // The screen puts its slot on the safe area; this is the bottom-action gap above it.
    bottom: AppSpacing.bottomAction,
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.spacing12,
    padding: AppSpacing.spacing12,
    paddingLeft: AppSpacing.spacing16,
    borderRadius: radius.xl,
    backgroundColor: palette.raised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.iron,
    ...elevation(palette.shadow),
  },
  text: { flex: 1, gap: 2 },
}));

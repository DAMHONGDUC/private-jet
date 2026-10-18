import { StyleSheet, View } from 'react-native';
import { makeStyles } from '@/core/theme/blackjet';
import { elevation, radius, spacing } from '@/core/theme/theme';
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
  return (
    <View testID="selection-bar" style={styles.bar}>
      <View style={styles.text}>
        <AppText variant="caption" muted>
          {legs > 1 ? `${chosen} of ${legs} legs chosen` : 'Your jet'}
        </AppText>
        <AppText testID="selection-total" variant="title">
          {formatMoney(total, currency)}
        </AppText>
      </View>
      <Button
        testID="selection-continue"
        title={complete ? 'Continue' : 'Pick every leg'}
        disabled={!complete}
        onPress={onContinue}
      />
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  bar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    paddingLeft: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: palette.raised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.iron,
    ...elevation(palette.shadow),
  },
  text: { flex: 1, gap: 2 },
}));

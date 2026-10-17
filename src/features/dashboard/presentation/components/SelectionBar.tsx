import { View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { makeStyles } from '@/core/theme/blackjet';
import { spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { CountUp } from '@/core/ui/CountUp';
import { formatMoney } from '@/core/utils/format';

type Props = {
  chosen: number;
  legs: number;
  total: number;
  currency: string;
  complete: boolean;
  onContinue: () => void;
};

/** Springs up once a jet is chosen: how many legs are covered, the running total, Continue. */
export function SelectionBar({ chosen, legs, total, currency, complete, onContinue }: Props) {
  const styles = useStyles();
  return (
    <Animated.View
      testID="selection-bar"
      entering={SlideInDown.springify().damping(18)}
      exiting={SlideOutDown.duration(200)}
      style={styles.bar}
    >
      <View style={styles.text}>
        <AppText variant="caption" muted>
          {legs > 1 ? `${chosen} of ${legs} legs chosen` : 'Your jet'}
        </AppText>
        <CountUp testID="selection-total" value={total} format={amount => formatMoney(amount, currency)} variant="title" />
      </View>
      <Button
        testID="selection-continue"
        title={complete ? 'Continue' : 'Pick every leg'}
        disabled={!complete}
        onPress={onContinue}
      />
    </Animated.View>
  );
}

const useStyles = makeStyles(palette => ({
  bar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: palette.secondaryBackground,
    borderWidth: 1,
    borderColor: palette.iron,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  text: { flex: 1, gap: 2 },
}));

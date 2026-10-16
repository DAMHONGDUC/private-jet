import { StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, radius, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';

type Props = { label: string; value: string; index: number; testID?: string };

export function StatTile({ label, value, index, testID }: Props) {
  return (
    <Animated.View
      testID={testID}
      entering={FadeInDown.delay(150 + index * 90).springify().damping(15)}
      style={styles.tile}
    >
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption" muted>
        {label}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
});

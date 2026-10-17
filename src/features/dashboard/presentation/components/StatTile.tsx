import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';

type Props = { label: string; value: string; testID?: string };

export function StatTile({ label, value, testID }: Props) {
  return (
    <View testID={testID} style={styles.tile}>
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption" muted>
        {label}
      </AppText>
    </View>
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

import { StyleSheet, View } from 'react-native';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';

/** A label and value in the boarding pass grid, two to a row. */
export function BoardingDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detail}>
      <AppText variant="label" muted>
        {label}
      </AppText>
      <AppText variant="subtitle" numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  detail: { width: '50%', gap: AppSpacing.xs, paddingRight: AppSpacing.sm },
});

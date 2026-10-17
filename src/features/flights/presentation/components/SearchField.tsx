import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { PressableScale } from '@/core/ui/PressableScale';

type Props = {
  label: string;
  /** Shown muted when there is no value. */
  value: string | null;
  placeholder: string;
  onPress: () => void;
  testID: string;
  style?: StyleProp<ViewStyle>;
};

/** A tappable row in the search card: a small label over the chosen value. */
export function SearchField({ label, value, placeholder, onPress, testID, style }: Props) {
  return (
    <PressableScale testID={testID} accessibilityRole="button" onPress={onPress} style={[styles.field, style]}>
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <View>
        <AppText variant="subtitle" muted={!value} numberOfLines={1}>
          {value ?? placeholder}
        </AppText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  field: { flex: 1, paddingVertical: spacing.md, gap: spacing.xs },
});

import { ScrollView, StyleSheet } from 'react-native';
import { spacing } from '@/core/theme/theme';
import { Chip } from '@/core/ui/Chip';
import { JET_CATEGORIES, type JetCategory } from '../../domain/entities/flight';

export const CATEGORY_LABELS: Record<JetCategory, string> = {
  light: 'Light jet',
  midsize: 'Midsize',
  heavy: 'Heavy jet',
};

type Props = { value: JetCategory | null; onChange: (category: JetCategory | null) => void; inset?: boolean };

/** "Any" plus one chip per jet category; one is always selected. */
export function CategoryChips({ value, onChange, inset = false }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, inset && styles.inset]}
    >
      <Chip testID="category-any" label="Any jet" selected={value === null} onPress={() => onChange(null)} />
      {JET_CATEGORIES.map(item => (
        <Chip
          key={item}
          testID={`category-${item}`}
          label={CATEGORY_LABELS[item]}
          selected={value === item}
          onPress={() => onChange(item)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm },
  inset: { paddingHorizontal: spacing.lg },
});

import { ScrollView, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { spacing } from '@/core/theme/theme';
import { Chip } from '@/core/ui/Chip';
import { JET_CATEGORIES, type JetCategory } from '../../domain/entities/flight';
import { categoryToggled, originToggled, selectFlightsFilter } from '../flights-filter-slice';

const ORIGINS = ['HEL', 'FAB', 'LBG', 'GVA', 'NCE'];

const CATEGORY_LABELS: Record<JetCategory, string> = {
  light: 'Light jet',
  midsize: 'Midsize',
  heavy: 'Heavy jet',
};

export function FlightFilters() {
  const dispatch = useDispatch();
  const { origin, category } = useSelector(selectFlightsFilter);

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {JET_CATEGORIES.map(item => (
          <Chip
            key={item}
            testID={`filter-category-${item}`}
            label={CATEGORY_LABELS[item]}
            selected={category === item}
            onPress={() => dispatch(categoryToggled(item))}
          />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {ORIGINS.map(code => (
          <Chip
            key={code}
            testID={`filter-origin-${code}`}
            label={`From ${code}`}
            selected={origin === code}
            onPress={() => dispatch(originToggled(code))}
          />
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingHorizontal: spacing.lg },
});

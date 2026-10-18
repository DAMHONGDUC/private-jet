import { ScrollView, StyleSheet } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { AppSpacing } from '@/core/theme/app-spacing';
import { Chip } from '@/core/ui/Chip';
import { DEPARTURE_TIME_OPTIONS } from '../calendar-months';

type Props = {
  /** `HH:MM`, or null for any time of day. */
  value: string | null;
  onChange: (time: string | null) => void;
};

/** "Any time" and every half hour from 06:00 to 22:00, in one sideways row. */
export function TimeChips({ value, onChange }: Props) {
  const t = useT();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Chip
        testID="calendar-time-any"
        label={t('search.anyTime')}
        selected={value === null}
        onPress={() => onChange(null)}
      />
      {DEPARTURE_TIME_OPTIONS.map(time => (
        <Chip
          key={time}
          testID={`calendar-time-${time}`}
          label={time}
          selected={value === time}
          onPress={() => onChange(time)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: AppSpacing.sm },
});

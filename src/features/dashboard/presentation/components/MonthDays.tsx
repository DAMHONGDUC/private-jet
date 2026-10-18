import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { PressableScale } from '@/core/ui/PressableScale';
import { toDayKey } from '@/core/utils/date';
import { monthGrid, type MonthCursor } from '../calendar-months';

type Props = {
  cursor: MonthCursor;
  /** Days before this `YYYY-MM-DD` are greyed out. */
  minDay: string;
  selected: string | null;
  onPick: (day: string) => void;
};

/** One month as six Monday-first weeks; fades in when the month changes. */
export function MonthDays({ cursor, minDay, selected, onPick }: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  return (
    <View>
      <View style={styles.grid}>
        {t.dict.date.weekdaysShort.map(day => (
          <BJText key={day} size={13} tone="secondary" style={styles.weekday}>
            {day}
          </BJText>
        ))}
      </View>
      <Animated.View
        key={`${cursor.year}-${cursor.month}`}
        entering={FadeIn.duration(180)}
        style={styles.grid}
      >
        {monthGrid(cursor).map((date, cell) => {
          if (!date) {
            return <View key={`blank-${cell}`} style={styles.cell} />;
          }
          const key = toDayKey(date);
          const disabled = key < minDay;
          const isSelected = key === selected;
          return (
            <View key={key} style={styles.cell}>
              <PressableScale
                testID={`calendar-${key}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected, disabled }}
                disabled={disabled}
                onPress={() => onPick(key)}
                style={[
                  styles.day,
                  isSelected && { backgroundColor: palette.primaryAction },
                ]}
              >
                <BJText
                  tone={isSelected ? 'onPrimary' : 'primary'}
                  weight={isSelected ? 'medium' : 'regular'}
                  style={disabled && styles.disabled}
                >
                  {date.getDate()}
                </BJText>
              </PressableScale>
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', paddingBottom: 8 },
  cell: { width: `${100 / 7}%`, aspectRatio: 1.15, padding: 3 },
  day: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  disabled: { opacity: 0.3 },
});

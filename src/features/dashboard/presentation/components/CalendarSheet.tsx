import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { PressableScale } from '@/core/ui/PressableScale';
import { addDays, toDayKey } from '@/core/utils/date';
import { BJSheet } from './BJSheet';

const WEEKS = 6;

type Props = {
  visible: boolean;
  title: string;
  /** Days before this `YYYY-MM-DD` are greyed out. */
  minDay: string;
  /** The first week shown is the one holding this day. */
  today: Date;
  value: string | null;
  onPick: (day: string) => void;
  onClose: () => void;
};

/** Six weeks from this Monday; picking a day closes the sheet (feature-docs/dashboard §4.3). */
export function CalendarSheet({
  visible,
  title,
  minDay,
  today,
  value,
  onPick,
  onClose,
}: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  const { days, heading } = useMemo(() => {
    const monday = addDays(today, -((today.getDay() + 6) % 7));
    const all = Array.from({ length: WEEKS * 7 }, (_, i) => addDays(monday, i));
    const months = t.dict.date.months;
    const first = months[all[0].getMonth()];
    const last = months[all[all.length - 1].getMonth()];
    return {
      days: all,
      heading: first === last ? first : `${first} – ${last}`,
    };
  }, [today, t]);

  return (
    <BJSheet
      visible={visible}
      title={title}
      onClose={onClose}
      testID="calendar-sheet"
    >
      <View>
        <BJText tone="secondary" style={styles.month}>
          {heading}
        </BJText>
      </View>
      <View style={styles.grid}>
        {t.dict.date.weekdaysShort.map(day => (
          <BJText key={day} size={13} tone="secondary" style={styles.weekday}>
            {day}
          </BJText>
        ))}
        {days.map(date => {
          const key = toDayKey(date);
          const disabled = key < minDay;
          const selected = key === value;
          return (
            <View key={key} style={styles.cell}>
              <PressableScale
                testID={`calendar-${key}`}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled }}
                disabled={disabled}
                onPress={() => onPick(key)}
                style={[
                  styles.day,
                  selected && { backgroundColor: palette.primaryAction },
                ]}
              >
                <BJText
                  tone={selected ? 'onPrimary' : 'primary'}
                  weight={selected ? 'medium' : 'regular'}
                  style={disabled && styles.disabled}
                >
                  {date.getDate()}
                </BJText>
              </PressableScale>
            </View>
          );
        })}
      </View>
    </BJSheet>
  );
}

const styles = StyleSheet.create({
  month: { marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', paddingBottom: 8 },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 4 },
  day: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  disabled: { opacity: 0.3 },
});

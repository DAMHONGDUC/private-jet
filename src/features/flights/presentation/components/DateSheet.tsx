import { useMemo } from 'react';
import { View } from 'react-native';
import { radius, spacing } from '@/core/theme/theme';
import { makeStyles } from '@/core/theme/blackjet';
import { AppText } from '@/core/ui/AppText';
import { BottomSheet, SheetOption } from '@/core/ui/BottomSheet';
import { PressableScale } from '@/core/ui/PressableScale';
import { addDays, toDayKey } from '@/core/utils/date';

const WEEKS = 5;
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type Props = {
  visible: boolean;
  today: Date;
  /** `YYYY-MM-DD`, or null for any date. */
  value: string | null;
  onChange: (day: string | null) => void;
  onClose: () => void;
};

/** "Any date", then a calendar of the next five weeks from this Monday; past days are greyed out. */
export function DateSheet({ visible, today, value, onChange, onClose }: Props) {
  const styles = useStyles();
  const { days, title } = useMemo(() => {
    const monday = addDays(today, -((today.getDay() + 6) % 7));
    const all = Array.from({ length: WEEKS * 7 }, (_, i) => addDays(monday, i));
    const first = MONTHS[all[0].getMonth()];
    const last = MONTHS[all[all.length - 1].getMonth()];
    return { days: all, title: first === last ? first : `${first} – ${last}` };
  }, [today]);
  const todayKey = toDayKey(today);

  const pick = (day: string | null) => {
    onChange(day);
    onClose();
  };

  return (
    <BottomSheet visible={visible} title="Departure date" onClose={onClose} testID="date-sheet">
      <SheetOption testID="date-any" label="Any date" selected={value === null} onPress={() => pick(null)} />
      <AppText variant="caption" muted style={styles.month}>
        {title}
      </AppText>
      <View style={styles.grid}>
        {WEEKDAYS.map(day => (
          <AppText key={day} variant="caption" muted style={styles.weekday}>
            {day}
          </AppText>
        ))}
        {days.map(date => {
          const key = toDayKey(date);
          const past = key < todayKey;
          const selected = key === value;
          return (
            <View key={key} style={styles.cell}>
              <PressableScale
                testID={`date-${key}`}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled: past }}
                disabled={past}
                onPress={() => pick(key)}
                style={[styles.day, selected && styles.selected]}
              >
                <AppText
                  muted={past}
                  style={[past && styles.past, selected && styles.selectedText, key === todayKey && styles.today]}
                >
                  {date.getDate()}
                </AppText>
              </PressableScale>
            </View>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const useStyles = makeStyles(palette => ({
  month: { marginTop: spacing.lg, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', paddingBottom: spacing.sm },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  day: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  selected: { backgroundColor: palette.jetBlack },
  selectedText: { color: palette.secondaryBackground, fontWeight: '600' },
  today: { fontWeight: '600' },
  past: { opacity: 0.4 },
}));

import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { PressableScale } from '@/core/ui/PressableScale';
import { addDays, toDayKey } from '@/core/utils/date';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Props = {
  today: Date;
  /** `YYYY-MM-DD`, or null for any date. */
  value: string | null;
  onChange: (day: string | null) => void;
  days?: number;
};

/** "Any date" and the next `days` days as tappable tiles. */
export function DateStrip({ today, value, onChange, days = 14 }: Props) {
  const dates = useMemo(() => Array.from({ length: days }, (_, i) => addDays(today, i)), [today, days]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Tile testID="date-any" top="Any" main="—" bottom="date" selected={value === null} onPress={() => onChange(null)} />
      {dates.map((date, index) => {
        const key = toDayKey(date);
        return (
          <Tile
            key={key}
            testID={`date-${key}`}
            top={index === 0 ? 'Today' : WEEKDAYS[date.getDay()]}
            main={String(date.getDate())}
            bottom={MONTHS[date.getMonth()]}
            selected={value === key}
            onPress={() => onChange(key)}
          />
        );
      })}
    </ScrollView>
  );
}

type TileProps = { top: string; main: string; bottom: string; selected: boolean; onPress: () => void; testID: string };

function Tile({ top, main, bottom, selected, onPress, testID }: TileProps) {
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.tile, selected && styles.selected]}
    >
      <AppText variant="caption" style={selected ? styles.selectedText : undefined} muted={!selected}>
        {top}
      </AppText>
      <AppText variant="title" style={selected ? styles.selectedText : undefined}>
        {main}
      </AppText>
      <AppText variant="caption" style={selected ? styles.selectedText : undefined} muted={!selected}>
        {bottom}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm },
  tile: {
    width: 64,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 2,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.gold, borderColor: colors.gold },
  selectedText: { color: colors.background },
});

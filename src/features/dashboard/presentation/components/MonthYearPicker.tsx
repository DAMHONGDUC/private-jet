import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import { monthIndex, type MonthCursor } from '../calendar-months';

type Props = {
  /** The year on show and the month currently chosen. */
  cursor: MonthCursor;
  /** The first and last months that can be picked. */
  min: MonthCursor;
  max: MonthCursor;
  onYear: (year: number) => void;
  onPick: (cursor: MonthCursor) => void;
};

/** A year with arrows over its twelve months; months out of range are greyed out. */
export function MonthYearPicker({ cursor, min, max, onYear, onPick }: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  const { year } = cursor;
  return (
    <Animated.View entering={FadeIn.duration(180)} style={styles.root}>
      <View style={styles.yearRow}>
        <PressableScale
          testID="calendar-year-prev"
          accessibilityRole="button"
          accessibilityLabel={t('search.previousYear')}
          disabled={year <= min.year}
          onPress={() => onYear(year - 1)}
          hitSlop={8}
          style={year <= min.year && styles.disabled}
        >
          <Icon name="chevronLeft" size={24} color={palette.primaryText} />
        </PressableScale>
        <BJText size={20} testID="calendar-year">
          {year}
        </BJText>
        <PressableScale
          testID="calendar-year-next"
          accessibilityRole="button"
          accessibilityLabel={t('search.nextYear')}
          disabled={year >= max.year}
          onPress={() => onYear(year + 1)}
          hitSlop={8}
          style={year >= max.year && styles.disabled}
        >
          <Icon name="chevronRight" size={24} color={palette.primaryText} />
        </PressableScale>
      </View>
      <View style={styles.months}>
        {t.dict.date.monthsShort.map((label, month) => {
          const at = monthIndex({ year, month });
          const disabled = at < monthIndex(min) || at > monthIndex(max);
          const selected = month === cursor.month;
          return (
            <View key={label} style={styles.cell}>
              <PressableScale
                testID={`calendar-month-${month}`}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled }}
                disabled={disabled}
                onPress={() => onPick({ year, month })}
                style={[
                  styles.month,
                  { backgroundColor: palette.primaryBackground },
                  selected && { backgroundColor: palette.primaryAction },
                  disabled && styles.disabled,
                ]}
              >
                <BJText
                  tone={selected ? 'onPrimary' : 'primary'}
                  weight={selected ? 'medium' : 'regular'}
                >
                  {label}
                </BJText>
              </PressableScale>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { gap: AppSpacing.lg },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: AppSpacing.sm,
  },
  months: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '33.333%', padding: AppSpacing.xs },
  month: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.3 },
});

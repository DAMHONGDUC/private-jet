import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { BJText } from '@/core/ui/BJText';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import { toDayKey } from '@/core/utils/date';
import {
  MONTHS_AHEAD,
  monthIndex,
  monthOf,
  shiftMonth,
  type MonthCursor,
} from '../calendar-months';
import { BJSheet } from './BJSheet';
import { MonthDays } from './MonthDays';
import { MonthYearPicker } from './MonthYearPicker';
import { TimeChips } from './TimeChips';

type Props = {
  visible: boolean;
  title: string;
  /** Days before this `YYYY-MM-DD` are greyed out, and so are earlier months. */
  minDay: string;
  /** The last month offered is `MONTHS_AHEAD` after this day's. */
  today: Date;
  value: string | null;
  /** `HH:MM`, or null for any time of day. */
  time: string | null;
  onPick: (day: string, time: string | null) => void;
  onClose: () => void;
};

/**
 * A day and a preferred time (feature-docs/dashboard §4.3). Months page with
 * the arrows; tapping the month name opens a month and year grid. Done
 * confirms both at once.
 */
export function CalendarSheet({
  visible,
  title,
  minDay,
  today,
  value,
  time,
  onPick,
  onClose,
}: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  const min = monthOf(minDay);
  const max = shiftMonth(monthOf(toDayKey(today)), MONTHS_AHEAD);
  const [cursor, setCursor] = useState<MonthCursor>(() =>
    monthOf(value ?? minDay),
  );
  const [day, setDay] = useState(value);
  const [hour, setHour] = useState(time);
  const [choosingMonth, setChoosingMonth] = useState(false);
  /** The day grid's height, kept by the month grid so the sheet does not jump. */
  const [gridHeight, setGridHeight] = useState<number | undefined>();

  // Each opening starts from what the field holds.
  useEffect(() => {
    if (visible) {
      setCursor(monthOf(value && value >= minDay ? value : minDay));
      setDay(value && value >= minDay ? value : null);
      setHour(time);
      setChoosingMonth(false);
    }
  }, [visible, value, time, minDay]);

  const canGoBack = monthIndex(cursor) > monthIndex(min);
  const canGoOn = monthIndex(cursor) < monthIndex(max);

  return (
    <BJSheet
      visible={visible}
      title={title}
      onClose={onClose}
      testID="calendar-sheet"
    >
      <View style={styles.nav}>
        <PressableScale
          testID="calendar-prev-month"
          accessibilityRole="button"
          accessibilityLabel={t('search.previousMonth')}
          disabled={choosingMonth || !canGoBack}
          onPress={() => setCursor(shiftMonth(cursor, -1))}
          hitSlop={8}
          style={choosingMonth ? styles.gone : !canGoBack && styles.hidden}
        >
          <Icon name="chevronLeft" size={24} color={palette.primaryText} />
        </PressableScale>
        <PressableScale
          testID="calendar-month-title"
          accessibilityRole="button"
          accessibilityLabel={t('search.chooseMonth')}
          accessibilityState={{ expanded: choosingMonth }}
          onPress={() => setChoosingMonth(open => !open)}
          style={styles.title}
        >
          <BJText>
            {t('search.monthYear', {
              month: t.dict.date.months[cursor.month],
              year: cursor.year,
            })}
          </BJText>
          {/* A right chevron turned down while closed, up while open. */}
          <View style={styles.titleIcon}>
            <Icon
              name={choosingMonth ? 'chevronLeft' : 'chevronRight'}
              size={18}
              color={palette.secondaryText}
            />
          </View>
        </PressableScale>
        <PressableScale
          testID="calendar-next-month"
          accessibilityRole="button"
          accessibilityLabel={t('search.nextMonth')}
          disabled={choosingMonth || !canGoOn}
          onPress={() => setCursor(shiftMonth(cursor, 1))}
          hitSlop={8}
          style={choosingMonth ? styles.gone : !canGoOn && styles.hidden}
        >
          <Icon name="chevronRight" size={24} color={palette.primaryText} />
        </PressableScale>
      </View>

      <View
        style={{ minHeight: gridHeight }}
        onLayout={event => {
          if (!choosingMonth) {
            setGridHeight(event.nativeEvent.layout.height);
          }
        }}
      >
        {choosingMonth ? (
          <MonthYearPicker
            cursor={cursor}
            min={min}
            max={max}
            onYear={year => {
              // Keep the month, pulled into range for that year.
              const at = Math.min(
                Math.max(
                  monthIndex({ year, month: cursor.month }),
                  monthIndex(min),
                ),
                monthIndex(max),
              );
              setCursor(shiftMonth({ year: 0, month: 0 }, at));
            }}
            onPick={next => {
              setCursor(next);
              setChoosingMonth(false);
            }}
          />
        ) : (
          <MonthDays
            cursor={cursor}
            minDay={minDay}
            selected={day}
            onPick={setDay}
          />
        )}
      </View>

      <View style={styles.time}>
        <BJText size={13} tone="secondary">
          {t('search.time')}
        </BJText>
        <TimeChips value={hour} onChange={setHour} />
      </View>

      <PressableScale
        testID="calendar-done"
        accessibilityRole="button"
        accessibilityState={{ disabled: !day }}
        disabled={!day}
        onPress={() => day && onPick(day, hour)}
        style={[
          styles.done,
          { backgroundColor: palette.primaryAction },
          !day && styles.hidden,
        ]}
      >
        <BJText tone="onPrimary">{t('search.done')}</BJText>
      </PressableScale>
    </BJSheet>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: AppSpacing.spacing12,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.spacing4,
    paddingVertical: AppSpacing.spacing4,
    paddingHorizontal: AppSpacing.spacing8,
  },
  titleIcon: { transform: [{ rotate: '90deg' }] },
  hidden: { opacity: 0.3 },
  gone: { opacity: 0 },
  time: { gap: AppSpacing.spacing8, marginTop: AppSpacing.spacing12 },
  done: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: AppSpacing.spacing16,
  },
});

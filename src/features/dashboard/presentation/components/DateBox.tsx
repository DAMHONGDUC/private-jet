import { useT } from '@/core/i18n/i18n';
import { fromDayKey } from '@/core/utils/date';
import { formatDayTime, formatShortDay } from '../search-labels';
import { FieldBox, type Align } from './FieldBox';

type Props = {
  label: string;
  /** `YYYY-MM-DD`, or null until a day is chosen. */
  day: string | null;
  /** `HH:MM`; null or absent for any time of day. */
  time?: string | null;
  align: Align;
  invalid?: boolean;
  onPress: () => void;
  testID: string;
};

/** "Departure / 20 Oct / 2026 · 09:00", or a dash until a day is chosen. */
export function DateBox({
  label,
  day,
  time,
  align,
  invalid,
  onPress,
  testID,
}: Props) {
  const t = useT();
  const detail = day
    ? t('search.dayAndTime', {
        day: String(fromDayKey(day).getFullYear()),
        time: time ?? t('search.anyTime'),
      })
    : t('search.selectDate');
  return (
    <FieldBox
      testID={testID}
      label={label}
      icon="calendar"
      value={day ? formatShortDay(day, t) : null}
      detail={detail}
      align={align}
      invalid={invalid}
      accessibilityLabel={`${label}, ${
        day ? formatDayTime(day, time, t) : t('search.notChosen')
      }`}
      onPress={onPress}
    />
  );
}

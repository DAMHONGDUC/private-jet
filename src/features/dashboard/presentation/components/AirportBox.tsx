import { useT } from '@/core/i18n/i18n';
import type { Airport } from '@/features/flights/domain/entities/flight';
import { FieldBox, type Align } from './FieldBox';

type Props = {
  label: string;
  airport: Airport | undefined;
  code: string | null;
  align: Align;
  /** Outlined in red while the field has a problem. */
  invalid?: boolean;
  onPress: () => void;
  testID: string;
};

/** "From / GVA / Geneva", or a dash until an airport is chosen. */
export function AirportBox({
  label,
  airport,
  code,
  align,
  invalid,
  onPress,
  testID,
}: Props) {
  const t = useT();
  return (
    <FieldBox
      testID={testID}
      label={label}
      value={code}
      detail={airport?.city ?? t('search.selectAirport')}
      align={align}
      invalid={invalid}
      accessibilityLabel={`${label}, ${airport?.city ?? t('search.notChosen')}`}
      onPress={onPress}
    />
  );
}

import { useT } from '@/core/i18n/i18n';
import { passengersLabel } from '../search-labels';
import { FieldButton } from './FieldButton';

type Props = {
  /** 0 until the traveller picks a count. */
  count: number;
  invalid?: boolean;
  onPress: () => void;
  testID: string;
};

/** "2 guests" on a full-width row under the dates, the same in every trip type. */
export function GuestsRow({ count, invalid, onPress, testID }: Props) {
  const t = useT();
  return (
    <FieldButton
      testID={testID}
      icon="family"
      iconSize={20}
      text={count > 0 ? passengersLabel(count, t) : t('search.passengers')}
      filled={count > 0}
      invalid={invalid}
      onPress={onPress}
    />
  );
}

import { StyleSheet } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { PressableScale } from '@/core/ui/PressableScale';
import type { Airport } from '@/features/flights/domain/entities/flight';

/** Which side of the route row a box sits on. */
export enum Align {
  Start = 'start',
  End = 'end',
}

type Props = {
  label: string;
  airport: Airport | undefined;
  code: string | null;
  placeholder: string;
  align: Align;
  /** Outlined in red while the field has a problem. */
  invalid?: boolean;
  onPress: () => void;
  testID: string;
};

/** "From / GVA / Geneva", or the placeholder until an airport is chosen. */
export function AirportBox({
  label,
  airport,
  code,
  placeholder,
  align,
  invalid,
  onPress,
  testID,
}: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  const alignItems = align === Align.Start ? 'flex-start' : 'flex-end';
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${airport?.city ?? t('search.notChosen')}`}
      onPress={onPress}
      style={[
        styles.airport,
        { backgroundColor: palette.primaryBackground, alignItems },
        invalid && { borderColor: palette.error },
      ]}
    >
      <BJText size={13} tone="secondary" weight="regular">
        {label}
      </BJText>
      <BJText size={28} tone={code ? 'primary' : 'secondary'}>
        {code ?? placeholder}
      </BJText>
      <BJText size={13} tone="secondary" weight="regular" numberOfLines={1}>
        {airport?.city ?? t('search.selectAirport')}
      </BJText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  airport: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: AppSpacing.lg,
    paddingVertical: AppSpacing.md,
    gap: AppSpacing.xs,
  },
});

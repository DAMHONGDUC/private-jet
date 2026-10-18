import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { ColorScheme } from '@/core/theme/app-colors';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { elevation, radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { PressableScale } from '@/core/ui/PressableScale';
import { TRIP_TYPES, type TripType } from '../../domain/entities/charter';
import { TRIP_TYPE_LABELS } from '../search-labels';

type Props = { value: TripType; onChange: (value: TripType) => void };

/** One Way · Round Trip · Multi City as a segmented control (feature-docs/dashboard §2.3a). */
export function TripTypeRadio({ value, onChange }: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  return (
    <View
      style={[styles.segments, { backgroundColor: palette.primaryBackground }]}
      accessibilityRole="radiogroup"
    >
      {TRIP_TYPES.map(type => {
        const selected = type === value;
        return (
          <PressableScale
            key={type}
            testID={`trip-type-${type}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(type)}
            scaleTo={1}
            style={[
              styles.segment,
              selected && {
                backgroundColor:
                  palette.scheme === ColorScheme.Dark
                    ? palette.iron
                    : palette.raised,
                ...elevation(palette.shadow),
              },
            ]}
          >
            <BJText
              size={13}
              tone={selected ? 'primary' : 'secondary'}
              weight={selected ? 'medium' : 'regular'}
            >
              {t(TRIP_TYPE_LABELS[type])}
            </BJText>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segments: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: AppSpacing.spacing4,
  },
  segment: {
    flex: 1,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

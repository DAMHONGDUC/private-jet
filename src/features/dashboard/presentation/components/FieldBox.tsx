import { StyleSheet, View } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { Icon, type IconName } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';

/** Which side of its row a box sits on. */
export enum Align {
  Start = 'start',
  End = 'end',
}

type Props = {
  label: string;
  /** Beside the label, on the box's outer edge; gold once the field holds a value. */
  icon?: IconName;
  /** The big line: "SYD", "20 Oct", "2"; null shows a dash. */
  value: string | null;
  /** The small line under it: the city, the year and time, the unit. */
  detail: string;
  align: Align;
  /** Outlined in red while the field has a problem; the card prints why below. */
  invalid?: boolean;
  accessibilityLabel: string;
  onPress: () => void;
  testID: string;
};

/**
 * A half-width tile of the search form: a small label, the value large and a
 * detail line. Each line is short, so two tiles fit side by side.
 */
export function FieldBox({
  label,
  icon,
  value,
  detail,
  align,
  invalid,
  accessibilityLabel,
  onPress,
  testID,
}: Props) {
  const palette = useBlackJetTheme();
  const alignItems = align === Align.Start ? 'flex-start' : 'flex-end';
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[
        styles.box,
        { backgroundColor: palette.primaryBackground, alignItems },
        invalid && { borderColor: palette.error },
      ]}
    >
      <View
        style={[styles.labelRow, align === Align.End && styles.labelRowEnd]}
      >
        {icon ? (
          <Icon
            name={icon}
            size={ICON_SIZE}
            color={value ? palette.accent : palette.secondaryText}
          />
        ) : null}
        <BJText size={13} tone="secondary" weight="regular">
          {label}
        </BJText>
      </View>
      <BJText
        size={28}
        tone={value ? 'primary' : 'secondary'}
        numberOfLines={1}
      >
        {value ?? '—'}
      </BJText>
      <BJText size={13} tone="secondary" weight="regular" numberOfLines={1}>
        {detail}
      </BJText>
    </PressableScale>
  );
}

/** Sized to the 13 pt label it sits beside. */
const ICON_SIZE = 16;

const styles = StyleSheet.create({
  box: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: AppSpacing.spacing16,
    paddingVertical: AppSpacing.spacing12,
    gap: AppSpacing.spacing4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.spacing8,
  },
  labelRowEnd: { flexDirection: 'row-reverse' },
});

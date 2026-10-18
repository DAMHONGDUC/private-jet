import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { Icon, type IconName } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';

type Props = {
  testID: string;
  icon: IconName;
  label: string;
  count: number;
  onPress?: () => void;
};

/** A round app-bar button with an unread count on its corner. */
export function BadgeButton({ testID, icon, label, count, onPress }: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={
        count > 0 ? t('home.unread', { label, count }) : label
      }
      disabled={!onPress}
      onPress={onPress}
      style={[styles.button, { backgroundColor: palette.primaryBackground }]}
    >
      <Icon name={icon} size={22} color={palette.jetBlack} />
      {count > 0 ? (
        <View
          testID={`${testID}-badge`}
          style={[
            styles.badge,
            {
              backgroundColor: palette.accent,
              borderColor: palette.secondaryBackground,
            },
          ]}
        >
          <BJText size={13} tone="onAccent">
            {count > 99 ? '99+' : count}
          </BJText>
        </View>
      ) : null}
    </PressableScale>
  );
}

const BUTTON = 44;

const styles = StyleSheet.create({
  button: {
    width: BUTTON,
    height: BUTTON,
    borderRadius: BUTTON / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    paddingHorizontal: AppSpacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

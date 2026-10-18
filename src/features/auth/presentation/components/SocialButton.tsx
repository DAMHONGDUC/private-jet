import { Image, StyleSheet, type ImageSourcePropType } from 'react-native';
import { radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { PressableScale } from '@/core/ui/PressableScale';
import { BORDER, WHITE } from '../login-colors';

type Props = {
  testID: string;
  label: string;
  icon: ImageSourcePropType;
  tint?: boolean;
  onPress: () => void;
};

/** Apple or Google: an outlined half-width button with the brand mark. */
export function SocialButton({ testID, label, icon, tint, onPress }: Props) {
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.outlined, styles.social]}
    >
      <Image source={icon} style={[styles.socialIcon, tint && styles.tinted]} />
      <BJText size={16} tone="white">
        {label}
      </BJText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  outlined: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  social: { flex: 1, flexDirection: 'row', gap: 8 },
  socialIcon: { width: 18, height: 18 },
  tinted: { tintColor: WHITE },
});

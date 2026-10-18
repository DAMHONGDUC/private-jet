import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { APP_NAME } from '@/core/app-identity';
import { AppColors } from '@/core/theme/app-colors';
import { AppSpacing } from '@/core/theme/app-spacing';
import { APP_ICON } from '@/core/ui/images';

/** Matches the native launch screen: same icon, same size, same place. */
const ICON = 120;

/** The app icon on near-black while the session is restored, with a small spinner under it. */
export function SplashScreen() {
  return (
    <View testID="splash" style={styles.root}>
      <Image
        source={APP_ICON}
        style={styles.icon}
        accessibilityLabel={APP_NAME}
      />
      <ActivityIndicator color={AppColors.dark.accent} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.dark.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // iOS rounds its icons by about 22% of the side.
  icon: { width: ICON, height: ICON, borderRadius: ICON * 0.2237 },
  // Absolute, so the icon stays exactly where the launch screen drew it.
  spinner: {
    position: 'absolute',
    top: '50%',
    marginTop: ICON / 2 + AppSpacing.spacing24,
  },
});

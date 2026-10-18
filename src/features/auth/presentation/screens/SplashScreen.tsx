import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { blackJetDark } from '@/core/theme/blackjet';
import { spacing } from '@/core/theme/theme';
import { LOGO, LOGO_ASPECT } from '@/core/ui/images';

const LOGO_HEIGHT = 40;

/** The wordmark on black while the session is restored, with a small spinner under it. */
export function SplashScreen() {
  return (
    <View testID="splash" style={styles.root}>
      <Image
        source={LOGO.dark}
        resizeMode="contain"
        style={styles.logo}
        accessibilityLabel="BlackJet"
      />
      <ActivityIndicator color={blackJetDark.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: blackJetDark.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  logo: { height: LOGO_HEIGHT, width: LOGO_HEIGHT * LOGO_ASPECT },
});

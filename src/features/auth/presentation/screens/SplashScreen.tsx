import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { blackJetCurves } from '@/core/theme/blackjet';
import { LOGO } from '@/core/ui/images';

const BAR_WIDTH = 120;

/** The logo eases in while the session is restored; a thin bar sweeps underneath. */
export function SplashScreen() {
  const appear = useSharedValue(0);
  const sweep = useSharedValue(0);

  useEffect(() => {
    appear.value = withTiming(1, { duration: 700, easing: Easing.bezier(...blackJetCurves.easeInOut) });
    sweep.value = withDelay(300, withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }), -1));
  }, [appear, sweep]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: appear.value,
    transform: [{ scale: 0.92 + appear.value * 0.08 }],
  }));
  const barStyle = useAnimatedStyle(() => ({
    opacity: appear.value,
    transform: [{ translateX: -BAR_WIDTH / 3 + sweep.value * (BAR_WIDTH + BAR_WIDTH / 3) }],
  }));

  return (
    <View testID="splash" style={styles.root}>
      <Animated.View style={logoStyle}>
        <Image source={LOGO.dark} resizeMode="cover" style={styles.logo} accessibilityLabel="BlackJet" />
      </Animated.View>
      <View style={styles.track}>
        <Animated.View style={[styles.bar, barStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', gap: 24 },
  logo: { width: 240, height: 120 },
  track: { width: BAR_WIDTH, height: 2, borderRadius: 1, overflow: 'hidden', backgroundColor: '#2A2B29' },
  bar: { width: BAR_WIDTH / 3, height: 2, backgroundColor: '#FFFFFF' },
});

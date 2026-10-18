import { StyleSheet } from 'react-native';
import { BJText } from '@/core/ui/BJText';
import { PressableScale } from '@/core/ui/PressableScale';
import { DEMO_CREDENTIALS } from '../../domain/entities/user';
import { MUTED } from '../login-colors';

type Props = { onPress: () => void };

/** The demo email and password under the form; tapping fills them in. */
export function DemoHint({ onPress }: Props) {
  return (
    <PressableScale
      testID="login-fill-demo"
      accessibilityRole="button"
      onPress={onPress}
      style={styles.hint}
    >
      <BJText size={13} style={styles.muted}>
        Demo account · tap to fill
      </BJText>
      <BJText size={13} tone="white">
        {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
      </BJText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  muted: { color: MUTED },
  hint: { alignItems: 'center', gap: 4, paddingVertical: 8 },
});

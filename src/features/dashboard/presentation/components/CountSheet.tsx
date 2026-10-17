import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { FadeUp } from '@/core/ui/FadeUp';
import { Icon, type IconName } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import { haptics } from '@/core/ui/haptics';
import { BJSheet } from './BJSheet';

type Props = {
  visible: boolean;
  title: string;
  /** 0 when nothing is chosen yet; the sheet then starts at 1. */
  value: number;
  max: number;
  onDone: (count: number) => void;
  onClose: () => void;
};

/** − count + and Done, each row fading up after the one before (feature-docs/dashboard §4.2). */
export function CountSheet({ visible, title, value, max, onDone, onClose }: Props) {
  const palette = useBlackJetTheme();
  const [count, setCount] = useState(Math.max(1, value));

  useEffect(() => {
    if (visible) {
      setCount(Math.max(1, value));
    }
  }, [visible, value]);

  const change = (next: number) => {
    haptics.selection();
    setCount(Math.min(max, Math.max(1, next)));
  };

  return (
    <BJSheet visible={visible} title={title} onClose={onClose} testID="count-sheet">
      <FadeUp index={1} style={styles.row}>
        <RoundButton icon="minus" testID="count-decrement" disabled={count <= 1} onPress={() => change(count - 1)} />
        <BJText testID="count-value" size={55} style={styles.value}>
          {count}
        </BJText>
        <RoundButton icon="plus" testID="count-increment" disabled={count >= max} onPress={() => change(count + 1)} />
      </FadeUp>
      <FadeUp index={2}>
        <PressableScale
          testID="count-done"
          accessibilityRole="button"
          onPress={() => {
            haptics.selection();
            onDone(count);
          }}
          style={[styles.done, { backgroundColor: palette.jetBlack }]}
        >
          <BJText size={16} tone="inverse">
            Done
          </BJText>
        </PressableScale>
      </FadeUp>
    </BJSheet>
  );
}

type RoundButtonProps = { icon: IconName; testID: string; disabled: boolean; onPress: () => void };

function RoundButton({ icon, testID, disabled, onPress }: RoundButtonProps) {
  const palette = useBlackJetTheme();
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      scaleTo={0.94}
      style={[styles.round, { backgroundColor: palette.iron }, disabled && styles.disabled]}
    >
      <Icon name={icon} size={18} color={palette.primaryText} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, marginVertical: 12 },
  value: { minWidth: 80, textAlign: 'center' },
  round: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.4 },
  done: { height: 50, borderRadius: 100, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
});

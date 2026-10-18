import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
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

/** − count + and Done (feature-docs/dashboard §4.2). */
export function CountSheet({
  visible,
  title,
  value,
  max,
  onDone,
  onClose,
}: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
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
    <BJSheet
      visible={visible}
      title={title}
      onClose={onClose}
      testID="count-sheet"
    >
      <View style={styles.row}>
        <RoundButton
          icon="minus"
          testID="count-decrement"
          disabled={count <= 1}
          onPress={() => change(count - 1)}
        />
        <BJText testID="count-value" size={28} style={styles.value}>
          {count}
        </BJText>
        <RoundButton
          icon="plus"
          testID="count-increment"
          disabled={count >= max}
          onPress={() => change(count + 1)}
        />
      </View>
      <View>
        <PressableScale
          testID="count-done"
          accessibilityRole="button"
          onPress={() => {
            haptics.selection();
            onDone(count);
          }}
          style={[styles.done, { backgroundColor: palette.primaryAction }]}
        >
          <BJText size={16} tone="onPrimary">
            {t('search.done')}
          </BJText>
        </PressableScale>
      </View>
    </BJSheet>
  );
}

type RoundButtonProps = {
  icon: IconName;
  testID: string;
  disabled: boolean;
  onPress: () => void;
};

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
      style={[
        styles.round,
        { backgroundColor: palette.primaryBackground },
        disabled && styles.disabled,
      ]}
    >
      <Icon name={icon} size={18} color={palette.primaryText} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginVertical: 16,
  },
  value: { minWidth: 64, textAlign: 'center' },
  round: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.4 },
  done: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
});

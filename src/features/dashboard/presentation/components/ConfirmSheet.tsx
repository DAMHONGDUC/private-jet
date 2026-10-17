import { StyleSheet, View } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { FadeUp } from '@/core/ui/FadeUp';
import { PressableScale } from '@/core/ui/PressableScale';
import { BJSheet } from './BJSheet';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
};

/** A yes/no question, used to remove a multi-city leg (feature-docs/dashboard §4.4). */
export function ConfirmSheet({ visible, title, message, confirmLabel, onConfirm, onClose }: Props) {
  const palette = useBlackJetTheme();
  return (
    <BJSheet visible={visible} title={title} onClose={onClose} testID="confirm-sheet">
      <FadeUp index={1}>
        <BJText tone="secondary" weight="regular" style={styles.message}>
          {message}
        </BJText>
      </FadeUp>
      <FadeUp index={2} style={styles.actions}>
        <PressableScale
          testID="confirm-cancel"
          accessibilityRole="button"
          onPress={onClose}
          style={[styles.button, styles.outlined, { borderColor: palette.iron }]}
        >
          <BJText size={16}>Cancel</BJText>
        </PressableScale>
        <View style={styles.gap} />
        <PressableScale
          testID="confirm-ok"
          accessibilityRole="button"
          onPress={onConfirm}
          style={[styles.button, { backgroundColor: palette.error }]}
        >
          <BJText size={16} tone="white">
            {confirmLabel}
          </BJText>
        </PressableScale>
      </FadeUp>
    </BJSheet>
  );
}

const styles = StyleSheet.create({
  message: { marginBottom: 16 },
  actions: { flexDirection: 'row' },
  gap: { width: 12 },
  outlined: { borderWidth: 1 },
  button: { flex: 1, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});

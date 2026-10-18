import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
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
export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
}: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  return (
    <BJSheet
      visible={visible}
      title={title}
      onClose={onClose}
      testID="confirm-sheet"
    >
      <View>
        <BJText tone="secondary" weight="regular" style={styles.message}>
          {message}
        </BJText>
      </View>
      <View style={styles.actions}>
        <PressableScale
          testID="confirm-cancel"
          accessibilityRole="button"
          onPress={onClose}
          style={[
            styles.button,
            styles.outlined,
            { borderColor: palette.iron },
          ]}
        >
          <BJText size={16}>{t('common.cancel')}</BJText>
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
      </View>
    </BJSheet>
  );
}

const styles = StyleSheet.create({
  message: { marginBottom: 24 },
  actions: { flexDirection: 'row' },
  gap: { width: 12 },
  outlined: { borderWidth: 1 },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

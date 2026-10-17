import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { FadeUp } from '@/core/ui/FadeUp';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  testID: string;
};

/**
 * The dashboard's bottom sheet: a 24 pt title with a close button, on the
 * second background with rounded top corners (feature-docs/dashboard §4).
 * The header fades up first; children wrap their own rows in `FadeUp`.
 */
export function BJSheet({ visible, title, onClose, children, testID }: Props) {
  const palette = useBlackJetTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable testID={`${testID}-backdrop`} style={styles.backdrop} onPress={onClose} />
        <View
          testID={testID}
          style={[styles.sheet, { backgroundColor: palette.secondaryBackground, paddingBottom: insets.bottom + 16 }]}
        >
          <FadeUp index={0} style={styles.header}>
            <BJText size={24} style={styles.title}>
              {title}
            </BJText>
            <PressableScale
              testID={`${testID}-close`}
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={styles.close}
            >
              <Icon name="closeCircle" size={30} color={palette.secondaryText} />
            </PressableScale>
          </FadeUp>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    maxHeight: '90%',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title: { flex: 1 },
  close: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
});

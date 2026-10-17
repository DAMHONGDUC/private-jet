import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/core/theme/theme';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

type Props = { visible: boolean; title: string; onClose: () => void; children: ReactNode; testID?: string };

/** A panel that slides up from the bottom; tapping outside closes it. */
export function BottomSheet({ visible, title, onClose, children, testID }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable testID={testID && `${testID}-backdrop`} style={styles.backdrop} onPress={onClose} />
        <View testID={testID} style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />
          <AppText variant="subtitle" style={styles.title}>
            {title}
          </AppText>
          {children}
        </View>
      </View>
    </Modal>
  );
}

type OptionProps = { label: string; selected: boolean; onPress: () => void; testID?: string };

/** One choice in a sheet: a plain row with a check when selected. */
export function SheetOption({ label, selected, onPress, testID }: OptionProps) {
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.option}
    >
      <AppText gold={selected}>{label}</AppText>
      {selected ? <AppText gold>✓</AppText> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  title: { marginBottom: spacing.sm },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});

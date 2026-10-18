import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
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
 * The dashboard's bottom sheet: a handle, a title with a close button, and
 * the content. Only the sheet itself slides up; what is inside appears at once.
 */
export function BJSheet({ visible, title, onClose, children, testID }: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          testID={`${testID}-backdrop`}
          style={[styles.backdrop, { backgroundColor: palette.scrim }]}
          onPress={onClose}
        />
        <View
          testID={testID}
          style={[
            styles.sheet,
            {
              backgroundColor: palette.secondaryBackground,
              paddingBottom: AppSpacing.bottomActionInset(insets.bottom),
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: palette.iron }]} />
          <View style={styles.header}>
            <BJText size={20} style={styles.title}>
              {title}
            </BJText>
            <PressableScale
              testID={`${testID}-close`}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              hitSlop={8}
              onPress={onClose}
              style={[
                styles.close,
                { backgroundColor: palette.primaryBackground },
              ]}
            >
              <Icon name="close" size={18} color={palette.secondaryText} />
            </PressableScale>
          </View>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: AppSpacing.spacing16,
    paddingTop: AppSpacing.spacing8,
    maxHeight: '90%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: AppSpacing.spacing12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppSpacing.spacing16,
    gap: AppSpacing.spacing12,
  },
  title: { flex: 1 },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { AppText } from './AppText';
import { useSheetMotion } from './use-sheet-motion';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  testID?: string;
};

/** A panel that slides up from the bottom over a fading scrim; tapping outside closes it. */
export function BottomSheet({
  visible,
  title,
  onClose,
  children,
  testID,
}: Props) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const motion = useSheetMotion(visible);

  return (
    <Modal
      visible={motion.mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Animated.View
          pointerEvents={visible ? 'auto' : 'none'}
          style={[styles.backdrop, motion.backdropStyle]}
        >
          <Pressable
            testID={testID && `${testID}-backdrop`}
            style={styles.fill}
            onPress={onClose}
          />
        </Animated.View>
        <Animated.View
          testID={testID}
          onLayout={motion.onSheetLayout}
          style={[
            styles.sheet,
            { paddingBottom: AppSpacing.bottomActionInset(insets.bottom) },
            motion.sheetStyle,
          ]}
        >
          <View style={styles.handle} />
          <AppText variant="title" style={styles.title}>
            {title}
          </AppText>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles(palette => ({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: palette.scrim,
  },
  fill: { flex: 1 },
  sheet: {
    backgroundColor: palette.secondaryBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: AppSpacing.spacing16,
    paddingTop: AppSpacing.spacing8,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: palette.iron,
    marginBottom: AppSpacing.spacing12,
  },
  title: { marginBottom: AppSpacing.spacing8 },
}));

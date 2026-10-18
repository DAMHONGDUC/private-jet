import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeStyles, useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  testID?: string;
};

/** A panel that slides up from the bottom; tapping outside closes it. */
export function BottomSheet({
  visible,
  title,
  onClose,
  children,
  testID,
}: Props) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          testID={testID && `${testID}-backdrop`}
          style={styles.backdrop}
          onPress={onClose}
        />
        <View
          testID={testID}
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + AppSpacing.lg },
          ]}
        >
          <View style={styles.handle} />
          <AppText variant="title" style={styles.title}>
            {title}
          </AppText>
          {children}
        </View>
      </View>
    </Modal>
  );
}

type OptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
};

/** One choice in a sheet: a plain row with a check when selected. */
export function SheetOption({ label, selected, onPress, testID }: OptionProps) {
  const styles = useStyles();
  const palette = useBlackJetTheme();
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.option}
    >
      <AppText variant={selected ? 'subtitle' : 'body'}>{label}</AppText>
      {selected ? <Icon name="check" size={20} color={palette.accent} /> : null}
    </PressableScale>
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
  sheet: {
    backgroundColor: palette.secondaryBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: AppSpacing.lg,
    paddingTop: AppSpacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: palette.iron,
    marginBottom: AppSpacing.md,
  },
  title: { marginBottom: AppSpacing.sm },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: AppSpacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.iron,
  },
}));

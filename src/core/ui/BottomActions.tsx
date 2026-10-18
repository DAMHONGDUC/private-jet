import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';

export enum ActionsDirection {
  Row = 'row',
  Column = 'column',
}

type Props = {
  children: ReactNode;
  /** `row` puts a summary beside the button; `column` stacks the buttons. */
  direction?: ActionsDirection;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * The buttons a detail screen ends with, pinned to the bottom of the screen
 * under its scrolling content. The rule for every screen: the last button
 * sits `AppSpacing.bottomAction` above the bottom safe-area edge.
 */
export function BottomActions({
  children,
  direction = ActionsDirection.Column,
  style,
  testID = 'bottom-actions',
}: Props) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  return (
    <View
      testID={testID}
      style={[
        styles.bar,
        direction === ActionsDirection.Row ? styles.row : styles.column,
        { paddingBottom: AppSpacing.bottomActionInset(insets.bottom) },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  bar: {
    paddingHorizontal: AppSpacing.screen,
    paddingTop: AppSpacing.spacing12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.iron,
    backgroundColor: palette.secondaryBackground,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.spacing12,
  },
  column: { gap: AppSpacing.spacing8 },
}));

import { StyleSheet } from 'react-native';
import { AppSpacing } from '@/core/theme/app-spacing';

/** Shared by LoadingView, ErrorView and EmptyView: centred in the space they fill. */
export const stateViewStyles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: AppSpacing.xl,
    gap: AppSpacing.md,
  },
  message: { textAlign: 'center' },
});

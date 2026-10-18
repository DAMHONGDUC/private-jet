import { StyleSheet } from 'react-native';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';

/** Shared by NoListings and ResultsLoadError, which stand in for the list. */
export const resultsStateStyles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    gap: AppSpacing.md,
    paddingVertical: AppSpacing.lg,
  },
  centered: { textAlign: 'center' },
  button: {
    height: 52,
    borderRadius: radius.md,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: AppSpacing.sm,
  },
});

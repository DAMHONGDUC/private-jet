import { StyleSheet } from 'react-native';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';

export const POPULAR_ROUTE_PHOTO = 56;

/** Shared by a popular route row and its loading skeleton, so they line up. */
export const popularRouteStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.md,
    padding: AppSpacing.sm,
    paddingRight: AppSpacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: { flex: 1, gap: AppSpacing.xs },
});

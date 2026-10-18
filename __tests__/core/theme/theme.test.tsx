import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import {
  ThemeMode,
  themeModeSelected,
} from '@/core/preferences/preferences-slice';
import { AppColors, ColorScheme } from '@/core/theme/app-colors';
import { AppSpacing } from '@/core/theme/app-spacing';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { createTestStore } from '@test-utils/test-store';

test('a bottom action sits 16 pt above the safe area', () => {
  expect(AppSpacing.bottomAction).toBe(16);
  expect(AppSpacing.bottomActionInset(0)).toBe(16);
  expect(AppSpacing.bottomActionInset(34)).toBe(50);
});

test('every gap is on the 4 pt grid', () => {
  const steps = [
    AppSpacing.xs,
    AppSpacing.sm,
    AppSpacing.md,
    AppSpacing.lg,
    AppSpacing.xl,
    AppSpacing.xxl,
    AppSpacing.xxxl,
  ];
  steps.forEach(step => expect(step % 4).toBe(0));
});

test('the light and dark palettes name the same roles', () => {
  expect(Object.keys(AppColors.dark).sort()).toEqual(
    Object.keys(AppColors.light).sort(),
  );
  expect(AppColors.of(ColorScheme.Dark)).toBe(AppColors.dark);
  expect(AppColors.of(ColorScheme.Light)).toBe(AppColors.light);
});

test('the palette follows the chosen theme over the phone setting', async () => {
  const store = createTestStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const { result, rerender } = await renderHook(() => useBlackJetTheme(), {
    wrapper,
  });

  // Jest's phone is in light mode.
  expect(result.current.scheme).toBe('light');

  await act(() => store.dispatch(themeModeSelected(ThemeMode.Dark)));
  await rerender({});
  expect(result.current).toBe(AppColors.dark);

  await act(() => store.dispatch(themeModeSelected(ThemeMode.Light)));
  await rerender({});
  expect(result.current).toBe(AppColors.light);
});

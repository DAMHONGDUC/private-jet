/**
 * The one owner of the app's gaps, all on the 4 pt grid. Each step is named
 * by its value (`spacing16` is 16 pt), so a screen reads as the numbers it
 * uses. Use a step or a role below, never a raw number, so every screen
 * breathes the same.
 */
export class AppSpacing {
  static readonly spacing4 = 4;
  static readonly spacing8 = 8;
  static readonly spacing12 = 12;
  static readonly spacing16 = 16;
  static readonly spacing20 = 20;
  static readonly spacing24 = 24;
  static readonly spacing32 = 32;
  static readonly spacing48 = 48;

  /** Inside a card. */
  static readonly card = AppSpacing.spacing20;
  /** Between the sections of a screen. */
  static readonly section = AppSpacing.spacing32;
  /** Left and right margin of a screen's content. */
  static readonly screen = AppSpacing.spacing16;
  /** Between a bottom action and the bottom safe-area edge. */
  static readonly bottomAction = AppSpacing.spacing8;

  /** Under a tab's content, so its end clears the floating tab bar. */
  static readonly tabBar = 88;

  /** Room under a bottom action: the safe area, then `bottomAction`. */
  static bottomActionInset(safeAreaBottom: number) {
    return safeAreaBottom + AppSpacing.bottomAction;
  }

  /** Room under a tab's scrolling content: the safe area, then `tabBar`. */
  static tabContentInset(safeAreaBottom: number) {
    return safeAreaBottom + AppSpacing.tabBar;
  }
}

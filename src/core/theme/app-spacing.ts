/**
 * The one owner of the app's gaps, all on the 4/8 pt grid. Use a step, never
 * a raw number, so every screen breathes the same.
 */
export class AppSpacing {
  static readonly xs = 4;
  static readonly sm = 8;
  static readonly md = 12;
  static readonly lg = 16;
  static readonly xl = 24;
  static readonly xxl = 32;
  static readonly xxxl = 48;

  /** Inside a card. */
  static readonly card = 20;
  /** Between the sections of a screen. */
  static readonly section = AppSpacing.xxl;
  /** Left and right margin of a screen's content. */
  static readonly screen = AppSpacing.lg;
  /** Between a bottom action and the bottom safe-area edge. */
  static readonly bottomAction = AppSpacing.sm;

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

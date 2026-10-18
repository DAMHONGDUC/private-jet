import { Platform, type ImageSourcePropType } from 'react-native';
import type { NativeBottomTabIcon } from '@react-navigation/bottom-tabs/unstable';

/** Bundled photos by the keys the data layer hands out. */
const IMAGES: Record<string, ImageSourcePropType> = {
  'jet-1': require('@/assets/images/jet-1.jpg'),
  'jet-2': require('@/assets/images/jet-2.jpg'),
  'jet-3': require('@/assets/images/jet-3.jpg'),
  'jet-4': require('@/assets/images/jet-4.jpg'),
  'news-1': require('@/assets/images/news-1.jpg'),
  'news-2': require('@/assets/images/news-2.jpg'),
  'news-3': require('@/assets/images/news-3.jpg'),
  'news-4': require('@/assets/images/news-4.jpg'),
};

export function imageFor(key: string): ImageSourcePropType {
  return IMAGES[key] ?? IMAGES['jet-1'];
}

/** The 1024 px app icon, the source of every launcher and launch-screen image. */
export const APP_ICON =
  require('@/assets/images/app-icon.png') as ImageSourcePropType;

/** The wordmark for each theme: dark ink on light, light ink on dark. */
export const LOGO = {
  light: require('@/assets/images/logo-light.png') as ImageSourcePropType,
  dark: require('@/assets/images/logo-dark.png') as ImageSourcePropType,
};

/** Width over height of the wordmark files. */
export const LOGO_ASPECT = 515 / 144;

const tabIcon = (
  sfSymbol: 'house' | 'airplane' | 'person.crop.circle',
  source: ImageSourcePropType,
) =>
  Platform.select<NativeBottomTabIcon>({
    ios: { type: 'sfSymbol', name: sfSymbol },
    default: { type: 'image', source },
  });

/** Outline SF Symbols on iOS, lighter than the filled set; tinted PNGs drawn from the app's icon fonts elsewhere. */
export const TAB_ICONS = {
  home: tabIcon('house', require('@/assets/images/tab-home.png')),
  trips: tabIcon('airplane', require('@/assets/images/tab-trips.png')),
  profile: tabIcon(
    'person.crop.circle',
    require('@/assets/images/tab-profile.png'),
  ),
};

export const BRAND_ICONS = {
  apple: require('@/assets/images/apple.png') as ImageSourcePropType,
  google: require('@/assets/images/google.png') as ImageSourcePropType,
};

export const NO_PLANE_FOUND = {
  light: require('@/assets/lottie/no_plane_found_light.json'),
  dark: require('@/assets/lottie/no_plane_found_dark.json'),
};

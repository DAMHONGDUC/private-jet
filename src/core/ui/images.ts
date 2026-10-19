import { Platform, type ImageSourcePropType } from 'react-native';
import type { NativeBottomTabIcon } from '@react-navigation/bottom-tabs/unstable';

/** Bundled photos by the keys the data layer hands out; sources in assets/images/CREDITS.md. */
const IMAGES: Record<string, ImageSourcePropType> = {
  'jet-1': require('@/assets/images/jet-1.webp'),
  'jet-2': require('@/assets/images/jet-2.webp'),
  'jet-3': require('@/assets/images/jet-3.webp'),
  'jet-4': require('@/assets/images/jet-4.webp'),
  'jet-5': require('@/assets/images/jet-5.webp'),
  'jet-6': require('@/assets/images/jet-6.webp'),
  'jet-7': require('@/assets/images/jet-7.webp'),
  'jet-8': require('@/assets/images/jet-8.webp'),
  'jet-9': require('@/assets/images/jet-9.webp'),
  'jet-10': require('@/assets/images/jet-10.webp'),
  'jet-11': require('@/assets/images/jet-11.webp'),
  'jet-12': require('@/assets/images/jet-12.webp'),
  'jet-13': require('@/assets/images/jet-13.webp'),
  'jet-14': require('@/assets/images/jet-14.webp'),
  'jet-15': require('@/assets/images/jet-15.webp'),
  'jet-16': require('@/assets/images/jet-16.webp'),
  'jet-17': require('@/assets/images/jet-17.webp'),
  'jet-18': require('@/assets/images/jet-18.webp'),
  'jet-19': require('@/assets/images/jet-19.webp'),
  'jet-20': require('@/assets/images/jet-20.webp'),
  'jet-21': require('@/assets/images/jet-21.webp'),
  'jet-22': require('@/assets/images/jet-22.webp'),
  'jet-23': require('@/assets/images/jet-23.webp'),
  'jet-24': require('@/assets/images/jet-24.webp'),
  'jet-25': require('@/assets/images/jet-25.webp'),
  'jet-26': require('@/assets/images/jet-26.webp'),
  'jet-27': require('@/assets/images/jet-27.webp'),
  'jet-28': require('@/assets/images/jet-28.webp'),
  'jet-29': require('@/assets/images/jet-29.webp'),
  'jet-31': require('@/assets/images/jet-31.webp'),
  'jet-32': require('@/assets/images/jet-32.webp'),
  'jet-33': require('@/assets/images/jet-33.webp'),
  'jet-34': require('@/assets/images/jet-34.webp'),
  'jet-35': require('@/assets/images/jet-35.webp'),
  'jet-36': require('@/assets/images/jet-36.webp'),
  'jet-37': require('@/assets/images/jet-37.webp'),
  'jet-38': require('@/assets/images/jet-38.webp'),
  'jet-39': require('@/assets/images/jet-39.webp'),
  'jet-40': require('@/assets/images/jet-40.webp'),
  'jet-41': require('@/assets/images/jet-41.webp'),
  'jet-42': require('@/assets/images/jet-42.webp'),
  'jet-43': require('@/assets/images/jet-43.webp'),
  'jet-44': require('@/assets/images/jet-44.webp'),
  'jet-45': require('@/assets/images/jet-45.webp'),
  'jet-46': require('@/assets/images/jet-46.webp'),
  'jet-47': require('@/assets/images/jet-47.webp'),
  'jet-48': require('@/assets/images/jet-48.webp'),
  'jet-49': require('@/assets/images/jet-49.webp'),
  'jet-50': require('@/assets/images/jet-50.webp'),
  'jet-51': require('@/assets/images/jet-51.webp'),
  'jet-52': require('@/assets/images/jet-52.webp'),
  'jet-53': require('@/assets/images/jet-53.webp'),
  'jet-54': require('@/assets/images/jet-54.webp'),
  'jet-55': require('@/assets/images/jet-55.webp'),
  'jet-56': require('@/assets/images/jet-56.webp'),
  'jet-57': require('@/assets/images/jet-57.webp'),
  'cabin-1': require('@/assets/images/cabin-1.webp'),
  'cabin-2': require('@/assets/images/cabin-2.webp'),
  'cabin-3': require('@/assets/images/cabin-3.webp'),
  'cabin-4': require('@/assets/images/cabin-4.webp'),
  'cabin-5': require('@/assets/images/cabin-5.webp'),
  'cabin-6': require('@/assets/images/cabin-6.webp'),
  'cabin-7': require('@/assets/images/cabin-7.webp'),
  'cabin-8': require('@/assets/images/cabin-8.webp'),
  'cabin-9': require('@/assets/images/cabin-9.webp'),
  'cabin-10': require('@/assets/images/cabin-10.webp'),
  'news-1': require('@/assets/images/news-1.webp'),
  'news-2': require('@/assets/images/news-2.webp'),
  'news-3': require('@/assets/images/news-3.webp'),
  'news-4': require('@/assets/images/news-4.webp'),
  'news-5': require('@/assets/images/news-5.webp'),
  'news-6': require('@/assets/images/news-6.webp'),
};

const REMOTE = /^https?:\/\//i;

/**
 * A photo the data layer names: an http(s) URL from the backend loads over
 * the network, a bundled key loads from the app, anything else shows jet-1.
 */
export function imageFor(key: string): ImageSourcePropType {
  if (REMOTE.test(key)) {
    return { uri: key };
  }
  return IMAGES[key] ?? IMAGES['jet-1'];
}

/** The portrait photo behind the login form. */
export const LOGIN_PHOTO =
  require('@/assets/images/login.webp') as ImageSourcePropType;

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

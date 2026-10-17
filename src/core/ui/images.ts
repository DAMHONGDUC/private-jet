import type { ImageSourcePropType } from 'react-native';

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

export const LOGO = {
  light: require('@/assets/images/logo-light.png') as ImageSourcePropType,
  dark: require('@/assets/images/logo-dark.png') as ImageSourcePropType,
};

export const BRAND_ICONS = {
  apple: require('@/assets/images/apple.png') as ImageSourcePropType,
  google: require('@/assets/images/google.png') as ImageSourcePropType,
};

export const NO_PLANE_FOUND = {
  light: require('@/assets/lottie/no_plane_found_light.json'),
  dark: require('@/assets/lottie/no_plane_found_dark.json'),
};

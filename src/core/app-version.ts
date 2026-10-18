import { Platform } from 'react-native';
import appVersion from '../../app-version.json';

/**
 * The version name the store shows for this platform, from app-version.json
 * at the project root (`iosVersion` or `androidVersion`).
 */
export const APP_VERSION: string = Platform.select({
  ios: appVersion.iosVersion,
  default: appVersion.androidVersion,
});

/**
 * This platform's build number, from the same file. TestFlight builds use the
 * next free number on App Store Connect instead of `iosBuild`.
 */
export const APP_BUILD: number = Platform.select({
  ios: appVersion.iosBuild,
  default: appVersion.androidBuild,
});

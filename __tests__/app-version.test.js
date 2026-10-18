// Plain JS: it reads native project files with Node's fs, which the app's
// TypeScript setup has no types for.
const fs = require('fs');
const path = require('path');
const appVersion = require('../app-version.json');
const { APP_BUILD, APP_VERSION } = require('@/core/app-version');
const { bumpVersion } = require('../scripts/app-version.js');

const root = path.resolve(__dirname, '..');

test("the app reads its own platform's pair from app-version.json", () => {
  // Jest runs as iOS.
  expect(APP_VERSION).toBe(appVersion.iosVersion);
  expect(APP_BUILD).toBe(appVersion.iosBuild);
});

test('app-version.json has a version and a build for each platform', () => {
  expect(Object.keys(appVersion).sort()).toEqual([
    'androidBuild',
    'androidVersion',
    'iosBuild',
    'iosVersion',
  ]);
});

test('the Xcode project matches app-version.json (run `make version` if not)', () => {
  const project = fs.readFileSync(
    path.join(root, 'ios/BackJet.xcodeproj/project.pbxproj'),
    'utf8',
  );
  const versions = [...project.matchAll(/MARKETING_VERSION = ([^;]+);/g)];
  const builds = [...project.matchAll(/CURRENT_PROJECT_VERSION = ([^;]+);/g)];
  expect(versions.length).toBeGreaterThan(0);
  versions.forEach(([, value]) => expect(value).toBe(appVersion.iosVersion));
  builds.forEach(([, value]) =>
    expect(Number(value)).toBe(appVersion.iosBuild),
  );
});

test('Android takes its pair from app-version.json', () => {
  const gradle = fs.readFileSync(
    path.join(root, 'android/app/build.gradle'),
    'utf8',
  );
  expect(gradle).toMatch(/versionCode appVersion\.androidBuild/);
  expect(gradle).toMatch(/versionName appVersion\.androidVersion/);
});

test('bumping moves to the next version and resets the lower parts', () => {
  expect(bumpVersion('1.2.3', 'patch')).toBe('1.2.4');
  expect(bumpVersion('1.2.3', 'minor')).toBe('1.3.0');
  expect(bumpVersion('1.2.3', 'major')).toBe('2.0.0');
  expect(bumpVersion('1.0', 'patch')).toBe('1.0.1');
});

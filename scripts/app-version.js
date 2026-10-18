#!/usr/bin/env node
// app-version.json at the project root holds the version name and build
// number of each platform: iosVersion, iosBuild, androidVersion, androidBuild.
// Android and the app read the file directly; the Xcode project cannot, so
// this script copies the iOS pair into it.
//
//   node scripts/app-version.js sync                     copy the iOS pair into the Xcode project
//   node scripts/app-version.js bump build [ios|android] build + 1
//   node scripts/app-version.js bump patch|minor|major [ios|android]
//                                                        next version, build + 1
//   node scripts/app-version.js set 1.2.0 [ios|android]  that version, build + 1
//
// Without a platform, both change.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VERSION_FILE = path.join(ROOT, 'app-version.json');
const PBXPROJ = path.join(ROOT, 'ios/BackJet.xcodeproj/project.pbxproj');
const VERSION_PATTERN = /^\d+(\.\d+){1,2}$/;
const PLATFORMS = ['ios', 'android'];

const versionKey = platform => `${platform}Version`;
const buildKey = platform => `${platform}Build`;

function read() {
  const file = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
  for (const platform of PLATFORMS) {
    const version = file[versionKey(platform)];
    const build = file[buildKey(platform)];
    if (!VERSION_PATTERN.test(version ?? '')) {
      throw new Error(
        `app-version.json: ${versionKey(
          platform,
        )} "${version}" is not like 1.2 or 1.2.3.`,
      );
    }
    if (!Number.isInteger(build) || build < 1) {
      throw new Error(
        `app-version.json: ${buildKey(
          platform,
        )} must be a whole number from 1, not ${build}.`,
      );
    }
  }
  return file;
}

function write(next) {
  fs.writeFileSync(VERSION_FILE, `${JSON.stringify(next, null, 2)}\n`);
}

/** Every build configuration of the iOS target gets the iOS pair. */
function sync(file) {
  const project = fs.readFileSync(PBXPROJ, 'utf8');
  const next = project
    .replace(
      /MARKETING_VERSION = [^;]+;/g,
      `MARKETING_VERSION = ${file.iosVersion};`,
    )
    .replace(
      /CURRENT_PROJECT_VERSION = [^;]+;/g,
      `CURRENT_PROJECT_VERSION = ${file.iosBuild};`,
    );
  if (next !== project) {
    fs.writeFileSync(PBXPROJ, next);
  }
  return next !== project;
}

function bumpVersion(version, part) {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number);
  switch (part) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(
        `Unknown part "${part}": use build, patch, minor or major.`,
      );
  }
}

/** The platforms a command touches: the one named, or both. */
function platformsOf(name) {
  if (!name) {
    return PLATFORMS;
  }
  if (!PLATFORMS.includes(name)) {
    throw new Error(`Unknown platform "${name}": use ios or android.`);
  }
  return [name];
}

function main([command, arg, platform]) {
  const current = read();
  const next = { ...current };
  if (command === 'bump') {
    for (const p of platformsOf(platform)) {
      if (arg !== 'build') {
        next[versionKey(p)] = bumpVersion(current[versionKey(p)], arg);
      }
      next[buildKey(p)] = current[buildKey(p)] + 1;
    }
  } else if (command === 'set') {
    if (!VERSION_PATTERN.test(arg ?? '')) {
      throw new Error('Give the version, e.g. set 1.2.0');
    }
    for (const p of platformsOf(platform)) {
      next[versionKey(p)] = arg;
      next[buildKey(p)] = current[buildKey(p)] + 1;
    }
  } else if (command !== 'sync') {
    throw new Error(
      'Use: sync | bump build|patch|minor|major [ios|android] | set <version> [ios|android]',
    );
  }
  if (JSON.stringify(next) !== JSON.stringify(current)) {
    write(next);
  }
  const changed = sync(next);
  console.log(
    `iOS ${next.iosVersion} (${next.iosBuild}), Android ${next.androidVersion} (${next.androidBuild})` +
      (changed
        ? '; Xcode project updated.'
        : '; Xcode project already matches.'),
  );
}

if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { read, bumpVersion, VERSION_FILE, PBXPROJ };

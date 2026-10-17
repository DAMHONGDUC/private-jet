/**
 * One-step setup: latest code, JS dependencies, then a clean CocoaPods install on macOS.
 *
 * Usage:
 *   npm run setup               pull, install, reinstall pods
 *   npm run setup:ios           the same, then build and open the iOS app
 *   npm run setup:android       the same, then build and open the Android app
 *   npm run setup -- --no-pull  skip `git pull` (e.g. with local commits not pushed yet)
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const ios = path.join(root, 'ios');
const args = process.argv.slice(2);
const target = ['ios', 'android'].find(platform => args.includes(platform));

function run(command, cwd = root, env = process.env) {
  console.log(`\n> ${command}`);
  execSync(command, { cwd, stdio: 'inherit', env });
}

function remove(relative) {
  const full = path.join(root, relative);
  if (fs.existsSync(full)) {
    console.log(`\n> rm -rf ${relative}`);
    fs.rmSync(full, { recursive: true, force: true });
  }
}

if (!args.includes('--no-pull')) {
  // Fast-forward only: never creates a merge commit; stops if the branch has diverged.
  run('git pull --ff-only');
}

run('npm ci');

if (process.platform === 'darwin') {
  run('bundle install');
  // A clean install, so pods match package.json after a pull or a branch switch.
  remove('ios/Pods');
  remove('ios/Podfile.lock');
  remove('ios/build');
  // CocoaPods crashes with an encoding error when the shell locale is not UTF-8.
  run('bundle exec pod install --repo-update', ios, { ...process.env, LANG: 'en_US.UTF-8', LC_ALL: 'en_US.UTF-8' });
} else {
  console.log('\nSkipping CocoaPods: iOS builds need macOS.');
}

if (target) {
  run(`npm run ${target}`);
} else {
  console.log('\nSetup done. Next: npm run android  or  npm run ios');
}

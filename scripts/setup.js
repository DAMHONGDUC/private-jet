/**
 * One-step setup: JS dependencies, then CocoaPods on macOS.
 * Usage: npm run setup
 */
const { execSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');

function run(command, cwd = root) {
  console.log(`\n> ${command}`);
  execSync(command, { cwd, stdio: 'inherit' });
}

run('npm ci');

if (process.platform === 'darwin') {
  run('bundle install');
  run('bundle exec pod install', path.join(root, 'ios'));
} else {
  console.log('\nSkipping CocoaPods: iOS builds need macOS.');
}

console.log('\nSetup done. Next: npm run android  or  npm run ios');

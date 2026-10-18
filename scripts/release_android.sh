#!/usr/bin/env bash
# make release-android-<env>: the next androidBuild from app-version.json, a release AAB signed
# with the upload key in android/release-signing.properties, copied into Release/ as
# <env>-<APP_NAME>-<androidVersion>-<androidBuild>.aab. A failed build puts the file back.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../packages/script-tools/common/lib/release_output.sh
source "$root/packages/script-tools/common/lib/release_output.sh"

env="${1:-}"
version_file="$root/app-version.json"
setting() { sed -n "s/^$1=//p" "$root/script-tools.properties" | head -1; }

envs="$(setting FLAVORS)"
case " ${envs:-dev} " in
  *" $env "*) ;;
  *) echo "Unknown environment: '$env' (one of: ${envs:-dev})" >&2; exit 1 ;;
esac

if [ ! -f "$root/android/release-signing.properties" ]; then
  echo "android/release-signing.properties is missing: copy android/release-signing.properties.example and fill it in." >&2
  exit 1
fi

if [ -z "${ANDROID_HOME:-}" ] && [ ! -f "$root/android/local.properties" ] && [ -d "$HOME/Library/Android/sdk" ]; then
  export ANDROID_HOME="$HOME/Library/Android/sdk"
fi
if [ -z "${JAVA_HOME:-}" ] && [ -d "/Applications/Android Studio.app/Contents/jbr/Contents/Home" ]; then
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
fi

backup="$(mktemp)"
cp "$version_file" "$backup"
restore() {
  cp "$backup" "$version_file"
  node "$root/scripts/app-version.js" sync >/dev/null
  rm -f "$backup"
  echo "Release failed; app-version.json is back as it was." >&2
}

node "$root/scripts/app-version.js" bump build android
version="$(node -p "require(process.argv[1]).androidVersion" "$version_file")"
build="$(node -p "require(process.argv[1]).androidBuild" "$version_file")"

if ! (cd "$root/android" && ./gradlew :app:bundleRelease); then
  restore
  exit 1
fi
rm -f "$backup"

app_name="$(setting APP_NAME)"
app_name="${app_name:-$(basename "$root")}"
published="$(publish_release_file "$root" "$root/android/app/build/outputs/bundle/release/app-release.aab" \
  "$env-$app_name-$version-$build" aab "$env-$app_name-")"
print_release_summary "$published"
echo "androidBuild is now $build in app-version.json; commit it with the release."

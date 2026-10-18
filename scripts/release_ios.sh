#!/usr/bin/env bash
# make release-ios-<env> [NOTE="..."]: the next iosBuild from app-version.json, then the shared
# TestFlight release (script-tools) building exactly that number. ios/fastlane/Fastfile makes the
# shared lane use it and stops if TestFlight already has it. A failed release puts the file back.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
env="${1:-}"
note="${2:-}"
version_file="$root/app-version.json"

backup="$(mktemp)"
cp "$version_file" "$backup"
restore() {
  cp "$backup" "$version_file"
  node "$root/scripts/app-version.js" sync >/dev/null
  rm -f "$backup"
  echo "Release failed; app-version.json is back as it was." >&2
}

node "$root/scripts/app-version.js" bump build ios
build="$(node -p "require(process.argv[1]).iosBuild" "$version_file")"

if ! RN_IOS_BUILD="$build" bash "$root/packages/script-tools/react_native/release_ios.sh" "$env" "$note"; then
  restore
  exit 1
fi

rm -f "$backup"
echo "iosBuild is now $build in app-version.json; commit it with the release."

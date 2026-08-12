#!/bin/sh
set -eu

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
extension_version=$(node -e 'const manifest = require(process.argv[1]); process.stdout.write(manifest.version)' -- "$project_root/manifest.json")
release_dir="$project_root/dist"
release_archive="$release_dir/screen-slot-$extension_version.zip"

mkdir -p "$release_dir"
rm -f "$release_archive"

cd "$project_root"
zip -qr "$release_archive" \
  manifest.json \
  LICENSE \
  _locales \
  icons \
  background \
  popup \
  setup \
  options \
  shared

unzip -tq "$release_archive"
printf '%s\n' "$release_archive"

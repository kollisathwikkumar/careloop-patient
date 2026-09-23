#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="${0:A:h}"
ROOT="${TARGET_ROOT:-$SCRIPT_DIR}"

RESTORE_FILES=(
  "src/app/index.tsx"
  "src/app/(tabs)/home.tsx"
  "src/app/(tabs)/journey.tsx"
  "src/app/(tabs)/alerts.tsx"
  "src/app/(tabs)/alert-detail.tsx"
)

for file in "${RESTORE_FILES[@]}"; do
  mkdir -p "$ROOT/$(dirname "$file")"
  git -C "$SCRIPT_DIR" show "HEAD:$file" > "$ROOT/$file"
done

rm -f "$ROOT/src/app/doctor.tsx"
rm -f "$ROOT/src/lib/appointment.ts"
rm -f "$ROOT/assets/images/careloop/"*-app.png
rm -f "$ROOT/assets/images/careloop/logo-lockup-transparent.png"
rm -f "$ROOT/assets/images/careloop/splash-lockup-transparent.png"

print "rollback copy restored"

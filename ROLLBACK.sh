#!/bin/zsh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
COPY="${ROOT}.rollback-check"
rm -rf "$COPY"
git clone --quiet "$ROOT" "$COPY"
cd "$COPY"
git checkout -- 'src/app/(tabs)/home.tsx' 'src/app/(tabs)/journey.tsx' 'src/app/(tabs)/alerts.tsx' src/hooks/use-color-scheme.web.ts
rm -f 'src/app/(tabs)/more.tsx'
rm -f src/app/appointments.tsx src/app/settings.tsx
npx tsc --noEmit >/dev/null
rm -rf "$COPY"
printf '%s\n' 'rollback verified in isolated copy'

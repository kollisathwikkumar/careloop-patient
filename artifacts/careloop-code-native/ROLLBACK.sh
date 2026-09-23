#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TARGET_COPY="${1:?Usage: ROLLBACK.sh /absolute/path/to/isolated-test-copy}"
TARGET_COPY="$(cd "$TARGET_COPY" && pwd)"
ROOT="$(cd "$ROOT" && pwd)"
if [[ "$TARGET_COPY" == "$ROOT" ]]; then
  echo "Refusing to target the active working tree." >&2
  exit 2
fi
MARKER="$TARGET_COPY/ROLLBACK_TEST_MARKER"
if [[ ! -f "$MARKER" ]] || [[ "$(cat "$MARKER")" != "CARELOOP_NATIVE_ROLLBACK_TEST" ]]; then
  echo "Target is not marked as an isolated rollback test copy." >&2
  exit 2
fi
BASELINE_COMMIT="$(cat "$(dirname "$0")/BASELINE_COMMIT")"
for path in 'src/app/(tabs)/home.tsx' 'src/app/(tabs)/alerts.tsx' 'src/app/(tabs)/journey.tsx'; do
  mkdir -p "$TARGET_COPY/$(dirname "$path")"
  git -C "$ROOT" show "$BASELINE_COMMIT:$path" > "$TARGET_COPY/$path"
done
rm -f "$TARGET_COPY/src/components/careloop-ui.tsx"
printf 'Restored 3 patient screens to %s in isolated copy; removed the added shared UI component.\n' "$BASELINE_COMMIT"

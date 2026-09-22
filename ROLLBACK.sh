#!/bin/zsh
set -euo pipefail

ROOT="${TARGET_ROOT:-.}"
INDEX="$ROOT/src/app/index.tsx"

python3 - "$INDEX" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()
text = text.replace("logo-lockup-transparent.png", "logo-lockup.png")
text = text.replace("splash-lockup-transparent.png", "splash-lockup.png")
path.write_text(text)
PY

rm -f "$ROOT/assets/images/careloop/logo-lockup-transparent.png"
rm -f "$ROOT/assets/images/careloop/splash-lockup-transparent.png"
print "rollback copy restored"

#!/bin/bash
set -euo pipefail
TARGET_ROOT="${TARGET_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
TARGET_FILE="$TARGET_ROOT/CARELOOP_FULL_PLATFORM_REQUIREMENTS.md"
EXPECTED_SHA256="d2e4dc6f1aed2140815c0562a0c9ac143359b1412ec14ad3576e6d0b5662596e"
python3 - "$TARGET_FILE" "$EXPECTED_SHA256" <<'PYROLLBACK'
from pathlib import Path
import hashlib, sys
path = Path(sys.argv[1])
expected = sys.argv[2]
if not path.is_file():
    print(f"rollback target missing: {path}", file=sys.stderr)
    raise SystemExit(1)
actual = hashlib.sha256(path.read_bytes()).hexdigest()
if actual != expected:
    print(f"rollback hash mismatch; left target unchanged: {path}", file=sys.stderr)
    raise SystemExit(2)
path.unlink()
print(f"rollback copy restored baseline (new document removed): {path}")
PYROLLBACK

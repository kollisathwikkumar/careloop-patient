#!/bin/bash
set -euo pipefail
TARGET_ROOT="${TARGET_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
TARGET_FILE="$TARGET_ROOT/CARELOOP_CODE_REVIEW.md"
EXPECTED_SHA256="c4348a3fe2bb2d5e171817d670e74496888afd3516517025e3c6fbfb4676f71a"
python3 - "$TARGET_FILE" "$EXPECTED_SHA256" <<'PYROLLBACK'
from pathlib import Path
import hashlib, sys
p = Path(sys.argv[1])
expected = sys.argv[2]
if not p.is_file():
    print(f"rollback target absent (already restored): {p}")
    raise SystemExit(0)
actual = hashlib.sha256(p.read_bytes()).hexdigest()
if actual != expected:
    print(f"rollback refused: hash mismatch for {p}")
    raise SystemExit(2)
p.unlink()
print(f"rollback copy restored baseline (new review removed): {p}")
PYROLLBACK

#!/bin/zsh
set -euo pipefail

DEVICE_NAME="${IOS_SIMULATOR_DEVICE:-iPhone 17 Pro Max}"
DEVICE_ID="$(xcrun simctl list devices available | grep -F "$DEVICE_NAME" | sed -n 's/.*(\([0-9A-F-][0-9A-F-]*\)).*/\1/p' | head -1)"

if [[ -z "$DEVICE_ID" ]]; then
  print -u2 "Simulator device not found: $DEVICE_NAME"
  print -u2 "Available devices:"
  xcrun simctl list devices available
  exit 1
fi

STATE="$(xcrun simctl list devices | awk -v id="$DEVICE_ID" '$0 ~ id { if ($0 ~ /Booted/) print "Booted"; else print "Shutdown"; exit }')"
if [[ "$STATE" != "Booted" ]]; then
  xcrun simctl boot "$DEVICE_ID"
fi
xcrun simctl bootstatus "$DEVICE_ID" -b

# Expo resolves the already-booted simulator and starts Metro with the iOS target.
exec npx expo start --ios

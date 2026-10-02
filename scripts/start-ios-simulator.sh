#!/bin/zsh
set -euo pipefail

DEVICE_NAME="${IOS_SIMULATOR_DEVICE:-iPhone 18 Pro}"
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

# Expo still uses LAN mode so the simulator can load the JavaScript bundle from Metro.
EXPO_HOST_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
if [[ -z "$EXPO_HOST_IP" ]]; then
  print -u2 "Could not determine the Mac's LAN address for Expo."
  exit 1
fi

# Expo uses LAN mode so the simulator can load the JS bundle from Metro. Once
# Expo Go is installed and Metro is ready, direct the simulator to the patient
# demo route instead of leaving it on the account welcome/sign-in screen.
npx expo start --ios --lan &
EXPO_PID=$!
trap 'kill "$EXPO_PID" 2>/dev/null || true' EXIT INT TERM

for attempt in {1..90}; do
  if curl --silent --fail http://127.0.0.1:8081/status >/dev/null \
    && xcrun simctl get_app_container "$DEVICE_ID" host.exp.Exponent app >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

sleep 3
xcrun simctl openurl "$DEVICE_ID" "exp://${EXPO_HOST_IP}:8081/--/home"
wait "$EXPO_PID"

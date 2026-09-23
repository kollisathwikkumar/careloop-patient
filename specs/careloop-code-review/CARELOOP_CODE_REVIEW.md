# CareLoop Patient — Full Code Verification & Security Review

**Review date:** 2026-09-23  
**Scope:** Current CareLoop Patient repository working tree, including the existing uncommitted changes  
**Reviewed code:** 26 TypeScript/TSX files, 2,757 source lines, app configuration, package manifest/lockfile, local environment-variable names, and build scripts  
**Review mode:** Read-only; application source was not changed

## Executive result

**Status: prototype builds for iOS and Android, but the project is not a complete working CareLoop system or a production-ready patient application.** The iOS and Android JavaScript bundles export successfully, Expo Doctor passes 21/21 checks, TypeScript passes, and core screens were smoke-opened in an iPhone simulator. The configured static web export fails at runtime during server rendering. Lint fails on one hook rule. The dependency audit reports 14 moderate advisories.

The repository contains a patient-facing Expo app, not the requested doctor/staff website or complete care operations platform. Most patient records, appointment history, doctor details, and alerts are static sample content. There is no patient/doctor database schema, no report or medication workflow, no QR camera scanner, and no doctor/staff dashboard code in this repository.

## Findings (highest priority first)

### 1. BLOCKER — Web static export crashes during server rendering

**Evidence:** `app.json` sets `web.output` to `static`; `src/lib/supabase.ts:19-25` supplies React Native AsyncStorage as the persistent Supabase auth store. `npx expo export --platform web` fails with `ReferenceError: window is not defined` while Expo Router statically renders the app and the storage adapter accesses browser storage.

**Impact:** The current configured static web export does not complete. This also blocks using this repository as the web dashboard without first separating the browser/server storage path and building the dashboard itself.

**Verification:** Reproduced twice; `npx expo export --platform web` exited 7. The combined all-platform export bundled native targets and then failed in web rendering.

### 2. BLOCKER — The requested doctor/staff operations dashboard is absent

**Evidence:** Routes are patient-facing screens under `src/app/`. The “My Doctor” page is `src/app/doctor.tsx`; no doctor/staff sign-up dashboard, role administration, patient allocation, report upload, medication editor, or clinic work queue exists. Source search found no Supabase table, RPC, Storage, or server-function calls and no migrations/schema files.

**Impact:** Doctor/staff users cannot register, create or allocate patients, enter reports or medication records, manage care plans, or coordinate follow-ups through this codebase. The application cannot provide the previously described full operations workflow.

### 3. HIGH — QR connection is a visual flow, not QR scanning or patient linking

**Evidence:** `src/app/index.tsx:441-443` routes the Scan button directly to a hard-coded doctor-confirmation view. The connection-code Continue button only checks for a non-empty string before taking the same path. No camera/barcode/QR dependency is present in `package.json`. Pressing Connect only changes local screen state; no invitation is validated or saved.

**Impact:** Any non-empty code appears to connect the patient, without scanning, expiry, identity matching, patient consent enforcement, or a backend relationship. “Verified Doctor” and “You’re connected” are not verified server results.

### 4. HIGH — No server-side patient data authorization can be verified

**Evidence:** The app has a Supabase auth client, but no database operations, schema/migrations, RLS policies, or server-side authorization code are present. `src/app/(tabs)/_layout.tsx` and `src/app/_layout.tsx` render stacks without route protection. Patient screens are directly addressable routes.

**Impact:** There is no repository evidence that future patient/report data will be limited to assigned doctors, staff roles, or a patient’s own account. Client-side route checks alone would not protect patient records. The configured `EXPO_PUBLIC_*` Supabase values are public client configuration; their presence does not demonstrate database protection.

**Note:** `.env.local` is ignored by Git and is not tracked. No service-role/private-key marker was found in `src/`, `app.json`, or `package.json`. The actual Supabase project policies are not included in this repository, so their configuration was not verified.

### 5. HIGH — Untrusted alert URL value can crash the detail screen (reproduced)

**Evidence:** `src/app/(tabs)/alert-detail.tsx:80-85` checks `candidate in DETAILS`. Because `DETAILS` is a normal object, inherited names such as `toString` pass this check. The resulting function has no `sections`; the screen later calls `detail.sections.map(...)` at line 145.

**Reproduction:** Opening `exp://127.0.0.1:8085/--/alert-detail?type=toString` on the iOS simulator showed an Expo Render Error: `Cannot read property 'map' of undefined` at `alert-detail.tsx:145`.

**Impact:** A malformed/deep-linked alert URL can crash the current screen. Unknown values should be validated against own keys or an explicit allowlist and fall back to a valid alert kind.

### 6. MEDIUM — Appointment data is local, not account-scoped or shared

**Evidence:** `src/lib/appointment.ts:27-28` uses one fixed AsyncStorage key, `@careloop/follow-up-appointment`, and one module-level cache for all sessions. `loadAppointment` suppresses read errors and returns cached/default content. No user ID or server record is involved.

**Impact:** Appointment updates are only device-local and will not reach the doctor dashboard or another device. On a shared device, an appointment saved by one account can appear to another account. The app currently renders sample records, but this storage model must not be used for real multi-patient data.

### 7. MEDIUM — Save failure can leave the in-memory appointment cache changed

**Evidence:** `src/lib/appointment.ts:64-66` assigns `cachedAppointment` before awaiting AsyncStorage. If the write rejects, screens may revert React state while subsequent `loadAppointment()` returns the changed cache. `HomeScreen` catches the write error at `src/app/(tabs)/home.tsx:201-205`, but the module cache is not restored.

**Impact:** The UI can report that a confirmation failed while later views still display the failed appointment change.

### 8. MEDIUM — Auth network exceptions can leave the form stuck loading

**Evidence:** `src/app/index.tsx:412-429` awaits `signInWithOtp` and `verifyOtp` without `try/catch/finally`. Returned Supabase errors are handled, but a rejected promise/network exception skips `setLoading(false)` and may become an unhandled rejection. `getSession` at lines 397-402 and `signOut` at line 434 also lack explicit error handling.

**Impact:** A transient network failure can leave the user on a permanently disabled/loading form or produce an unhandled error.

### 9. MEDIUM — Visible settings and care actions are mostly placeholders

**Evidence:** `src/app/(tabs)/more.tsx:93-102` shows alerts for profile edit, language, notifications, support, privacy, and sign-out; the “Appointments” item navigates to Alerts. Simple Mode only toggles local state and displays an alert. “Mark all read” in Alerts only shows a message. Doctor phone/email buttons in `src/app/doctor.tsx` show alerts instead of opening contact apps.

**Impact:** Controls look operational but do not persist changes or complete their advertised action. The More-page sign-out does not call Supabase sign-out.

### 10. MEDIUM — Screens are image-backed mockups with fixed data and fragile hotspots

**Evidence:** `home.tsx`, `alerts.tsx`, `journey.tsx`, and `more.tsx` use full-screen PNGs as the primary screen content, then position transparent hotspots over the artwork. Alert and journey records and doctor identity are hard-coded. The app uses screen-relative positions, so text scaling, localization, aspect-ratio changes, and small-device layouts can misalign targets. Screen readers receive sparse labels rather than the full content.

**Impact:** This is suitable for a visual prototype, not a responsive, data-driven interface. Changing data does not update most visible content, and accessibility/layout cannot be reliably validated from the underlying image.

### 11. MEDIUM — Static appointment copy contains date inconsistencies

**Evidence:** `src/app/(tabs)/alerts.tsx:38` says “tomorrow” for 28 September 2026, although the review date is 23 September 2026. Other alert and detail records contain fixed historical/future dates and names.

**Impact:** Reminders can mislead users as the date changes or when the saved appointment differs from the image content.

### 12. MEDIUM — Dependency audit reports moderate advisories

**Evidence:** `npm audit --omit=dev` reports **14 moderate, 0 high, 0 critical**. Reported transitive paths include `decode-uri-component` through `query-string`/`expo-router`, and `uuid` through `xcode`/Expo config tooling. npm's suggested automatic fixes include major, incompatible Expo/router changes; do not apply them blindly. Resolve against the installed Expo SDK 57-compatible release set and rerun the audit.

### 13. LOW — Lint failure in web color-scheme hook

**Evidence:** `src/hooks/use-color-scheme.web.ts:11` calls `setHasHydrated(true)` synchronously inside an effect. `npm run lint` reports one `react-hooks/set-state-in-effect` error.

**Impact:** The project lint gate fails, though TypeScript and native bundle exports currently pass.

### 14. LOW — Store build identifiers are absent

**Evidence:** `app.json` does not define `ios.bundleIdentifier` or `android.package`.

**Impact:** Store/development build identity still needs to be configured before distribution.

## Verification results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | PASS, exit 0, no output |
| `npx expo-doctor` | PASS, 21/21 checks |
| iOS JavaScript export | PASS, exit 0; 3.2 MB JS bundle |
| Android JavaScript export | PASS, exit 0; 3.5 MB JS bundle |
| Web static export | FAIL, exit 7; `ReferenceError: window is not defined` during SSR |
| `npx expo export` (all configured targets) | FAIL, exit 7 when web static rendering starts after native bundles |
| `npm run lint` | FAIL, exit 1; one hook-rule error listed above |
| `npm audit --omit=dev` | FAIL, exit 1; 14 moderate, 0 high, 0 critical |
| `git diff --check` | PASS, exit 0 |
| iOS simulator smoke | Home, More, Alerts, Journey, and Doctor screens opened; malformed `type=toString` alert route visibly crashed; simulator returned to Home afterward |
| Android runtime smoke | Not run; no `adb` executable/emulator was available. Android JS bundle export passed. |
| Automated test suite | None found; `package.json` has no test script and repository has zero `*.test.*` / `*.spec.*` files. |

## Security checklist summary

| Area | Result | Evidence / remaining verification |
|---|---|---|
| Injection | No direct SQL, shell, or HTML injection sink found in app source | No database/API data operations are implemented in this repository |
| Authentication | Partial | Phone OTP wiring exists; error-path handling is incomplete; no staff registration/email-password flow |
| Sensitive data | Partial | No private-key markers found; `.env.local` is ignored; public Supabase client config requires verified server-side policies |
| Access control | Not demonstrated | No route guard, database schema, RLS policy, role enforcement, or per-patient authorization source in repository |
| XML/XXE | Not applicable in current source | No XML parsing path found |
| Security configuration | Needs work | Web static export fails; app identifiers absent; no backend security configuration checked in |
| XSS | No direct unsafe HTML sink found | Static web output still fails before runtime verification |
| Deserialization / route input | Finding | Prototype-inherited `in` check can turn malformed `type` into a detail-screen crash |
| Dependency risk | Finding | npm audit reports 14 moderate advisories |
| Logging / monitoring | Not implemented in app source | No audit-event or operational monitoring pipeline found |

## Recommended fix order

1. Fix the web SSR storage initialization so web export succeeds, then keep a dedicated web dashboard route/application separate from the patient mobile experience.
2. Build the actual role-based doctor/staff dashboard, patient groups/allocation, report upload/review, medication records, care plans, appointments, and follow-up queues against a shared backend.
3. Implement server-enforced authorization and verify Supabase RLS with negative cross-patient/cross-organization tests before any real patient data is loaded.
4. Replace QR button shortcuts with camera scan, expiring one-time server validation, identity confirmation, consent, and audited patient linking.
5. Guard protected routes, handle auth/network failures in `finally`, and ensure sign-out works on every account surface.
6. Replace local global appointment state with account-scoped backend records and reconcile failed writes without mutating stale cache.
7. Fix the alert-kind allowlist crash, stale dates, and placeholder controls.
8. Resolve compatible dependency advisories, lint failure, app IDs, and add unit/integration/E2E tests before release.
9. Validate on physical iOS and Android devices, plus browser widths and accessibility tools; native JS export alone is not a device-release signoff.

## Final verdict

The current code is a visually polished patient-app prototype with successful iOS/Android JavaScript bundling. It is **not yet a complete CareLoop patient-plus-doctor system**, and the current web build fails. Do not treat its sample doctor, appointment, alert, or care-plan content as live synchronized records. No application source files were modified during this verification.

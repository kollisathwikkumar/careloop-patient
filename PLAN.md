# CareLoop Patient Implementation Plan

## 1. Purpose

CareLoop Patient is the patient-facing mobile application for administrative continuity of care.

The product promise is:

> Keep the patient connected from one follow-up to the next while making the next administrative action obvious, simple, and accessible.

The application is **not** a diagnostic or clinical application. It must not diagnose conditions, interpret reports, predict risk, recommend treatment or medication, or provide autonomous medical advice.

This document is the implementation source of truth for building the project incrementally.

---

## 2. Product Decisions

### 2.1 V1 objective

Validate the core next-step completion loop:

1. Patient signs in with phone OTP.
2. Patient scans a temporary QR invitation.
3. Patient reviews doctor identity.
4. Patient gives explicit consent to connect.
5. Home shows one clear “Your Next Step”.
6. Patient confirms attendance or requests rescheduling.
7. Care team receives the response.
8. Patient sees the resulting status or appointment update.
9. Completed and upcoming items appear in the Care Journey.

### 2.2 Target users

- Patients, including elderly users and people with low digital literacy.
- One initial care team operating a minimal web dashboard.
- Pilot size: approximately 100–1,000 patients.

### 2.3 V1 platforms

- iOS
- Android
- Existing Expo Router mobile project
- Separate browser-based care-team admin surface, planned as a separate application or project

### 2.4 V1 languages

- English
- Hindi
- Tamil
- Telugu

Translation must cover user-facing UI, validation messages, empty states, notification copy, accessibility labels, and support content.

### 2.5 V1 accessibility requirements

- Large touch targets
- Readable typography
- High contrast
- Simple language
- One obvious primary action per screen
- Minimal navigation
- Dynamic text-size support
- Screen-reader labels and sensible focus order
- Simple Mode with larger text, larger buttons, simplified navigation, and high contrast

Voice assistance is deferred beyond V1.

---

## 3. Explicit V1 Scope

### Included

- Phone OTP account sign-in
- Temporary QR connection invitation
- Connection code fallback
- Doctor identity confirmation
- Patient consent
- One active care-team relationship per patient
- Connected doctor profile
- Home “Your Next Step” experience
- Appointment details
- Attendance confirmation
- Reschedule request with preferred date/time
- Care-team response and appointment updates
- Care Journey timeline
- Completed, upcoming, and planned follow-ups
- Doctor-approved reminders
- Push notifications and in-app Alerts center
- Device calendar integration
- Language selection
- Simple Mode
- Help and Support
- Privacy/settings entry points
- Supabase-backed data layer
- Minimal care-team web dashboard
- Automated tests and iOS/Android device QA

### Explicitly deferred

- Voice assistance
- Clinical records
- Diagnoses, reports, medications, measurements, or treatment recommendations
- Patient self-scheduling
- Multiple simultaneous care teams
- Full EHR/clinic-system integration
- Patient-authoritative completion status
- Autonomous medical advice
- AI medical interpretation

---

## 4. Current Repository State

### Existing stack

- Expo SDK 57
- React Native 0.86.3
- React 19.2.3
- TypeScript 6
- Expo Router
- React Native Web
- Strict TypeScript configuration
- Existing routes under `src/app/`
- Existing components under `src/components/`
- Existing hooks under `src/hooks/`
- Existing constants under `src/constants/`

### Existing Supabase setup

Packages are installed:

- `@supabase/supabase-js@2.117.0`
- `@react-native-async-storage/async-storage@2.2.0`
- `react-native-url-polyfill@4.0.0`

Implemented:

- `.env.local`
- `src/lib/supabase.ts`
- `.gitignore` protection for local environment files

The Supabase client uses:

- `react-native-url-polyfill/auto`
- AsyncStorage
- `createClient`
- `autoRefreshToken: true`
- `persistSession: true`
- `detectSessionInUrl: false`

No authentication flow or database tables have been implemented yet.

### Current known issue

`npx tsc --noEmit` passes.

Lint still reports one existing error in:

```
src/hooks/use-color-scheme.web.ts:11
```

The error is the React hooks rule for calling `setState` synchronously inside an effect. This should be fixed as a separate cleanup step before the first feature milestone is considered complete.

---

## 5. Target Architecture

### 5.1 Mobile application

The mobile app remains an Expo Router application.

Recommended boundaries:

```
src/app/                 Expo Router screens and layouts
src/components/          Reusable presentational components
src/features/             Feature-level UI and hooks
src/lib/                 Shared clients and infrastructure
src/lib/supabase.ts       Supabase client
src/services/             API/domain operations
src/hooks/                Shared React hooks
src/constants/            Theme and static constants
src/i18n/                 Localization setup and translations
src/types/                Shared domain types
src/utils/                Pure utilities and validation
```

Do not put reusable services or data access inside route files.

### 5.2 Backend

Supabase is the initial managed backend.

Responsibilities:

- Phone OTP authentication
- Postgres database
- Row Level Security
- Storage only if a doctor profile photo requires it
- Realtime only where it materially improves appointment/status updates
- Edge Functions for privileged or server-only operations
- Notification orchestration if required later

The mobile app must use only the public publishable key. Never place a service-role or secret key in the mobile application.

### 5.3 Care-team operations

The care team needs a minimal browser dashboard to:

- Create and revoke temporary invitations
- View connected patients
- Create and update appointments
- Approve and manage reminders
- View attendance confirmations
- Review reschedule requests
- Propose or confirm updated appointment times
- Mark follow-ups complete
- Advance the next planned follow-up
- Send appointment updates
- View operational audit history

The admin dashboard must use separate role-aware access and never rely on mobile-client checks alone.

---

## 6. Primary User Journeys

### 6.1 First launch and language selection

1. App opens to a calm welcome screen.
2. Patient selects English, Hindi, Tamil, or Telugu.
3. Patient can enable Simple Mode.
4. App explains that CareLoop helps manage appointments and follow-ups.
5. Patient proceeds to phone-number entry.

Acceptance criteria:

- Language choice is persisted locally.
- The selection applies immediately.
- Text remains readable at large accessibility sizes.
- No clinical claims are shown.

### 6.2 Phone OTP sign-in

1. Patient enters a phone number.
2. App validates the number format.
3. App requests an OTP.
4. App shows a clear verification screen with resend and change-number actions.
5. Patient enters the OTP.
6. Supabase establishes a persisted session.
7. Returning users bypass onboarding when a valid session exists.

Failure handling:

- Invalid number: explain the format simply.
- Incorrect OTP: allow retry without losing the number.
- Expired OTP: provide resend.
- Rate limit: show a calm retry message and avoid exposing provider details.
- Network failure: preserve entered data and offer retry.
- Signed-in user with no connection: route to connection onboarding.

### 6.3 QR connection

1. Patient chooses “Connect to my doctor”.
2. App requests camera permission only when scanning begins.
3. Patient scans a temporary QR invitation.
4. If camera access is denied, app provides a connection-code entry path.
5. App validates that the invitation is unexpired, unused, and intended for this flow.
6. App displays doctor name, photo, and clinic.
7. Patient explicitly confirms the connection.
8. App records consent and establishes the patient-care-team relationship.
9. App routes to Home.

Security rules:

- QR payload contains no medical information.
- Invitation is short-lived and single-use.
- Connection must be confirmed by the patient.
- Invalid, expired, revoked, or already-used invitations show distinct actionable states.
- The app never trusts identity data solely from an unverified QR payload.

### 6.4 Home and “Your Next Step”

Home should answer one question:

> What do I need to do next?

Possible states:

- Upcoming appointment requiring confirmation
- Reschedule request awaiting care-team response
- Appointment confirmed
- Appointment changed
- Follow-up completed with a next appointment
- No scheduled next step
- Connection pending or incomplete
- Temporary error/offline state

The primary card should include:

- Action label
- Appointment date and time
- Doctor name
- Clinic/location or meeting instruction if applicable
- Current response status
- One primary action
- One secondary action only when necessary

### 6.5 Attendance confirmation

1. Patient taps “I’ll attend”.
2. App shows a confirmation state immediately.
3. The response is persisted idempotently.
4. Care team can see the response.
5. The patient can see when the response was sent.
6. Duplicate taps do not create duplicate responses.

### 6.6 Reschedule request

1. Patient taps “Request reschedule”.
2. App explains that the care team will review the request.
3. Patient selects preferred date/time or enters a simple preference.
4. Patient reviews and submits.
5. App shows pending status.
6. Care team proposes, confirms, or declines a new appointment.
7. Patient receives an in-app and push update.
8. Home and Care Journey reflect the authoritative appointment state.

The patient does not directly book a slot in V1.

### 6.7 Care Journey

The timeline displays administrative continuity:

- Completed consultation
- Completed follow-up
- Current/upcoming follow-up
- Planned next review

Each item should show:

- Date or approximate date
- Type of administrative event
- Status
- Doctor/care-team context when useful
- Next action when applicable

It must not display clinical measurements, diagnoses, reports, treatment decisions, or medical interpretations.

### 6.8 Alerts

Alerts contains:

- Upcoming appointment reminders
- Confirmation updates
- Appointment changes
- Reschedule updates
- Care-team-approved administrative messages

Requirements:

- Read/unread state
- Deep link to the relevant appointment or action
- Empty state
- Retry state when loading fails
- No sensitive content in notification previews beyond the minimum necessary

### 6.9 My Doctor, Help, and Settings

Planned sections:

- My Doctor
- Help & Support
- Language
- Simple Mode
- Notification preferences
- Privacy information
- Sign out
- Account/session recovery entry points

---

## 7. Proposed Domain Model

The following entities are planned. Database tables should be designed and reviewed before migrations are created.

### Patient profile

Fields:

- Auth user ID
- Display name
- Phone number reference
- Preferred language
- Simple Mode preference
- Notification preferences
- Created/updated timestamps

### Care team

Fields:

- Name
- Clinic name
- Profile photo reference
- Operational contact details
- Active status
- Created/updated timestamps

### Care-team member

Fields:

- Auth user ID
- Care-team ID
- Role
- Display name
- Active status
- Created/updated timestamps

Roles should initially distinguish at least:

- Care-team administrator
- Care coordinator
- Doctor/clinician identity shown to patients

### Patient-care-team connection

Fields:

- Patient ID
- Care-team ID
- Status
- Consent timestamp
- Connected timestamp
- Revoked timestamp
- Created/updated timestamps

V1 should enforce one active connection per patient.

### Connection invitation

Fields:

- Invitation identifier
- Care-team ID
- Intended patient context if applicable
- Expiration timestamp
- Used timestamp
- Revoked timestamp
- Created-by member
- Created/updated timestamps

Never store medical information in the invitation payload.

### Appointment

Fields:

- Patient-care-team connection ID
- Title/administrative label
- Doctor/care-team member
- Scheduled start/end
- Location or meeting instruction
- Status
- Confirmation status
- Reschedule state
- Created/updated timestamps
- Completed timestamp

### Reschedule request

Fields:

- Appointment ID
- Patient ID
- Preferred date/time text or structured preferences
- Patient note limited to administrative content
- Status
- Care-team response
- Proposed appointment reference
- Submitted/resolved timestamps

### Care Journey event

Fields:

- Patient connection ID
- Appointment reference when applicable
- Event type
- Status
- Display date
- Sort order or event timestamp
- Created/updated timestamps

### Reminder

Fields:

- Patient or appointment reference
- Care-team author
- Message
- Scheduled time
- Delivery status
- Approval status
- Created/updated timestamps

### Notification

Fields:

- Patient ID
- Type
- Title/body key or rendered content
- Related entity reference
- Read timestamp
- Created timestamp

### Audit event

Fields:

- Actor
- Role
- Action
- Entity type and ID
- Timestamp
- Result metadata without secrets or clinical content

---

## 8. Authorization and Security

### Client-side rules

- Use only the Supabase publishable key.
- Keep all environment values in ignored local environment files or deployment secrets.
- Never log OTPs, tokens, publishable keys, or full patient data.
- Do not treat client-side route guards as authorization.
- Keep connection, appointment, and notification data scoped to the signed-in patient.

### Supabase rules

- Enable Row Level Security on every patient-facing table.
- Patients can read and update only their own allowed preferences and responses.
- Patients can read only their active connection, own appointments, own timeline, and own notifications.
- Patients can create reschedule requests only for their own appointments.
- Care-team members can access only their care team’s patients and operational data.
- Privileged invitation operations should run through protected server-side functions where appropriate.
- Add audit records for connection, consent, appointment, reminder, and reschedule actions.

### Data minimization

Store only the minimum administrative data needed for V1:

- Identity and contact reference
- Care-team connection
- Appointments and statuses
- Reminders and notifications
- Preferences and consent records

Do not add clinical data fields “for future use” unless there is a specific approved requirement.

---

## 9. Notifications and Async Work

### Push

Initial direction:

- Expo Notifications
- Push token registered per device/session
- Notification preferences stored per patient
- In-app notification remains the source of truth for history

### Async operations

Operations that may be asynchronous:

- OTP delivery
- QR invitation validation
- Attendance response synchronization
- Reschedule request delivery
- Care-team appointment updates
- Push notification delivery
- Calendar event creation/update

Each operation needs:

- Loading state
- Retry behavior
- Idempotency strategy
- User-visible success state
- User-visible failure state
- Offline or stale-data behavior

### Offline behavior

V1 should support graceful degradation:

- Show cached last-known appointment state where available.
- Clearly label stale or unavailable data.
- Queue only safe, explicitly idempotent actions if offline support is added.
- Do not claim a confirmation or reschedule request succeeded until the server acknowledges it.

---

## 10. Localization and Accessibility Implementation

Recommended sequence:

1. Create localization keys rather than embedding user-facing strings in screens.
2. Add English source strings.
3. Add Hindi, Tamil, and Telugu translations.
4. Add locale selection and persistence.
5. Test long translations and text expansion.
6. Add accessibility labels, hints, roles, and focus order.
7. Test Simple Mode at large text sizes.
8. Verify every empty, loading, error, and confirmation state in all supported languages.

Avoid concatenating translated fragments. Use complete localized sentences with named interpolation values.

---

## 11. Calendar Integration

Calendar integration is included in V1 but does not grant scheduling authority to the patient.

Planned behavior:

- Show an “Add to calendar” action from appointment details.
- Request calendar permission only when the action is used.
- Create a calendar event with minimum necessary administrative details.
- Handle permission denied, duplicate event, cancelled appointment, and updated appointment cases.
- Avoid automatically creating events without explicit patient action.
- Keep the CareLoop appointment as the source of truth.

---

## 12. Step-by-Step Implementation Sequence

### Step 0 — Baseline and cleanup

- Confirm project runs on the iOS simulator and Android emulator/device.
- Confirm Supabase environment variables load.
- Fix the existing lint error in `use-color-scheme.web.ts`.
- Establish a clean baseline for TypeScript, lint, and Expo diagnostics.
- Keep existing unrelated worktree changes separate.

Exit criteria:

- TypeScript passes.
- Lint passes.
- App starts on iOS and Android.
- No UI or navigation regressions.

### Step 1 — Project foundations

- Create shared domain types.
- Create a feature/service folder structure.
- Add localization infrastructure.
- Add shared loading, error, empty, and primary-action components.
- Define theme tokens for accessibility and Simple Mode.
- Add test tooling and the first unit/component test.

Exit criteria:

- New code follows the existing `src/app` and alias conventions.
- No feature screen contains direct Supabase query details.
- English localization works.

### Step 2 — Onboarding and language

- Build welcome screen.
- Build language selector.
- Persist language preference.
- Build Simple Mode preference.
- Add onboarding state handling for first launch and returning users.

Exit criteria:

- Four languages can be selected.
- Selection survives app restart.
- Simple Mode changes text sizing, button sizing, contrast, and navigation complexity.

### Step 3 — Authentication

- Add phone-number entry.
- Add OTP request and verification.
- Add session restore on app launch.
- Add sign-out.
- Add loading/error/rate-limit states.
- Keep authentication separate from doctor connection.

Exit criteria:

- New patient can complete OTP sign-in.
- Returning patient restores a valid session.
- Invalid and expired OTP paths are handled.
- No session/token secrets appear in logs.

### Step 4 — Connection flow

- Add QR scanning.
- Add connection-code fallback.
- Add invitation validation.
- Add doctor identity review.
- Add explicit consent screen.
- Add connection success, invalid, expired, revoked, and already-used states.

Exit criteria:

- A patient can connect to exactly one active care team.
- Invitation is temporary and single-use.
- No medical data is carried in the QR payload.
- Connection and consent are persisted.

### Step 5 — Home and appointment read model

- Build Home state machine.
- Add appointment detail view.
- Add next-step card.
- Add empty and offline states.
- Add appointment status mapping.
- Read only from the Supabase-backed source of truth.

Exit criteria:

- Every supported appointment state produces a clear next action or explanation.
- Home does not become a dashboard of unrelated metrics.
- Text and actions meet accessibility requirements.

### Step 6 — Attendance confirmation

- Add one-tap attendance confirmation.
- Add optimistic visual feedback only where safe.
- Persist idempotently.
- Display server-confirmed status.
- Add retry behavior.

Exit criteria:

- Duplicate taps do not duplicate records.
- Care-team side can observe the response.
- Network failure does not falsely show success.

### Step 7 — Reschedule requests

- Add preferred date/time request form.
- Add administrative note validation.
- Add pending, responded, declined, and superseded states.
- Add care-team response display.
- Update Home and appointment detail consistently.

Exit criteria:

- Patient cannot directly book a slot.
- All request state transitions are understandable.
- Updated appointment data remains authoritative.

### Step 8 — Care Journey

- Add timeline data model and query.
- Add completed, upcoming, and planned items.
- Add completion-to-next-follow-up transition.
- Add empty and partial-data states.

Exit criteria:

- Timeline remains administrative only.
- Care-team completion advances the patient’s next step.
- No clinical interpretation is introduced.

### Step 9 — Alerts and push notifications

- Add in-app notification center.
- Add read/unread state.
- Register push tokens.
- Add appointment/reminder update handling.
- Add deep links to relevant screens.
- Add notification permission education and fallback behavior.

Exit criteria:

- Push and in-app notification states reconcile.
- A patient can find the relevant appointment from an alert.
- Denied push permissions do not break in-app alerts.

### Step 10 — Calendar integration

- Add explicit “Add to calendar” action.
- Implement iOS and Android permission handling.
- Handle update/cancellation behavior.
- Test duplicate prevention as far as platform APIs allow.

Exit criteria:

- Calendar permission is requested just in time.
- Calendar failure does not change CareLoop appointment state.

### Step 11 — My Doctor, support, and settings

- Add My Doctor profile.
- Add Help & Support content.
- Add language and Simple Mode settings.
- Add privacy information.
- Add sign-out and session recovery behavior.

Exit criteria:

- Support content is available in every V1 language.
- Settings persist correctly.
- Sign-out clears the local session state.

### Step 12 — Minimal care-team dashboard

Implement as a separate web surface:

- Staff authentication and roles
- Care-team membership
- Invitation creation/revocation
- Patient connection list
- Appointment management
- Reminder management
- Confirmation responses
- Reschedule review
- Completion and next-follow-up management
- Audit trail

Exit criteria:

- A care team can run the complete pilot workflow without database edits.
- Staff can see which actions are pending.
- Authorization is enforced server-side with RLS and/or protected functions.

### Step 13 — Hardening and pilot release

- Run localization QA.
- Run accessibility QA.
- Test slow and offline networks.
- Test expired invitations and OTPs.
- Test duplicate actions and retries.
- Test push permission denial.
- Test calendar permission denial.
- Test account/session recovery.
- Run dependency and security audits.
- Produce release builds for iOS and Android.
- Document support and operational procedures.

---

## 13. Testing Strategy

### Unit tests

Test:

- Appointment status mapping
- Next-step selection
- Timeline ordering
- Reschedule validation
- Invitation expiry and status interpretation
- Localization interpolation
- Simple Mode preference behavior
- Notification routing
- Idempotency keys or request deduplication helpers

### Component tests

Test:

- OTP form
- QR connection states
- Doctor identity confirmation
- Next-step card
- Attendance confirmation
- Reschedule form
- Timeline item
- Alert row
- Language selector
- Simple Mode controls

### Integration tests

Test:

- Session restore
- Patient-to-care-team connection
- Appointment fetch
- Attendance mutation
- Reschedule mutation
- Notification read state
- Calendar action boundary

Use controlled test data and a dedicated Supabase environment. Do not point automated tests at production data.

### Device QA

Minimum matrix:

- iOS simulator and at least one physical iOS device
- Android emulator and at least one physical Android device
- Small and large screen sizes
- Large system text
- Screen reader enabled
- Push permission granted and denied
- Camera permission granted and denied
- Calendar permission granted and denied
- Slow network and offline transitions

### Required commands

```bash
npx tsc --noEmit
npm run lint
npx expo-doctor
```

Add the project’s chosen test command once test tooling is introduced.

---

## 14. Environments and Delivery

### Local

- `.env.local`
- Supabase development project
- Expo Go where supported
- Development build for native modules that require it
- Local iOS simulator and Android emulator/device

### Staging

- Separate Supabase project
- Separate Expo/EAS environment variables
- Seeded non-production data
- Test push configuration
- Test care-team accounts

### Production/pilot

- Production Supabase project
- Production environment variables managed outside source control
- EAS build profiles
- Database migrations reviewed and applied in order
- Audit and error monitoring enabled
- Support runbook available

Never commit:

- `.env.local`
- Service-role keys
- Secret keys
- OTP provider credentials
- Push provider private credentials
- Patient data exports

---

## 15. Observability

Track operational events without logging sensitive content:

- App launch success/failure
- OTP request and verification outcome
- QR scan outcome category
- Connection confirmation
- Appointment load failures
- Attendance confirmation success/failure
- Reschedule request success/failure
- Notification delivery outcome
- Push permission state
- Calendar permission/action outcome
- Session restoration failures
- App crashes and fatal startup errors

Do not log:

- OTP values
- Auth tokens
- Publishable keys
- Service-role keys
- Full phone numbers
- Medical content
- Unnecessary personal data

Set alerts for:

- Authentication failure spikes
- Appointment data load failures
- Mutation failure spikes
- Push delivery degradation
- Elevated app startup failures
- Supabase service or quota issues

---

## 16. Definition of Done for V1

V1 is ready for the controlled pilot when:

- A new patient can select a language, sign in with OTP, connect through QR/code, and consent.
- Home always communicates the next administrative action or a clear empty state.
- Patients can confirm attendance without duplicate submissions.
- Patients can request rescheduling and see the care-team response.
- Care-team completion advances the Care Journey.
- Patients receive appointment and reminder updates in-app and through push when permitted.
- Calendar integration works through explicit patient action.
- English, Hindi, Tamil, and Telugu have complete reviewed translations.
- Simple Mode and large text workflows are usable.
- No clinical or diagnostic functionality is present.
- RLS and role boundaries are tested.
- TypeScript, lint, automated tests, and device QA pass.
- The pilot can operate without manual database edits.
- No secret or service-role credentials are shipped in the mobile app.

---

## 17. Open Decisions to Resolve Before Their Implementation Step

- Exact OTP/SMS provider and rate limits
- Exact staff roles for the first care team
- Whether doctor photos use Supabase Storage or external image hosting
- Exact appointment status state machine
- Whether timeline events are derived from appointments or stored separately
- Push notification copy and privacy level on the lock screen
- Calendar event update/cancellation policy
- Supabase staging and production project ownership
- Dashboard technology and repository location
- Formal privacy, retention, consent, and audit requirements for the pilot
- Supported minimum iOS and Android versions
- Final device QA matrix
- Translation reviewer for Hindi, Tamil, and Telugu

---

## 18. Recommended First Implementation Step

Before adding patient-facing features:

1. Fix the existing lint error.
2. Add test tooling and a baseline test.
3. Confirm Supabase environment loading in the iOS simulator and Android environment.
4. Create the shared domain type and localization foundations.
5. Implement language selection and Simple Mode before authentication.

Do not create database tables or implement authentication until the Supabase schema, RLS boundaries, and OTP provider decision are reviewed.

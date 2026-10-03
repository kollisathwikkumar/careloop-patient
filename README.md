# CareLoop Patient

CareLoop Patient is the Expo / React Native mobile app for patients to connect with their care team, review appointments and follow-ups, see reports and medications, and send secure messages. Patient records are loaded from the configured Supabase project; the app does not bundle sample patient accounts or seeded history.

## Run locally

Requirements: Node.js and npm.

1. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for the same CareLoop Supabase project used by the doctor app.
2. Install dependencies with `npm ci`.
3. Start with `npm start`, then scan the Expo Go QR code. Use `npm run android` or `npm run ios` for a simulator.

The app requires a valid Supabase configuration and an authenticated, linked patient account to display live records. It does not fall back to demo data when the backend is unavailable.

## Checks

- `npm test` — patient-flow and no-sample-data contract tests.
- `npm run typecheck` — TypeScript check.
- `npm run lint` — Expo lint.
- `npm run build` — static web export. Set the Supabase public URL and publishable key in the environment for the build.

The app uses only the public publishable key. Never commit `.env` files, service-role keys, credentials, or real patient data. See the CareLoop-doctor repository's `backend/` directory for Supabase schema and backend workflow tests.

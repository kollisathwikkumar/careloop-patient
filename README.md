# CareLoop Patient

CareLoop Patient is the Expo / React Native app that lets a patient stay connected with their care team between visits. It is backed by the CareLoop Supabase project shared with the doctor workspace.

## Patient features

- **Home and care journey:** see recorded next steps and follow-up information.
- **Appointments:** review visits and respond to supported appointment requests.
- **Messages:** exchange messages with the connected care team and share supported files.
- **Reports and medications:** view records made available to the linked patient account.
- **Care-team connection:** connect using a CareLoop invitation/QR flow.

The app does not bundle sample patients, fake report history, or demo backend data. It needs a configured Supabase project and an authenticated patient account linked to a patient record. If no connection or records exist, the app should show its empty/unlinked state rather than substitute example data.

## Run with Expo Go

Requirements: Node.js and npm. Install Expo Go on the phone, and keep the phone and development computer on a network that can reach the Expo development server.

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the same CareLoop Supabase project used by the doctor workspace.
3. Install dependencies: `npm ci`.
4. Start Expo: `npm start`.
5. Scan the QR code shown by Expo Go. If the phone cannot reach the computer over the local network, use Expo's tunnel connection option.

For a connected Android device, use `npm run android`; for iOS use `npm run ios`. The `npm run simulator` helper starts the iOS simulator workflow. `npm run build` exports the web version and requires the public Supabase variables at build time.

## Checks

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

The tests include patient-flow and no-sample-data checks. A successful build does not by itself verify a live Supabase login or prove that a production patient account is linked correctly.

## Backend and notifications

The shared Supabase schema, migrations, and backend workflow tests are maintained in the [CareLoop Doctor repository](https://github.com/kollisathwikkumar/CareLoop-doctor/tree/main/backend). The application uses the public Supabase publishable (or legacy anon) key; never include a service-role key in a mobile app.

SMS delivery and phone OTP are not enabled until paid provider accounts and server-side secrets are configured. The app must not claim an SMS was sent when that provider setup is absent. Do not commit `.env` files, credentials, real patient records, or locally generated production data.

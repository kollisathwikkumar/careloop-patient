import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const exists = async (path) => access(new URL(path, root)).then(() => true, () => false);

test('patient repository contains only patient-facing routes, not copied doctor screens or prototype styles', async () => {
  assert.equal(await exists('src/app/staff/'), false);
  assert.equal(await exists('src/lib/staff.ts'), false);
  assert.equal(await exists('src/app/explore.tsx'), false);
  assert.equal(await exists('src/global.css'), false);
});

test('patient connection and record features use the shared Supabase backend contracts', async () => {
  const patient = await readFile(new URL('src/lib/patient.ts', root), 'utf8');
  assert.match(patient, /redeem_connection_qr_payload/);
  assert.match(patient, /get_patient_connectivity_snapshot/);
  assert.match(patient, /patient-record-types/);
  assert.doesNotMatch(patient, /@\/lib\/staff/);
});

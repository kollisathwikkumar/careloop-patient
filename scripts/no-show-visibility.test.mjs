import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('patient records keep a missed appointment visible', async () => {
  const backend = await read('../src/lib/patient-backend.ts');
  const appointment = await read('../src/lib/appointment.ts');
  assert.match(backend, /\['upcoming',\s*'overdue',\s*'missed'\]/);
  assert.match(appointment, /'missed'/);
});

test('mobile appointment surfaces explain a no-show and offer next steps', async () => {
  const screen = await read('../src/app/appointments.tsx');
  const alerts = await read('../src/app/(tabs)/alerts.tsx');
  const detail = await read('../src/app/(tabs)/alert-detail.tsx');
  assert.match(screen, /Missed appointment/);
  assert.match(screen, /Your care team marked this appointment as a no-show/);
  assert.match(alerts, /Appointment missed/);
  assert.match(detail, /missed/);
});

test('home does not offer attendance confirmation for a missed appointment', async () => {
  const home = await read('../src/app/(tabs)/home.tsx');
  assert.match(home, /appointment\.status === 'missed'/);
  assert.match(home, /Request reschedule/);
  assert.match(home, /appointment\.status !== 'missed'/);
});

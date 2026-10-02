import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = async (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('patient reports and medicines do not ship seeded sample records', async () => {
  const records = await read('../src/lib/patient-records.ts');
  assert.doesNotMatch(records, /PATIENT_REPORTS|MEDICATION_SCHEDULE|CL-1042-demo-report|Sample medicine/);
});

test('patient profile has no fake identity or demo-patient switching controls', async () => {
  const more = await read('../src/app/(tabs)/more.tsx');
  assert.doesNotMatch(more, /Ramesh Kumar|CL-1042|DEMO MODE ONLY|Demo patient view|synthetic patient/);
});

test('patient notifications and journey do not contain fabricated history', async () => {
  const alerts = await read('../src/app/(tabs)/alerts.tsx');
  const journey = await read('../src/app/(tabs)/journey.tsx');
  assert.doesNotMatch(alerts, /28 September 2026|21 September 2026|25 Sep|NOTIFICATIONS/);
  assert.doesNotMatch(journey, /Initial Consultation|21 September 2026|4 visits|12 October 2026/);
});

test('patient doctor and medication views do not show seeded clinician or prescription details', async () => {
  const doctor = await read('../src/app/doctor.tsx');
  const medications = await read('../src/app/(tabs)/medications.tsx');
  assert.doesNotMatch(doctor, /Dr\. K\. Sathwik|City Care Hospital|careteam@citycarehosp\.com|98765 43210/);
  assert.doesNotMatch(medications, /Sample medicine|8:00 AM|Example schedule only/);
});

test('patient home does not show a fabricated appointment history or clinician identity', async () => {
  const home = await read('../src/app/(tabs)/home.tsx');
  const appointment = await read('../src/lib/appointment.ts');
  assert.doesNotMatch(home, /Dr\. K\. Sathwik|General Medicine|21 Sep|12 Oct|ProgressNode/);
  assert.doesNotMatch(appointment, /28 September 2026|30 September 2026|12 October 2026/);
});

test('patient settings do not claim a fake clinic contact or configured notification state', async () => {
  const settings = await read('../src/app/settings.tsx');
  assert.doesNotMatch(settings, /98765 43210|careteam@citycarehosp\.com|Monday–Saturday|reminders are enabled/i);
});

test('patient message source uses live-record terminology and report summary avoids fake readiness', async () => {
  const messages = await read('../src/app/(tabs)/messages.tsx');
  const reports = await read('../src/app/(tabs)/reports.tsx');
  assert.doesNotMatch(messages, /DemoMessage|DemoPatient|DemoAttachment|getDemoMessages|sendDemoMessage/);
  assert.doesNotMatch(reports, /demoNotice|demoTitle|demoText|>Ready<|Report details/);
});

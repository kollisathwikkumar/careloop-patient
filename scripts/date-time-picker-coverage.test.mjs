import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const forms = [
  ['../src/app/staff/appointments.tsx', ['DateTimeField']],
  ['../src/app/staff/tests.tsx', ['DateTimeField']],
  ['../src/app/staff/medications.tsx', ['DateTimeField', 'DateTimeField']],
  ['../src/app/staff/care-plans.tsx', ['DateTimeField']],
  ['../src/app/staff/patients/[id].tsx', ['DateTimeField', 'DateTimeField', 'DateTimeField', 'DateTimeField', 'DateTimeField']],
  ['../website-frontend/src/app/staff/appointments.tsx', ['DateTimeField']],
  ['../website-frontend/src/app/staff/tests.tsx', ['DateTimeField']],
  ['../website-frontend/src/app/staff/medications.tsx', ['DateTimeField', 'DateTimeField']],
  ['../website-frontend/src/app/staff/care-plans.tsx', ['DateTimeField']],
  ['../website-frontend/src/app/staff/patients/[id].tsx', ['DateTimeField', 'DateTimeField', 'DateTimeField', 'DateTimeField', 'DateTimeField']],
];

test('shared staff forms use calendar/time picker controls for every date value', async () => {
  for (const [path, required] of forms) {
    const source = await read(path);
    for (const token of required) assert.ok(source.includes(token), `${path} should use ${token}`);
    assert.doesNotMatch(source, /<Field[^>]+label="(?:Date and time|Test date|Start date|End date|Review date)/);
  }
});

test('shared form components implement native browser inputs and mobile spinner pickers', async () => {
  for (const path of ['../src/components/staff-ui.tsx', '../website-frontend/src/components/staff-ui.tsx']) {
    const source = await read(path);
    assert.match(source, /DateTimeField/);
    assert.match(source, /datetime-local/);
    assert.match(source, /DateTimePicker/);
    assert.match(source, /spinner/);
  }
});

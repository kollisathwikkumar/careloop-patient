import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdtemp, writeFile } from 'node:fs/promises';
import ts from 'typescript';
import test from 'node:test';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

async function loadDateTimeModule() {
  const source = await read('../src/lib/appointment-datetime.ts');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const dir = await mkdtemp(join(tmpdir(), 'careloop-date-'));
  const path = join(dir, 'appointment-datetime.mjs');
  await writeFile(path, js);
  return import(pathToFileURL(path).href);
}

test('localized patient appointment date and time serialize deterministically as local ISO', async () => {
  const { parseAppointmentDate } = await loadDateTimeModule();
  assert.equal(parseAppointmentDate('3 October 2026', '10:10 AM'), new Date(2026, 9, 3, 10, 10).toISOString());
  assert.equal(parseAppointmentDate('3 October 2026', '12:05 AM'), new Date(2026, 9, 3, 0, 5).toISOString());
  assert.throws(() => parseAppointmentDate('31 February 2026', '10:10 AM'), /invalid/i);
});

test('confirmation targets the upcoming appointment and skips schedule parsing', async () => {
  const source = await read('../src/lib/patient-backend.ts');
  assert.match(source, /\.in\('status',\s*\['upcoming',\s*'overdue',\s*'missed'\]\)/);
  assert.match(source, /patch\.response === 'Reschedule requested'[\s\S]{0,220}parseAppointmentDate/);
});

test('confirmation UI saves before showing success and prevents duplicate taps', async () => {
  const source = await read("../src/app/(tabs)/home.tsx");
  assert.match(source, /await saveAppointment\(confirmedAppointment, activePatientId\);[\s\S]{0,500}setConfirmationMessage\(message\)/);
  assert.match(source, /disabled=\{isSavingConfirmation/);
  assert.doesNotMatch(source, /catch\(\) => \{[\s\S]{0,150}Please try again when you have a connection/);
});

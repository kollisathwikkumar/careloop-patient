import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('alerts keeps the More tab selected instead of Messages', async () => {
  const alerts = await read('../src/app/(tabs)/alerts.tsx');
  assert.match(alerts, /<PatientAppFrame activeTab="more"/);
  assert.doesNotMatch(alerts, /<PatientAppFrame activeTab="messages"/);
});

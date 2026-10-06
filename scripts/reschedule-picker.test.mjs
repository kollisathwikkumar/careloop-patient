import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('reschedule modal uses scrollable calendar and time selectors', async () => {
  const home = await read('../src/app/(tabs)/home.tsx');
  assert.match(home, /getRescheduleCalendarMonths/);
  assert.match(home, /<ScrollView[^>]+style=\{styles\.calendarScroll\}/);
  assert.match(home, /<ScrollView[^>]+style=\{styles\.timeScroll\}/);
  assert.match(home, /accessibilityLabel=\{`Select \$\{cell\.date\}`\}/);
});

test('reschedule calendar starts at the current year and never renders previous years', async () => {
  const appointment = await read('../src/lib/appointment.ts');
  assert.match(appointment, /getRescheduleCalendarMonths/);
  assert.match(appointment, /const currentYear = today\.getFullYear\(\)/);
  assert.match(appointment, /12 - today\.getMonth\(\)/);
  assert.doesNotMatch(appointment, /today\.getFullYear\(\) - 1/);
});

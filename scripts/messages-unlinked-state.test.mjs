import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('unlinked Messages screen gives an inline path to connect instead of a blocking alert', async () => {
  const messages = await read('../src/app/(tabs)/messages.tsx');
  const hasInlineConnectionState = /useRouter/.test(messages)
    && /setLoadError/.test(messages)
    && /connect care team|connect your care team/i.test(messages)
    && /router\.replace\('\/'\)/.test(messages);
  const stillShowsBlockingLoadAlert = /catch\s*\(error\)\s*\{\s*if\s*\(active\)\s*Alert\.alert\('Care team unavailable'/.test(messages);
  assert.equal(hasInlineConnectionState && !stillShowsBlockingLoadAlert, true, 'show an inline retry/connect state instead of a native alert');
});

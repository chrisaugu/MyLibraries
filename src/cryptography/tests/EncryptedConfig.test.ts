import { expect, test } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import EncryptedConfig from '../EncryptedConfig';

test('set/get roundtrip', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enc-config-'));
  const configPath = path.join(tempDir, 'config.json');
  fs.writeFileSync(configPath, '{}');

  const config = new EncryptedConfig('secret', configPath);
  await config.set('hello', 'world');
  const result = await config.get('hello');

  expect(result).toEqual({ hello: 'world' });

  fs.rmSync(tempDir, { recursive: true, force: true });
});

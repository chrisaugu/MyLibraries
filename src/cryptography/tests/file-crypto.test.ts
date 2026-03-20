import { expect, test } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { FileEncryptor } from '../file-crypto';

test('encrypts and decrypts a file', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-crypto-'));
  const inputFile = path.join(tempDir, 'input.txt');
  const encryptedFile = path.join(tempDir, 'input.enc');
  const outputFile = path.join(tempDir, 'output.txt');

  fs.writeFileSync(inputFile, 'hello world');

  const file = new FileEncryptor('secret');
  await file.encryptFile(inputFile, encryptedFile);
  await file.decryptFile(encryptedFile, outputFile);

  expect(fs.readFileSync(outputFile, 'utf8')).toBe('hello world');

  fs.rmSync(tempDir, { recursive: true, force: true });
});

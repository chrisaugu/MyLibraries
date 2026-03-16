import { test } from 'bun:test';
import crypto from 'node:crypto';
import SecureFileSharing from '../SecureFileSharing';
import { readFileSync } from 'node:fs';

test.skip('example usage (fill in proper key management)', async () => {
  const ownerId = '123';
  const targetUserId = '12';
  const filename = 'secret.txt';
  const fileBuffer = readFileSync(filename);

  const { publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  const secureFileSharing = new SecureFileSharing();
  await secureFileSharing.registerUser(ownerId, publicKey);
  await secureFileSharing.registerUser(targetUserId, publicKey);
  await secureFileSharing.uploadFile(ownerId, fileBuffer, filename);

  // TODO: implement share/download once key management is corrected
  // await secureFileSharing.shareFile(ownerId, "file-id", targetUserId);
  // await secureFileSharing.downloadFile(targetUserId, "file-id");
});

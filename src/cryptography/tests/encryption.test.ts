import { test } from 'bun:test';
import { Encryption } from '../encryption';

const en = new Encryption();
const data = await en.getInitiatorSecret('http://localhost:8124');
console.log('Initiator secret', data);
const payload = await en.encryptPayload(data.publicKey, {
  data: 'hello'
});
console.log('Encrypted data:', payload);
const data2 = await en.decryptPayload(data.publicKey, payload);
console.log('Decrypted data:', data2);

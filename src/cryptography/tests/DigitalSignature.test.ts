import { expect, test } from 'bun:test';
import { Readable } from 'node:stream';
import DigitalSignature, {
  SignatureAlgorithmFactory,
  signBuffer,
  verifyBufferSignature,
  canonicalizeJson,
  KeyStore,
  createSignedEnvelope,
  verifySignedEnvelope,
  ReplayProtection,
  StreamSigner
} from '../DigitalSignature';

test('class sign/verify uses generated keypair', () => {
  const digitalSignature = new DigitalSignature();
  const message = 'Hello world';
  const signature = digitalSignature.sign(message);
  const verifiedMessage = digitalSignature.verify(
    message,
    digitalSignature.getKeyPair().privateKey.toString(),
    signature
  );

  expect(verifiedMessage).toBe(true);
});

test('sign/verify buffer with rsa-pss', () => {
  const keyPair = SignatureAlgorithmFactory.generateKeyPair('rsa-pss');
  const data = Buffer.from('message');
  const signature = signBuffer(data, keyPair.privateKey, 'rsa-pss');
  const ok = verifyBufferSignature(
    data,
    signature,
    keyPair.publicKey,
    'rsa-pss'
  );
  expect(ok).toBe(true);
});

test('sign/verify buffer with ed25519', () => {
  const keyPair = SignatureAlgorithmFactory.generateKeyPair('ed25519');
  const data = Buffer.from('message');
  const signature = signBuffer(data, keyPair.privateKey, 'ed25519');
  const ok = verifyBufferSignature(
    data,
    signature,
    keyPair.publicKey,
    'ed25519'
  );
  expect(ok).toBe(true);
});

test('canonicalizeJson is stable across key order', () => {
  const a = { b: 2, a: 1, c: { y: 2, x: 1 } };
  const b = { c: { x: 1, y: 2 }, a: 1, b: 2 };
  expect(canonicalizeJson(a)).toBe(canonicalizeJson(b));
});

test('signed envelope verifies and fails when revoked or tampered', () => {
  const store = new KeyStore();
  const keyId = store.rotateKey('rsa-pss');
  const payload = { hello: 'world', count: 1 };

  const envelope = createSignedEnvelope(payload, store);
  expect(verifySignedEnvelope(envelope, store)).toBe(true);

  store.revokeKey(keyId);
  expect(verifySignedEnvelope(envelope, store)).toBe(false);

  const tampered = { ...envelope, payload: envelope.payload + ' ' };
  expect(verifySignedEnvelope(tampered, store)).toBe(false);
});

test('replay protection rejects reused nonce or stale timestamp', () => {
  const replay = new ReplayProtection(1000);
  const now = Date.now();
  const nonce = 'abc';

  expect(replay.isFresh(now, nonce)).toBe(true);
  expect(replay.isFresh(now, nonce)).toBe(false);

  expect(replay.isFresh(now - 10_000, 'old')).toBe(false);
});

test('stream signer signs and verifies', async () => {
  const keyPair = SignatureAlgorithmFactory.generateKeyPair('rsa-pkcs1v15');
  const signer = new StreamSigner();
  const data = Buffer.from('streaming-data');

  const signature = await signer.signStream(
    Readable.from([data]),
    keyPair.privateKey,
    'rsa-pkcs1v15'
  );
  const ok = await signer.verifyStream(
    Readable.from([data]),
    signature,
    keyPair.publicKey,
    'rsa-pkcs1v15'
  );
  expect(ok).toBe(true);
});

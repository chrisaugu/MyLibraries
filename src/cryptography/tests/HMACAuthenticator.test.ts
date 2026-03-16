import { expect, test } from 'bun:test';
import HMACAuthenticator from '../HMACAuthenticator';

test('signs and verifies (v1 format)', () => {
  const hmacAuth = new HMACAuthenticator('secret');
  const signed = hmacAuth.sign('hello');
  expect(hmacAuth.verify(signed)).toBe(true);
});

test('rejects tampered signature (constant-time compare)', () => {
  const hmacAuth = new HMACAuthenticator('secret');
  const signed = hmacAuth.sign('hello');
  const tampered = signed.replace(/:[0-9a-f]+$/, ':deadbeef');
  expect(hmacAuth.verify(tampered)).toBe(false);
});

test('rejects stale timestamps', () => {
  const hmacAuth = new HMACAuthenticator({
    keys: { 1: 'secret' },
    currentVersion: 1,
    maxSkewMs: 1000
  });
  const old = hmacAuth.sign('hello', { timestamp: Date.now() - 10_000 });
  expect(hmacAuth.verify(old)).toBe(false);
});

test('supports key rotation and versioned verification', () => {
  const hmacAuth = new HMACAuthenticator('secret');
  const v1 = hmacAuth.sign('hello');

  const newVersion = hmacAuth.rotateKey('newsecret');
  const v2 = hmacAuth.sign('hello');

  expect(newVersion).toBe(2);
  expect(hmacAuth.verify(v1)).toBe(true);
  expect(hmacAuth.verify(v2)).toBe(true);
});

test('legacy format verification can be disabled', () => {
  const hmacAuth = new HMACAuthenticator('secret');
  const legacy = 'hello:' + '0'.repeat(64);
  expect(hmacAuth.verify(legacy)).toBe(false);
  expect(hmacAuth.verify(legacy, { allowLegacy: false })).toBe(false);
});

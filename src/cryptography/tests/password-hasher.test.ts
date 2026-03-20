import { expect, test } from 'bun:test';
import PasswordHasher from '../password-hasher';

test('hashes and verifies', async () => {
  const hash = new PasswordHasher();
  const stored = await hash.hash('secr3t');
  expect(await hash.verify('secr3t', stored)).toBe(true);
  expect(await hash.verify('wrong', stored)).toBe(false);
});

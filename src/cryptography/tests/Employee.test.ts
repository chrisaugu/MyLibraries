import { expect, test } from 'bun:test';
import { CasualEmployee, PermanentEmployee } from '../Employee';

test('constructors do not throw', () => {
  expect(() => new PermanentEmployee()).not.toThrow();
  expect(() => new CasualEmployee()).not.toThrow();
});

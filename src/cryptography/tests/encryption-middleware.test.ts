import request from 'supertest';
import { expect, test } from 'bun:test';
import app from './express-server';

test('encrypted response should be properly formatted', async () => {
  const response = await request(app)
    .get('/api/users/me')
    .set('x-encrypted', 'true')
    .set('x-client-id', 'client-123');

  expect(response.headers['x-encrypted']).toBe('true');
  expect(response.body).toHaveProperty('encryptedKey');
  expect(response.body).toHaveProperty('ciphertext');
});

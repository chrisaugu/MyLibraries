import { randomBytes } from 'node:crypto';
import { Encrypter } from './encrypter';
import { KeyGenerator } from './keygenerator';
import { RedisClient, fetch } from 'bun';

/**
 * This file demonstrates the use of symmetric encryption (AES-256-CBC) and hashing (SHA-512)
 * in Node.js.
 * It includes functions for encrypting and decrypting text, as well as hashing passwords.
 * The `Encryption` class provides methods for key generation, encryption, and decryption
 * using a Redis client for storing secrets.
 *
 * Note: For secure password hashing, consider using bcrypt or argon2 instead of SHA-512.
 */
export class Encryption {
  private KeyGenerator: KeyGenerator;
  private redisClient: RedisClient;
  private BYTE_SIZE = 16;

  constructor() {
    this.KeyGenerator = new KeyGenerator();
    this.redisClient = new RedisClient();
    this.redisClient.connect();
  }

  async getInitiatorSecret(url: string) {
    const keyDetails = this.KeyGenerator.initiatorKey();
    const { prime, generator, key } = keyDetails;

    let res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(keyDetails)
    });
    const data = (await res.json()) as { public_key: string };
    const secretKey = this.KeyGenerator.initiatorSecret(data.public_key);

    await this.redisClient.set(data.public_key, secretKey);

    return {
      publicKey: key
    };
  }

  async recipientKeys(
    prime: string,
    generator: string,
    key: string
  ): Promise<{ public_key: string }> {
    const public_key = this.KeyGenerator.recipientKey(prime, generator);
    const secretKey = this.KeyGenerator.recipientSecret(key);

    await this.redisClient.set(key, secretKey);

    return { public_key };
  }

  async decryptPayload(
    headerValue: string,
    data: { payload: string; salt: string }
  ) {
    const secretKey = await this.redisClient.get(headerValue);
    if (!secretKey) {
      throw new Error('Invalid header value');
    }
    const encryption = new Encrypter(secretKey, data.salt);
    return JSON.parse(encryption.decrypt(data.payload));
  }

  async encryptPayload(publicKey: string, payload: object) {
    const salt = randomBytes(this.BYTE_SIZE).toString('base64');
    const secretKey = await this.redisClient.get(publicKey);
    if (!secretKey) {
      throw new Error('Invalid public key value');
    }
    const encryption = new Encrypter(secretKey, salt);
    return { payload: encryption.encrypt(JSON.stringify(payload)), salt };
  }
}

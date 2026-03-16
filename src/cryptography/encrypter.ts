import {
  type BinaryLike,
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync
} from 'node:crypto';

/**
 *
 */
export class Encrypter {
  private algorithm: string;
  private key: Buffer<ArrayBuffer>;

  constructor(encryptionKey: BinaryLike, salt: string) {
    this.algorithm = 'aes-192-cbc';
    this.key = scryptSync(encryptionKey, salt, 24);
  }

  encrypt(clearText: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    const encrypted = cipher.update(clearText, 'utf8', 'hex');

    return [
      encrypted + cipher.final('hex'),
      Buffer.from(iv).toString('hex')
    ].join('|');
  }

  decrypt(encryptedText: string): string {
    const [encrypted, iv] = encryptedText.split('|');
    if (!iv) throw new Error('IV not found');

    const decipher = createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    );

    return decipher.update(encrypted!, 'hex', 'utf8') + decipher.final('utf8');
  }
}

import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  type BinaryLike
} from 'node:crypto';

export default class PasswordHasher {
  private keyLength: number;
  private saltLength: number;

  constructor(options: Record<string, number> = {}) {
    this.keyLength = options.keyLength || 64;
    this.saltLength = options.saltLength || 16;
  }

  async hash(password: string) {
    const salt = randomBytes(this.saltLength).toString('hex');
    const hash = scryptSync(password, salt, this.keyLength).toString('hex');
    return `${salt}:${hash}`;
  }

  async verify(password: string, storedValue: string) {
    const [salt, storedHash] = storedValue.split(':');
    const computedHash = scryptSync(password, salt!, this.keyLength).toString(
      'hex'
    );
    const storedHashBuffer = Buffer.from(storedHash!, 'hex');
    const computedHashBuffer = Buffer.from(computedHash, 'hex');

    return (
      storedHashBuffer.length === computedHashBuffer.length &&
      timingSafeEqual(storedHashBuffer, computedHashBuffer)
    );
  }
}

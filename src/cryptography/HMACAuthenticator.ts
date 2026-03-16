import crypto from 'node:crypto';

/**
 *
 */
export default class HMACAuthenticator {
  private keys = new Map<number, string>();
  private currentVersion = 1;
  private maxSkewMs = 5 * 60 * 1000;

  constructor(
    secretKeyOrOptions:
      | string
      | {
          keys?: Record<number, string>;
          currentVersion?: number;
          maxSkewMs?: number;
        }
  ) {
    if (typeof secretKeyOrOptions === 'string') {
      this.keys.set(1, secretKeyOrOptions);
      this.currentVersion = 1;
    } else {
      const {
        keys = { 1: '' },
        currentVersion = 1,
        maxSkewMs
      } = secretKeyOrOptions;
      Object.entries(keys).forEach(([ver, key]) => {
        this.keys.set(Number(ver), key);
      });
      this.currentVersion = currentVersion;
      if (maxSkewMs !== undefined) this.maxSkewMs = maxSkewMs;
    }
  }

  rotateKey(newKey: string) {
    this.currentVersion += 1;
    this.keys.set(this.currentVersion, newKey);
    return this.currentVersion;
  }

  addKey(version: number, key: string) {
    this.keys.set(version, key);
  }

  setCurrentKeyVersion(version: number) {
    if (!this.keys.has(version)) {
      throw new Error(`Unknown key version: ${version}`);
    }
    this.currentVersion = version;
  }

  getCurrentKeyVersion() {
    return this.currentVersion;
  }

  sign(message: string, opts?: { timestamp?: number }) {
    const timestamp = opts?.timestamp ?? Date.now();
    const payload = Buffer.from(message, 'utf8').toString('base64');
    const version = this.currentVersion;
    const data = `${version}.${timestamp}.${payload}`;
    const signature = this.hmac(this.getKey(version), data);
    return `v1:${version}:${timestamp}:${payload}:${signature}`;
  }

  verify(signedMessage: string, opts?: { allowLegacy?: boolean }) {
    if (signedMessage.startsWith('v1:')) {
      const parts = signedMessage.split(':');
      if (parts.length < 5) return false;
      const version = Number(parts[1]);
      const timestamp = Number(parts[2]);
      const payload = parts[3];
      const signature = parts[4];

      if (!Number.isFinite(timestamp)) return false;
      if (Math.abs(Date.now() - timestamp) > this.maxSkewMs) return false;

      const data = `${version}.${timestamp}.${payload}`;
      const expected = this.hmac(this.getKey(version), data);
      return this.timingSafeEquals(signature!, expected);
    }

    if (opts?.allowLegacy === false) return false;

    const lastColon = signedMessage.lastIndexOf(':');
    if (lastColon === -1) return false;
    const message = signedMessage.slice(0, lastColon);
    const signature = signedMessage.slice(lastColon + 1);
    const expected = this.hmac(this.getKey(this.currentVersion), message);
    return this.timingSafeEquals(signature, expected);
  }

  private getKey(version: number) {
    const key = this.keys.get(version);
    if (!key) throw new Error(`Missing key for version ${version}`);
    return key;
  }

  private hmac(key: string, data: string) {
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  }

  private timingSafeEquals(aHex: string, bHex: string) {
    const a = Buffer.from(aHex, 'hex');
    const b = Buffer.from(bHex, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }
}

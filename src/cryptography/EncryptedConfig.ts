import fs from 'node:fs';
import crypto from 'node:crypto';

export default class EncryptedConfig {
  private algorithm: crypto.CipherGCMTypes = 'aes-256-gcm';
  private secretKey: string;
  private configPath: string;
  private keyLength = 32;
  // private key: Buffer;
  // private salt: Buffer;

  constructor(secretKey: string, configPath = './config.json') {
    this.secretKey = secretKey;
    this.configPath = configPath;
  }

  async set(key: string, value: string) {
    let buffer = fs.readFileSync(this.configPath);
    const jsonConfig = JSON.parse(buffer.toString() || '{}');

    jsonConfig[key] = this.encrypt(value);

    fs.writeFileSync(this.configPath, JSON.stringify(jsonConfig, null, 2));
    return jsonConfig;
  }

  async get(key: string) {
    const buffer = fs.readFileSync(this.configPath);
    const jsonConfig = JSON.parse(buffer.toString() || '{}');
    let decryptedConfig = jsonConfig[key];

    if (!decryptedConfig) {
      return null;
    }

    const decrypted = this.decrypt(decryptedConfig);

    return {
      [`${key}`]: decrypted.toString('utf8')
    };
  }

  async rotateKey(newKey: string) {
    let buffer = fs.readFileSync(this.configPath);
    const jsonConfig = JSON.parse(buffer.toString() || '{}');
    if (!jsonConfig) return;

    for (let key of Object.keys(jsonConfig)) {
      jsonConfig[key] = this.decrypt(jsonConfig[key]);
    }

    // set new key as secret key
    this.secretKey = newKey;

    for (let key of Object.keys(jsonConfig)) {
      jsonConfig[key] = this.encrypt(jsonConfig[key]);
    }

    fs.writeFileSync(this.configPath, JSON.stringify(jsonConfig, null, 2));
    return jsonConfig;
  }

  private encrypt(plaintext: string): Record<'iv' | 'encrypted', string> {
    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(16); //.toString('hex')
    const key = crypto.scryptSync(this.secretKey, salt, this.keyLength);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
      encrypted: Buffer.concat([tag, encrypted, salt]).toBase64(),
      iv: iv.toBase64()
    };
  }

  // 16
  // [iv, ciphertext, salt]
  private decrypt(decryptedConfig: Record<'iv' | 'encrypted', string>): Buffer {
    const ivBuffer = Buffer.from(decryptedConfig['iv'], 'base64');
    const encryptedBuffer = Buffer.from(decryptedConfig['encrypted'], 'base64');
    const tag = encryptedBuffer.subarray(0, 16); // First 16 bytes are the tag
    const ciphertext = encryptedBuffer.subarray(
      16,
      encryptedBuffer.length - 16
    ); // Rest is encrypted data
    const salt = encryptedBuffer.subarray(encryptedBuffer.length - 16); // Rest is encrypted data
    const secretKey = crypto.scryptSync(this.secretKey, salt, this.keyLength);
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      secretKey,
      ivBuffer
    );
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);

    return decrypted;
  }

  // Bonus: Implement partial encryption (only sensitive fields)
}

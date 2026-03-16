import crypto from 'node:crypto';
import fs from 'node:fs';

/**
 * Digital Signatures is a mechanism to identify or verify the sender of the data
 * The goal of digital signature is two-fold:
 * 1. Ensure that the data sent has not been tampered with
 * 2. Ensure that the sender of the data is who he says he is
 *
 * In public key cryptography;
 * 1. Encrypt with public key, decrypt with matching private key
 * 2. Encrypt with private key, decrypt with matching public key
 */
// Missing Concepts To Learn (with steps + use cases)
// 1) Signing vs Encryption (separation of concerns)
// Steps: Hash message -> Sign hash with private key -> Verify signature with public key.
// Use case: Proving message authenticity without hiding the message.
//
// 2) Signature schemes and padding (RSA-PSS vs RSA-PKCS1v1.5, ECDSA, Ed25519)
// Steps: Choose algorithm -> Generate keypair accordingly -> Sign/verify using the scheme.
// Use case: Modern services prefer Ed25519 or RSA-PSS for stronger security guarantees.
//
// 3) Public key distribution and trust (PKI, certificates, chain validation)
// Steps: Obtain certificate -> Validate chain -> Check hostname -> Use public key to verify.
// Use case: Verifying signed API responses from a trusted server certificate.
//
// 4) Key management (storage, rotation, revocation, HSM/KMS)
// Steps: Store private key securely -> Rotate on schedule -> Revoke on compromise.
// Use case: Long-lived signing keys for software releases.
//
// 5) Canonicalization and signing structured data (JSON, XML)
// Steps: Canonicalize data -> Hash canonical form -> Sign hash -> Verify using same canonicalization.
// Use case: Signed JSON payloads in webhooks to prevent tampering.
//
// 6) Detached vs attached signatures
// Steps: Create signature -> Send signature separately or embedded -> Verify accordingly.
// Use case: Detached signatures for large files or streaming data.
//
// 7) Timestamping and anti-replay
// Steps: Include nonce/timestamp -> Sign payload -> Verify time window/nonce uniqueness.
// Use case: Prevent replay of signed API requests.
//
// 8) Large data / streaming signatures
// Steps: Stream data into hash -> Sign final digest -> Verify by re-hashing.
// Use case: Signing large backups or media files without loading into memory.
//
// 9) Algorithm agility and versioning
// Steps: Include algorithm identifier + version in signed payload -> Verify based on metadata.
// Use case: Safe migration from RSA to Ed25519 without breaking clients.
export default class DigitalSignature {
  private ivLength = 16;
  private algorithm: crypto.CipherGCMTypes = 'aes-256-gcm';
  private keyPair!: crypto.KeyPairExportResult<any>;

  constructor() {
    this.genKeyPair();
  }

  /**
   * Hello
   */
  genKeyPair() {
    // Generate RSA key pair on initialization
    this.keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048, // secured key length 2048, 4096
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
  }

  /**
   * Some
   * @returns
   */
  getKeyPair() {
    return this.keyPair;
  }

  /**
   *
   */
  readKeyPair() {
    const publicKey = fs.readFileSync(__dirname + '/public.pem');
    const privateKey = fs.readFileSync(__dirname + '/private.pem');

    this.keyPair = {
      privateKey,
      publicKey
    };
  }

  /**
   *
   */
  saveKeyPar() {
    // Create the public key file
    fs.writeFileSync(
      __dirname + '/public.pem',
      this.keyPair.publicKey.toString()
    );
    // Create the private key file
    fs.writeFileSync(
      __dirname + '/private.pem',
      this.keyPair.privateKey.toString()
    );
  }

  /**
   *
   * @param plaintext
   * @param privateKey
   * @returns
   */
  encrypt(plaintext: string, privateKey: string) {
    const bufferMessage = Buffer.from(plaintext, 'utf8');

    return crypto.publicEncrypt(privateKey, bufferMessage);
  }

  /**
   *
   * @param ciphertext
   * @param publicKey
   * @returns
   */
  decrypt(ciphertext: string, publicKey: string) {
    const bufferMessage = Buffer.from(ciphertext, 'utf8');

    const decrypted = crypto.publicDecrypt(publicKey, bufferMessage);
    const messageHash = decrypted;
    return messageHash;
  }

  /**
   *
   * @param message
   * @returns
   */
  hash(message: string) {
    const hash = crypto.createHash('sha256');
    hash.update(message);
    return hash.digest('hex');
  }

  /**
   *
   * @param message
   * @returns
   */
  createSignature(message: string) {
    const hashedData = this.hash(message);
    return hashedData;
  }

  /**
   *
   */
  verifySignature() {
    // const decryptedMessage = decrypt.decryptWithPublicKey(
    //     publicKey,
    //     receivedData.signedAndEncryptedData
    // );
    // const decryptedMessageHex = decryptedMessage.toString();
    // const hashOfOriginal = hash.update(JSON.stringify(receivedData.originalData));
    // const hashOfOriginalHex = hash.digest("hex");
    // if (hashOfOriginalHex === decryptedMessageHex) {
    //     console.log(
    //         "Success!  The data has not been tampered with and the sender is valid."
    //     );
    // } else {
    //     console.log(
    //         "Uh oh... Someone is trying to manipulate the data or someone else is sending this!  Do not use!"
    //     );
    // }
  }

  /**
   *
   * @param message
   * @returns
   */
  sign(message: string) {
    const sign = crypto.createSign('sha256');
    sign.update(message);
    return sign.sign(this.keyPair.privateKey as crypto.KeyLike, 'base64');

    // const signature = crypto.sign("sha256", Buffer.from(message), this.keyPair.privateKey.toString()).toString('hex');
    // return signature;
  }

  /**
   *
   * @param message
   * @param senderPrivateKey
   * @param signature
   * @returns
   */
  verify(message: string, senderPrivateKey: string, signature: string) {
    const verifier = crypto.createVerify('sha256');
    verifier.update(message);
    verifier.end();
    return verifier.verify(
      this.keyPair.publicKey as crypto.KeyLike,
      signature,
      'base64'
    );

    // // Recalculate hash
    // const newHash = crypto.createHash('sha256').update(message).digest('hex');

    // // Verify signature
    // const isValid = crypto.verify("sha256", Buffer.from(newHash), Buffer.from(this.keyPair.publicKey.toString()), Buffer.from(signature, 'hex'));
    // return isValid;
  }
}

// 1) Signing vs Encryption (separation of concerns)
export function signMessage(
  message: string,
  privateKey: crypto.KeyLike,
  algorithm: SignatureAlgorithm
) {
  const data = Buffer.from(message, 'utf8');
  return signBuffer(data, privateKey, algorithm);
}

export function verifyMessageSignature(
  message: string,
  signature: Buffer,
  publicKey: crypto.KeyLike,
  algorithm: SignatureAlgorithm
) {
  const data = Buffer.from(message, 'utf8');
  return verifyBufferSignature(data, signature, publicKey, algorithm);
}

// 2) Signature schemes and padding (RSA-PSS vs RSA-PKCS1v1.5, ECDSA, Ed25519)
export type SignatureAlgorithm =
  | 'rsa-pss'
  | 'rsa-pkcs1v15'
  | 'ecdsa-p256'
  | 'ed25519';

export type KeyPair = {
  publicKey: crypto.KeyLike;
  privateKey: crypto.KeyLike;
};

export class SignatureAlgorithmFactory {
  static generateKeyPair(algorithm: SignatureAlgorithm): KeyPair {
    switch (algorithm) {
      case 'rsa-pss':
      case 'rsa-pkcs1v15':
        return crypto.generateKeyPairSync('rsa', {
          modulusLength: 2048,
          publicKeyEncoding: { type: 'spki', format: 'pem' },
          privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
      case 'ecdsa-p256':
        return crypto.generateKeyPairSync('ec', {
          namedCurve: 'prime256v1',
          publicKeyEncoding: { type: 'spki', format: 'pem' },
          privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
      case 'ed25519':
        return crypto.generateKeyPairSync('ed25519', {
          publicKeyEncoding: { type: 'spki', format: 'pem' },
          privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
    }
  }
}

export function signBuffer(
  data: Buffer,
  privateKey: crypto.KeyLike,
  algorithm: SignatureAlgorithm
) {
  switch (algorithm) {
    case 'rsa-pss':
      return crypto.sign('sha256', data, {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32
      });
    case 'rsa-pkcs1v15':
      return crypto.sign('sha256', data, {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      });
    case 'ecdsa-p256':
      return crypto.sign('sha256', data, privateKey);
    case 'ed25519':
      return crypto.sign(null, data, privateKey);
  }
}

export function verifyBufferSignature(
  data: Buffer,
  signature: Buffer,
  publicKey: crypto.KeyLike,
  algorithm: SignatureAlgorithm
) {
  switch (algorithm) {
    case 'rsa-pss':
      return crypto.verify(
        'sha256',
        data,
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: 32
        },
        signature
      );
    case 'rsa-pkcs1v15':
      return crypto.verify(
        'sha256',
        data,
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        signature
      );
    case 'ecdsa-p256':
      return crypto.verify('sha256', data, publicKey, signature);
    case 'ed25519':
      return crypto.verify(null, data, publicKey, signature);
  }
}

// 3) Public key distribution and trust (PKI, certificates, chain validation)
export class CertificateChainVerifier {
  static verifyChain(pemChain: string[]): boolean {
    if (pemChain.length === 0) return false;
    const certs = pemChain.map((pem) => new crypto.X509Certificate(pem));
    for (let i = 0; i < certs.length - 1; i++) {
      const leaf = certs[i];
      const issuer = certs[i + 1];
      if (!leaf?.verify(issuer?.publicKey!)) return false;
      if (!this.isWithinValidity(leaf)) return false;
    }
    const root = certs[certs.length - 1];
    return root?.verify(root?.publicKey!)! && this.isWithinValidity(root);
  }

  static verifyHostname(certPem: string, hostname: string): boolean {
    const cert = new crypto.X509Certificate(certPem);
    const alt = cert.subjectAltName || '';
    return (
      alt.includes(`DNS:${hostname}`) || cert.subject.includes(`CN=${hostname}`)
    );
  }

  private static isWithinValidity(cert: crypto.X509Certificate): boolean {
    const now = Date.now();
    const from = Date.parse(cert.validFrom);
    const to = Date.parse(cert.validTo);
    return now >= from && now <= to;
  }
}

// 4) Key management (storage, rotation, revocation, HSM/KMS)
export type KeyRecord = {
  keyId: string;
  algorithm: SignatureAlgorithm;
  publicKey: string;
  privateKey?: string;
  createdAt: number;
  revokedAt?: number;
};

export class KeyStore {
  private keys = new Map<string, KeyRecord>();
  private currentKeyId: string | null = null;

  addKey(record: KeyRecord) {
    this.keys.set(record.keyId, record);
    this.currentKeyId = record.keyId;
  }

  rotateKey(algorithm: SignatureAlgorithm) {
    const keyPair = SignatureAlgorithmFactory.generateKeyPair(algorithm);
    const keyId = crypto.randomUUID();
    this.addKey({
      keyId,
      algorithm,
      publicKey: keyPair.publicKey.toString(),
      privateKey: keyPair.privateKey.toString(),
      createdAt: Date.now()
    });
    return keyId;
  }

  revokeKey(keyId: string) {
    const key = this.keys.get(keyId);
    if (!key) return false;
    key.revokedAt = Date.now();
    return true;
  }

  isRevoked(keyId: string) {
    const key = this.keys.get(keyId);
    return !!key?.revokedAt;
  }

  getActiveKey(): KeyRecord | null {
    return this.currentKeyId ? this.keys.get(this.currentKeyId) || null : null;
  }

  getKey(keyId: string): KeyRecord | null {
    return this.keys.get(keyId) || null;
  }

  saveToFile(filePath: string) {
    fs.writeFileSync(
      filePath,
      JSON.stringify([...this.keys.values()], null, 2)
    );
  }

  loadFromFile(filePath: string) {
    if (!fs.existsSync(filePath)) return;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8')) as KeyRecord[];
    this.keys = new Map(data.map((k) => [k.keyId, k]));
    this.currentKeyId = data.length ? data[data.length - 1].keyId : null;
  }
}

// 5) Canonicalization and signing structured data (JSON)
export function canonicalizeJson(value: any): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (Array.isArray(value)) return `[${value.map(canonicalizeJson).join(',')}]`;
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    const entries = keys.map(
      (k) => `${JSON.stringify(k)}:${canonicalizeJson(value[k])}`
    );
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(String(value));
}

// 6) Detached vs attached signatures
export type SignedEnvelope = {
  version: 'v1';
  algorithm: SignatureAlgorithm;
  keyId: string;
  timestamp: number;
  nonce: string;
  payload: string;
  signature: string;
};

export function createSignedEnvelope(
  payload: any,
  keyStore: KeyStore
): SignedEnvelope {
  const key = keyStore.getActiveKey();
  if (!key || !key.privateKey) {
    throw new Error('No active signing key available');
  }
  const canonical = canonicalizeJson(payload);
  const signature = signBuffer(
    Buffer.from(canonical),
    key.privateKey,
    key.algorithm
  );
  return {
    version: 'v1',
    algorithm: key.algorithm,
    keyId: key.keyId,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(12).toString('hex'),
    payload: canonical,
    signature: signature.toString('base64')
  };
}

export function verifySignedEnvelope(
  envelope: SignedEnvelope,
  keyStore: KeyStore
): boolean {
  const key = keyStore.getKey(envelope.keyId);
  if (!key || keyStore.isRevoked(envelope.keyId)) return false;
  const data = Buffer.from(envelope.payload);
  const signature = Buffer.from(envelope.signature, 'base64');
  return verifyBufferSignature(
    data,
    signature,
    key.publicKey,
    envelope.algorithm
  );
}

// 7) Timestamping and anti-replay
export class ReplayProtection {
  private seenNonces = new Map<string, number>();
  private ttlMs: number;

  constructor(ttlMs = 5 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  isFresh(timestamp: number, nonce: string): boolean {
    const now = Date.now();
    if (Math.abs(now - timestamp) > this.ttlMs) return false;
    const prev = this.seenNonces.get(nonce);
    if (prev) return false;
    this.seenNonces.set(nonce, now);
    return true;
  }

  prune() {
    const cutoff = Date.now() - this.ttlMs;
    for (const [nonce, ts] of this.seenNonces.entries()) {
      if (ts < cutoff) this.seenNonces.delete(nonce);
    }
  }
}

// 8) Large data / streaming signatures
export class StreamSigner {
  signStream(
    readable: NodeJS.ReadableStream,
    privateKey: crypto.KeyLike,
    algorithm: SignatureAlgorithm
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      if (algorithm === 'ed25519') {
        const hash = crypto.createHash('sha256');
        readable.on('data', (chunk) => hash.update(chunk));
        readable.on('end', () => {
          try {
            const digest = hash.digest();
            resolve(signBuffer(digest, privateKey, 'ed25519'));
          } catch (err) {
            reject(err);
          }
        });
        readable.on('error', reject);
        return;
      }

      const signer = crypto.createSign('sha256');
      readable.on('data', (chunk) => signer.update(chunk));
      readable.on('end', () => {
        try {
          let signature: Buffer;
          if (algorithm === 'rsa-pss') {
            signature = signer.sign({
              key: privateKey,
              padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
              saltLength: 32
            });
          } else if (algorithm === 'rsa-pkcs1v15') {
            signature = signer.sign({
              key: privateKey,
              padding: crypto.constants.RSA_PKCS1_PADDING
            });
          } else {
            signature = signer.sign(privateKey);
          }
          resolve(signature);
        } catch (err) {
          reject(err);
        }
      });
      readable.on('error', reject);
    });
  }

  verifyStream(
    readable: NodeJS.ReadableStream,
    signature: Buffer,
    publicKey: crypto.KeyLike,
    algorithm: SignatureAlgorithm
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (algorithm === 'ed25519') {
        const hash = crypto.createHash('sha256');
        readable.on('data', (chunk) => hash.update(chunk));
        readable.on('end', () => {
          try {
            const digest = hash.digest();
            resolve(
              verifyBufferSignature(digest, signature, publicKey, 'ed25519')
            );
          } catch (err) {
            reject(err);
          }
        });
        readable.on('error', reject);
        return;
      }

      const verifier = crypto.createVerify('sha256');
      readable.on('data', (chunk) => verifier.update(chunk));
      readable.on('end', () => {
        try {
          let ok: boolean;
          if (algorithm === 'rsa-pss') {
            ok = verifier.verify(
              {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                saltLength: 32
              },
              signature
            );
          } else if (algorithm === 'rsa-pkcs1v15') {
            ok = verifier.verify(
              {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_PADDING
              },
              signature
            );
          } else {
            ok = verifier.verify(publicKey, signature);
          }
          resolve(ok);
        } catch (err) {
          reject(err);
        }
      });
      readable.on('error', reject);
    });
  }
}

// 9) Algorithm agility and versioning
export function createAgileEnvelope(
  payload: any,
  keyStore: KeyStore,
  version: 'v1' | 'v2' = 'v1'
) {
  const env = createSignedEnvelope(payload, keyStore);
  return { ...env, version };
}

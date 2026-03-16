import type { WithImplicitCoercion } from 'node:buffer';
import crypto from 'node:crypto';
import fs from 'node:fs';

/**
 * CryptoUtil
 * This util class uses carefully handpicked, well-researched, researched-backed secure algorithms
 * currently used in the industry.
 */
export default class CryptoUtil {
  private static instance: CryptoUtil;
  private ivLength = 16;
  private algorithm: crypto.CipherGCMTypes = 'aes-256-gcm';
  private keyPair!: crypto.KeyPairExportResult<any>;

  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      return new CryptoUtil();
    }
    return CryptoUtil.instance;
  }

  genKeyPair() {
    // Generate RSA key pair on initialization
    let keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048, // secured key length 2048, 4096
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    // Create the public key file
    fs.writeFileSync(__dirname + '/id_rsa_pub.pem', keyPair.publicKey);

    // Create the private key file
    fs.writeFileSync(__dirname + '/id_rsa_priv.pem', keyPair.privateKey);
  }

  // Utility: Export public key for sharing
  getPublicKey() {
    return this.keyPair.publicKey;
  }

  async encrypt(plaintext: string, key: string) {
    const iv = crypto.randomBytes(this.ivLength);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext),
      cipher.final()
    ]).toBase64();
    const tag = cipher.getAuthTag();

    return {
      iv,
      encrypted,
      tag
    };
  }

  async decrypt(
    encryptedBuffer: { iv: string; encrypted: string; tag: string },
    key: string
  ) {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      key,
      encryptedBuffer.iv
    );
    decipher.setAuthTag(Buffer.from(encryptedBuffer.tag));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedBuffer.encrypted, 'base64')),
      decipher.final()
    ]);
    return decrypted;
  }

  /**
   * Encrypts plaintext with publicKey. The returned data can be decrypted using the corresponding
   * private key
   * @see {decryptWithPrivateKey}
   * @param plaintext
   * @param publicKey
   * @returns Promise<Buffer>
   */
  async encryptWithPublicKey(plaintext: string, publicKey: string) {
    const bufferMessage = Buffer.from(plaintext, 'utf8');

    return crypto.publicEncrypt(publicKey, bufferMessage);
  }

  /**
   * Decrypts `ciphertext` using corresponding `privateKey` used to encrypt `ciphertext`.
   * @see {encryptWithPublicKey}
   * @param ciphertext
   * @param privateKey
   * @returns Promise<Buffer>
   */
  async decryptWithPrivateKey(ciphertext: string, privateKey: string) {
    const bufferMessage = Buffer.from(ciphertext, 'utf8');

    return crypto.privateDecrypt(privateKey, bufferMessage);
  }

  /**
   * Encrypts {plaintext} with {privateKey}. The returned data can be decrypted using the corresponding
   * public key
   * @see {decryptWithPublicKey}
   * @param plaintext
   * @param privateKey
   * @returns Promise<Buffer>
   */
  async encryptWithPrivateKey(
    plaintext: string,
    privateKey: string
  ): Promise<Buffer> {
    const bufferMessage = Buffer.from(plaintext, 'utf8');

    return crypto.privateEncrypt(privateKey, bufferMessage);
  }

  /**
   * Decrypts {ciphertext} with corresponding {publicKey} used to encrypt {ciphertext}
   * @see {encryptWithPrivateKey}
   * @param ciphertext
   * @param publicKey
   * @returns Promise<Buffer>
   */
  async decryptWithPublicKey(ciphertext: string, publicKey: string) {
    const bufferMessage = Buffer.from(ciphertext, 'utf8');

    return crypto.publicDecrypt(publicKey, bufferMessage);
  }

  /**
   * Signing a data requires private key
   * @see https://stackoverflow.com/questions/18257185/how-does-a-public-key-verify-a-signature/59230814#59230814
   */
  async sign() {}

  /**
   * Verifying a data requires public key
   */
  async verify() {}

  hash(message: string) {
    const hash = crypto.createHash('sha256');
    hash.update(message);
    return hash.digest('hex');
  }

  createHashSignature(message: string) {
    const hashedData = this.hash(message);
    this.encryptWithPrivateKey(hashedData, 'abc123');
  }

  sign2(message: string) {
    const sign = crypto.createSign('SHA256');
    sign.update(message);
    return sign.sign(this.keyPair.privateKey as crypto.KeyLike, 'base64');
  }

  verify3(message: string, senderPrivateKey: string, signature: string) {
    const verifier = crypto.createVerify('sha256');
    verifier.update(message);
    verifier.end();
    return verifier.verify(
      this.keyPair.publicKey as crypto.KeyLike,
      signature,
      'base64'
    );
    // crypto.verify(this.algorithm, message);
  }

  async validateSignature() {
    // Calculates a hash of the same data (file, message, etc.),
    // Decrypts the digital signature using the sender's PUBLIC key, and
    // Compares the 2 hash values.

    const hash1 = '';
    const hash2 = '';

    return hash1 == hash2;
  }

  /**
   * verifyTimingSafe function verifies both hashes agains timing attacks
   * @see https://dev.to/silentwatcher_95/timing-attacks-in-nodejs-4pmb
   * @param hash string
   * @param dbHash string
   */
  verifyTimingSafe(hash: string, dbHash: string) {
    const userComputedHash = Buffer.from(hash, 'hex');
    const storedhash = Buffer.from(dbHash, 'hex');

    if (crypto.timingSafeEqual(userComputedHash, storedhash)) {
      // Hashes match, authentication successfull (no timing leak)
    } else {
      // hashes do not match
    }
  }

  validPassword(password: string, hash: string, salt: string) {
    var hashVerify = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
    return hash === hashVerify;
  }

  genPassword(password: string) {
    var salt = crypto.randomBytes(32).toString('hex');
    var genHash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');

    return {
      salt: salt,
      hash: genHash
    };
  }
}

// The keys work inversely:
// Public key encrypts, private key decrypts (encrypting):
// openssl rsautl -encrypt -inkey public.pem -pubin -in message.txt -out message.ssl
// openssl rsautl -decrypt -inkey private.pem       -in message.ssl -out message.txt

// Private key encrypts, public key decrypts (signing):
// openssl rsautl -sign -inkey private.pem       -in message.txt -out message.ssl
// openssl rsautl       -inkey public.pem -pubin -in message.ssl -out message.txt

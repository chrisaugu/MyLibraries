import crypto from 'crypto';

export class ECDHKeyExchange {
  ecdh: crypto.ECDH;
  publicKey: any;
  privateKey: any;

  constructor() {
    // Generate ECDH key pair using P-256 curve
    this.ecdh = crypto.createECDH('prime256v1');
    this.publicKey = this.ecdh.generateKeys();
    this.privateKey = this.ecdh.getPrivateKey();
  }

  getPublicKey() {
    return this.publicKey.toString('base64');
  }

  computeSharedSecret(peerPublicKeyBase64: string) {
    const peerPublicKey = Buffer.from(peerPublicKeyBase64, 'base64');
    const sharedSecret = this.ecdh.computeSecret(peerPublicKey);

    // Derive AES key from shared secret
    const aesKey = crypto.pbkdf2Sync(
      sharedSecret,
      'salt',
      100000,
      32,
      'sha256'
    );
    return aesKey;
  }
}

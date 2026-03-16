import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

export default class EncryptionMiddleware {
  private serverPrivateKey: string;
  private clientPublicKeys: Record<string, crypto.KeyLike>;

  constructor(
    serverPrivateKey: string,
    clientPublicKeyRegistry: Record<string, crypto.KeyLike>
  ) {
    this.serverPrivateKey = serverPrivateKey;
    this.clientPublicKeys = clientPublicKeyRegistry; // Map of clientId -> publicKey
  }

  // Middleware to decrypt incoming requests
  decryptRequest(req: Request, res: Response, next: NextFunction) {
    if (!req.headers['x-encrypted']) {
      return next();
    }

    const clientId = req.headers['x-client-id'] as string;
    const clientPublicKey = this.clientPublicKeys[clientId];

    const { encryptedKey, iv, authTag, ciphertext } = req.body as {
      encryptedKey: string;
      iv: string;
      authTag: string;
      ciphertext: string;
    };

    const symmetricKey = crypto.privateDecrypt(
      {
        key: this.serverPrivateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      Buffer.from(encryptedKey, 'base64')
    );

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      symmetricKey,
      Buffer.from(iv, 'base64')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));
    let plaintext = decipher.update(ciphertext, 'base64', 'utf8');
    plaintext += decipher.final('utf8');

    req.body = JSON.parse(plaintext);
    next();
  }

  // Middleware to encrypt outgoing responses
  encryptResponse(req: Request, res: Response, next: NextFunction) {
    const originalJson = res.json;
    const $this = this;

    res.json = function (data: unknown) {
      if (req.headers['x-encrypted']) {
        data = $this.encryptForClient(
          req.headers['x-client-id'] as string,
          data
        );
        res.set('x-encrypted', 'true');
      }
      originalJson.call(res, data);
    }.bind(res);

    console.log(res);

    next();
  }

  encryptForClient(
    clientId: string,
    data: unknown
  ): {
    encryptedKey: string;
    iv: string;
    authTag: string;
    ciphertext: string;
  } {
    const clientPublicKey = this.clientPublicKeys[clientId];

    const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
    const symmetricKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv('aes-256-gcm', symmetricKey, iv);
    let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
    ciphertext += cipher.final('base64');
    const authTag = cipher.getAuthTag();

    const encryptedKey = crypto.publicEncrypt(
      {
        key: clientPublicKey!,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      symmetricKey
    );

    return {
      encryptedKey: encryptedKey.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      ciphertext
    };
  }
}

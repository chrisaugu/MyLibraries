import crypto from 'node:crypto';
import { SecureChatClient } from './secure-chat-client';

class SignedMessageChat extends SecureChatClient {
  private signingKeys: any;
  private peerSigningKeys: Map<any, any>;

  constructor(serverUrl: string, userId: string, username: string) {
    super(serverUrl, userId, username);

    // Generate signing key pair
    this.signingKeys = crypto.generateKeyPairSync('ec', {
      namedCurve: 'secp256k1',
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    this.peerSigningKeys = new Map();
  }

  signMessage(message: any, timestamp: number) {
    const sign = crypto.createSign('SHA256');
    sign.update(`${message}${timestamp}`);
    sign.end();

    return sign.sign(this.signingKeys.privateKey, 'base64');
  }

  verifyMessage(message: any, timestamp: any, signature: any, peerUserId: any) {
    const peerPublicKey = this.peerSigningKeys.get(peerUserId);
    if (!peerPublicKey) return false;

    const verify = crypto.createVerify('SHA256');
    verify.update(`${message}${timestamp}`);
    verify.end();

    return verify.verify(peerPublicKey, signature, 'base64');
  }

  sendSignedMessage(peerUserId: any, text: any) {
    const timestamp = Date.now();
    const signature = this.signMessage(text, timestamp);

    // First encrypt the message as before
    const encrypted = super.encryptMessage(peerUserId, text);

    // Then send with signature
    this.socket?.emit('signed-message', {
      ...encrypted,
      signature,
      timestamp
    });
  }
}

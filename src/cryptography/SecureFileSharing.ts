import crypto from 'node:crypto';

export default class SecureFileSharing {
  private users: Map<string, crypto.KeyLike>;
  private files: Map<
    string,
    {
      encryptedFile: string;
      encryptedKey: string;
      iv: string;
      authTag: string;
      owner: string;
      filename: string;
    }
  >;

  constructor() {
    this.users = new Map(); // userId -> { publicKey, encryptedPrivateKey? }
    this.files = new Map(); // fileId -> { encryptedKey, owner, metadata }
  }

  async registerUser(userId: string, publicKey: string) {
    // Store user's public key
    this.users.set(userId, publicKey);
  }

  async uploadFile(userId: string, fileBuffer: Buffer, filename: string) {
    // TODO: Generate random file encryption key
    const fileKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(32);

    const publicKey = this.users.get(userId);

    // TODO: Encrypt file with AES-256-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', fileKey, iv);
    let encryptedFile = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final()
    ]).toBase64();
    const authTag = cipher.getAuthTag().toBase64();

    // TODO: Encrypt the file key with user's public key
    const encryptedKey = crypto.publicEncrypt(publicKey!, fileKey).toBase64();

    // TODO: Store: {
    //   encryptedFile: buffer,
    //   encryptedKey: forOwner,
    //   iv: ...,
    //   authTag: ...,
    //   owner: userId,
    //   filename: encrypted filename
    // }

    this.files.set('123', {
      encryptedFile,
      encryptedKey,
      iv: iv.toHex(),
      authTag,
      owner: userId,
      filename
    });
  }

  async shareFile(ownerId: string, fileId: string, targetUserId: string) {
    // TODO: Decrypt file key with owner's private key
    const privateKey = this.users.get(ownerId);
    const fileBuffer = this.files.get(fileId);
    const fileKey = crypto.privateDecrypt(
      privateKey!,
      Buffer.from(fileBuffer?.encryptedFile!, 'base64')
    );

    // TODO: Re-encrypt file key with target user's public key
    const file = '';

    // TODO: Create access entry for target user
    this.files.set(targetUserId, {
      encryptedFile: '',
      encryptedKey: '',
      iv: '',
      authTag: '',
      owner: '',
      filename: ''
    });
  }

  async downloadFile(userId: string, fileId: string) {
    const privateKey = this.users.get(userId);
    const fileBuffer = this.files.get(fileId);

    const iv = fileBuffer?.iv;
    const tag = Buffer.from(fileBuffer?.authTag!);

    const encryptedKey = fileBuffer?.encryptedKey;
    const fileKey = crypto.privateDecrypt(privateKey!, encryptedKey!);

    // TODO: Decrypt file with the key
    const decipher = crypto.createDecipheriv('aes-256-gcm', fileKey, iv!);
    const authTag = decipher.setAuthTag(tag);
    let fileBuff = Buffer.concat([
      decipher.update(Buffer.from(fileBuffer?.encryptedFile!)),
      decipher.final()
    ]);

    // TODO: Return plaintext file
    return fileBuff;
  }

  // Advanced Challenge: Implement secure file deletion
  async secureDelete(fileId: string) {
    // Overwrite encrypted data with random bytes before deletion
  }
}

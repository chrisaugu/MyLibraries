import crypto from 'crypto';
import { io, Socket } from 'socket.io-client';
import { ECDHKeyExchange } from './echd-key-exchange';

export class SecureChatClient {
  serverUrl: string;
  userId: string;
  username: string;
  socket: Socket | null;
  keyExchange: ECDHKeyExchange;
  sessionKeys: Map<string, { key: Buffer; username: string }>;
  pendingMessages: Map<
    string,
    {
      timestamp?: string;
      from?: string;
      fromUsername?: string;
      encryptedContent?: string;
      iv?: string;
      authTag?: string;
    }[]
  >;

  constructor(serverUrl: string, userId: string, username: string) {
    this.serverUrl = serverUrl;
    this.userId = userId;
    this.username = username;
    this.socket = null;

    // Generate key pair for this user
    this.keyExchange = new ECDHKeyExchange();
    this.sessionKeys = new Map(); // peerUserId -> AES key
    this.pendingMessages = new Map(); // Store messages while establishing session
  }

  async connect() {
    this.socket = io(this.serverUrl, {
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');

      // Register public key
      this.socket?.emit('register-public-key', {
        userId: this.userId,
        username: this.username,
        publicKey: this.keyExchange.getPublicKey()
      });
    });

    // Receive peer public keys
    this.socket.on(
      'user-public-key',
      async (data: { userId: string; username: string; publicKey: string }) => {
        const { userId, username, publicKey } = data;

        if (userId !== this.userId && !this.sessionKeys.has(userId)) {
          console.log(`Establishing secure session with ${username}`);

          // Compute shared secret
          const aesKey = this.keyExchange.computeSharedSecret(publicKey);
          this.sessionKeys.set(userId, {
            key: aesKey,
            username
          });

          // Send any pending messages for this user
          if (this.pendingMessages.has(userId)) {
            const messages = this.pendingMessages.get(userId);
            messages?.forEach((msg) => this.sendEncryptedMessage(userId, msg));
            this.pendingMessages.delete(userId);
          }
        }
      }
    );

    // Receive encrypted messages
    this.socket.on('encrypted-message', (data) => {
      this.handleEncryptedMessage(data);
    });

    // Request peer keys for existing contacts
    this.socket.on('contacts-list', (contacts: any[]) => {
      contacts.forEach((contact: { userId: any }) => {
        if (!this.sessionKeys.has(contact.userId)) {
          this.socket?.emit('request-peer-key', {
            targetUserId: contact.userId,
            requesterId: this.userId
          });
        }
      });
    });
  }

  async sendMessage(peerUserId: string, text: any) {
    if (this.sessionKeys.has(peerUserId)) {
      // Session exists, send immediately
      this.sendEncryptedMessage(peerUserId, text);
    } else {
      // Queue message and request key
      console.log('Session not established, queuing message');

      if (!this.pendingMessages.has(peerUserId)) {
        this.pendingMessages.set(peerUserId, []);

        // Request peer's public key
        this.socket?.emit('request-peer-key', {
          targetUserId: peerUserId,
          requesterId: this.userId
        });
      }

      this.pendingMessages.get(peerUserId)?.push(text);
    }
  }

  sendEncryptedMessage(peerUserId: string, text: any) {
    const session = this.sessionKeys.get(peerUserId);

    // Generate message-specific IV
    const iv = crypto.randomBytes(12);

    // Encrypt with session key
    const cipher = crypto.createCipheriv('aes-256-gcm', session?.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();

    this.socket?.emit('encrypted-message', {
      to: peerUserId,
      from: this.userId,
      fromUsername: this.username,
      encryptedContent: encrypted,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      timestamp: Date.now()
    });
  }

  handleEncryptedMessage(data: {
    timestamp?: string;
    from?: any;
    fromUsername?: any;
    encryptedContent?: any;
    iv?: any;
    authTag?: any;
  }) {
    const { from, fromUsername, encryptedContent, iv, authTag } = data;

    // Get session key for sender
    const session = this.sessionKeys.get(from);

    if (!session) {
      console.log(`Received message from unknown user ${from}, requesting key`);

      // Request key for this user
      this.socket?.emit('request-peer-key', {
        targetUserId: from,
        requesterId: this.userId
      });

      // Store message for later decryption
      if (!this.pendingMessages.has(from)) {
        this.pendingMessages.set(from, []);
      }
      this.pendingMessages.get(from)?.push(data);
      return;
    }

    try {
      // Decrypt message
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        session.key,
        Buffer.from(iv, 'base64')
      );
      decipher.setAuthTag(Buffer.from(authTag, 'base64'));

      let decrypted = decipher.update(encryptedContent, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      console.log(`${fromUsername}: ${decrypted}`);

      // Emit event for UI
      this.emit('message-decrypted', {
        from: fromUsername,
        content: decrypted,
        timestamp: data.timestamp
      });
    } catch (error) {
      console.error('Failed to decrypt message:', error);
    }
  }
  emit(arg0: string, arg1: { from: any; content: string; timestamp: any }) {
    throw new Error('Method not implemented.');
  }
  encryptMessage(peerUserId: any, text: any) {
    throw new Error('Method not implemented.');
  }
}

import type { Socket } from 'socket.io';

// Server-side for facilitating key exchange
class KeyExchangeServer {
  private io: Socket;
  private userPublicKeys: Map<any, any>;

  constructor(io: Socket) {
    this.io = io;
    this.userPublicKeys = new Map();
  }

  setup() {
    this.io.on('connection', (socket: Socket) => {
      // Handle public key registration
      socket.on('register-public-key', (data: any) => {
        const { userId, publicKey } = data;
        this.userPublicKeys.set(userId, publicKey);

        // Optionally broadcast to relevant users
        socket.broadcast.emit('user-public-key', { userId, publicKey });
      });

      // Handle key exchange requests
      socket.on('request-peer-key', (data: any) => {
        const { targetUserId, requesterId } = data;
        const targetPublicKey = this.userPublicKeys.get(targetUserId);

        if (targetPublicKey) {
          socket.emit('peer-key-response', {
            userId: targetUserId,
            publicKey: targetPublicKey
          });
        }
      });
    });
  }
}

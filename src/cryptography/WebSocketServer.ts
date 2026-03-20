import WebSocket, { WebSocketServer } from 'ws';
import themis, { SecureSession } from 'wasm-themis';

// Server private key (same as original)
const serverPrivKey = Buffer.from([
  0x52, 0x45, 0x43, 0x32, 0x00, 0x00, 0x00, 0x2d, 0x49, 0x87, 0x04, 0x6b, 0x00,
  0xf2, 0x06, 0x07, 0x7d, 0xc7, 0x1c, 0x59, 0xa1, 0x8f, 0x39, 0xfc, 0x94, 0x81,
  0x3f, 0x9e, 0xc5, 0xba, 0x70, 0x6f, 0x93, 0x08, 0x8d, 0xe3, 0x85, 0x82, 0x5b,
  0xf8, 0x3f, 0xc6, 0x9f, 0x0b, 0xdf
]);

const pubKeys = new Map<string, Buffer>();
const sessions = new Map<string, SecureSession>();
const sessionStates = new Map(); // Track session state for each client

// Custom callback class for Themis
class CallbacksForThemis {
  getPublicKeyForId(id: string) {
    console.log('Getting public key for ID:', id);
    const key = pubKeys.get(id);
    if (!key) {
      throw new Error(`No public key found for id: ${id}`);
    }
    return key;
  }
}

// Channel/broadcast functionality
class Channel {
  subscribers: Map<number, Function>;
  counter: number;

  constructor() {
    this.subscribers = new Map();
    this.counter = 0;
  }

  subscribe(callback: (msg: string) => void) {
    const id = this.counter++;
    this.subscribers.set(id, callback);
    return id;
  }

  unsubscribe(id: number) {
    this.subscribers.delete(id);
  }

  push(message: string) {
    this.subscribers.forEach((callback) => {
      try {
        callback(message);
      } catch (err) {
        console.error('Error in subscriber callback:', err);
      }
    });
  }
}

// Create WebSocket server
const wss = new WebSocketServer({ host: '0.0.0.0', port: 8080 });
const channel = new Channel();

console.log(`WebSocket server running on port 0.0.0.0:8080`);

wss.on('connection', (ws: WebSocket) => {
  let stage = 0;
  let clientId: string = '';
  let session: SecureSession | null = null;

  // Subscribe to channel
  const sid = channel.subscribe((msg: string) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  });

  ws.on('message', async (data: Buffer) => {
    try {
      const msg = data.toString();

      if (stage === 0) {
        // First message: id:pubkey
        const [id, pubkeyB64] = msg.split(':');
        clientId = id!;

        // Store public key
        const pubKeyBuffer = Buffer.from(pubkeyB64!, 'base64');
        pubKeys.set(clientId, pubKeyBuffer);

        // Create secure session
        const callbacks = new CallbacksForThemis() as any;
        session = new themis.SecureSession(
          Buffer.from('server'),
          serverPrivKey,
          callbacks
        );
        sessions.set(clientId, session);
        sessionStates.set(clientId, { connected: false });

        stage++;
        return;
      }

      // Handle secure session messages
      console.log('Processing secure message, stage:', stage);

      if (!session) {
        throw new Error('No secure session established');
      }

      // Unwrap the message
      const unwrappedResult = session?.unwrap(Buffer.from(msg, 'base64'));
      if (unwrappedResult.length === 0) {
        // Need to send response as-is (part of handshake)
        console.log('Unwrap returned empty, sending handshake response');
        const unwrapResult = unwrappedResult;
        if (unwrapResult && unwrapResult.length > 0) {
          ws.send(Buffer.from(unwrapResult).toString('base64'));
        }
        return;
      }

      // Message successfully unwrapped
      console.log(
        'Message unwrapped successfully:',
        unwrappedResult.toString()
      );

      const wrappedMsg = session?.wrap(
        Buffer.from(`-> ${unwrappedResult?.toString()}`)
      );
      channel.push(Buffer.from(wrappedMsg!).toString('base64'));
    } catch (err: any) {
      console.error('Error processing message:', err);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ error: err.message }));
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected:', clientId);
    channel.unsubscribe(sid);
    if (clientId) {
      sessions.delete(clientId);
      pubKeys.delete(clientId);
      sessionStates.delete(clientId);
    }
  });

  ws.on('error', (err: any) => {
    console.error('WebSocket error:', err);
  });
});

wss.on('error', (err: any) => {
  console.error('Server error:', err);
});

const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', function (event) {
  socket.send('Hello Server!');
});

socket.addEventListener('message', function (event) {
  console.log('Message from server: ', event.data);
});

socket.addEventListener('error', function (event) {
  console.error('WebSocket error:', event);
});

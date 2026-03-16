import io from 'socket.io-client';

// Use wss:// protocol for secure connection
const socket = io('wss://your-server.com', {
  secure: true,
  rejectUnauthorized: true,
  transports: ['websocket'] // Force WebSocket transport
});

socket.on('connect', () => {
  console.log('Connected to secure Socket.IO server');
});

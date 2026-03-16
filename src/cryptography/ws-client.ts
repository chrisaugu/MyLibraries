import WebSocket from 'ws';
import fs from 'node:fs';

// Production: rejectUnauthorized should be true
const ws = new WebSocket('wss://localhost:8443', {
  rejectUnauthorized: true, // Verify server certificate
  ca: fs.readFileSync('path/to/ca-certificate.pem') // For self-signed certs
});

ws.on('open', () => {
  console.log('Connected to secure server');
  ws.send('Hello secure world!');
});

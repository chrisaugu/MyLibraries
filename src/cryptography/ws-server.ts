import fs from 'fs';
import https from 'https';
import { WebSocketServer } from 'ws';

// Load SSL certificates (in production, use proper CA-signed certificates)
const server = https.createServer({
  cert: fs.readFileSync('./certs/certificate.pem'),
  key: fs.readFileSync('./certs/private_key.pem'),
  ca: fs.readFileSync('./certs/ca-certificate.pem') // For certificate chain
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected securely');

  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    // Message is automatically encrypted by TLS
    ws.send(`Echo: ${message}`);
  });
});

server.listen(8443, () => {
  console.log('Secure WebSocket server running on wss://localhost:8443');
});

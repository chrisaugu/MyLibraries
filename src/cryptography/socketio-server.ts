import express from 'express';
import https from 'https';
import { Server } from 'socket.io';
import fs from 'fs';

const certfs = {
  cert: fs.readFileSync('path/to/certificate.pem'),
  key: fs.readFileSync('path/to/key.pem')
};

const app = express();

const server = https.createServer(certfs, app);

const io = new Server(server, {
  cors: {
    origin: 'https://localhost:8443',
    credentials: true
  }
});

io.use((socket, next) => {
  // Middleware will run over encrypted connection
  next();
});

io.on('connection', (socket) => {
  console.log('User connected via secure channel');

  socket.on('message', (data) => {
    // Data is encrypted by TLS at transport level
    io.emit('message', data);
  });
});

server.listen(8443, () => {
  console.log('Secure Socket.IO server running');
});

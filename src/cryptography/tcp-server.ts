import net from 'node:net';
import tls from 'node:tls';
import fs, { createReadStream } from 'node:fs';
import { redis } from 'bun';
import { Encryption } from './encryption';
import SecureMessaging from './SecureMessaging';
import { bobPrivateKey } from './keys';

const MAX_BODY = 1 * 1024 * 1024; // 1MB limit prevents memory exhaustion

// const publicKey = fs.readFileSync(__dirname + "/id_rsa_pub.pem", "utf8");
// const publicKey1 = fs.readFileSync(__dirname + "/certs/public_key.pem", "utf8");
// const privateKey1 = fs.readFileSync(__dirname + "/certs/private_key.pem", "utf8");

const secure = new SecureMessaging();
// const tcpServer = net.createServer();
// tcpServer.listen(8124, '127.0.0.1', () => {
//     console.log('server bound');
// });
// tcpServer.on('connection', (socket) => {
//     console.log('client connected');

//     socket.on('data', (data) => {
//         // const messageString = data.toString('utf8');
//         const messageString = data.toString();
//         try {
//             // Attempt to parse the received data as JSON
//             const receivedObject = JSON.parse(messageString);
//             console.log('Received object:', receivedObject);
//             const plaintext = secure.readMessage(bobPrivateKey, receivedObject.message)
//             console.log(plaintext)

//             // Example response: send back a confirmation object
//             const responseObj = { status: 'success', message: 'Object received' };
//             socket.write(JSON.stringify(responseObj));
//         } catch (e: any) {
//             console.error('Failed to parse JSON:', e.message);
//         }
//         // const payload = data.toString().split('\r\n\r\n')[1]
//         // console.log("Server:", JSON.parse(payload!));
//         // socket.write(payload!);
//     });
//     socket.on('end', () => {
//         console.log('client disconnected');
//     });
//     // socket.write(ciphertext + '\r\n');
//     // socket.pipe(socket);
// });
// tcpServer.on('error', (err) => {
//     throw err;
// });

function parseJSONBody(req: Request, res: Response) {
  return new Promise((resolve, reject) => {
    let body = '';
    let received = 0;

    // Validate Content-Type before processing
    const contentType = req.headers['content-type'] || '';
    if (!contentType.startsWith('application/json')) {
      res.writeHead(415, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unsupported Content-Type' }));
      return reject(new Error('Unsupported Content-Type'));
    }

    // Collect data chunks
    req.on('data', (chunk) => {
      received += chunk.length;

      // Prevent memory exhaustion from huge payloads
      if (received > MAX_BODY) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload too large' }));
        req.destroy(); // Stop receiving more data
        return reject(new Error('Payload too large'));
      }
      body += chunk.toString(); // Convert Buffer to string
    });

    // All chunks received, now parse
    req.on('end', () => {
      try {
        if (!body) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Empty request body' }));
          return reject(new Error('Empty request body'));
        }

        const data = JSON.parse(body);

        // Validate it's an object (not a string, number, etc.)
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON object' }));
          return reject(new Error('Invalid JSON object'));
        }

        resolve(data);
      } catch (parseError) {
        // JSON.parse() throws for malformed JSON
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed JSON' }));
        console.error('JSON parse error:', parseError.message);
      }
    });

    // Handle network errors
    req.on('error', (error) => {
      console.error('Request error:', error.message);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Request error' }));
    });
  });
}

import net from 'node:net';
import SecureMessaging from './SecureMessaging';
import { bobPublicKey } from './keys';

const secure = new SecureMessaging();

// Save original write method
// const originalWrite = net.Socket.prototype.write;

// Override write method
// net.Socket.prototype.write = (chunk: Uint8Array | string, encoding?: BufferEncoding, callback: (err: any) => void) => {
//     console.log(`Intercepted outgoing TCP data: ${chunk.toString()}`);
//     return originalWrite.call(this, chunk, encoding, callback);
// };

// const client = net.createConnection({ host: 'example.com', port: 80 }, () => {
//     client.write('GET / HTTP/1.1\r\nHost: example.com\r\n\r\n');
// });

// client.on('data', (data) => {
//     console.log(`Received: ${data.toString()}`);
// });

// use net.createConnection instead
const socket = new net.Socket();
socket.connect(8124, '127.0.0.1', () => {
  console.log('Connected');

  const plaintext = 'Hello World';

  const encryptedMessage = secure.createMessage(
    bobPublicKey,
    plaintext,
    'abc123'
  );

  const dataToSend = {
    id: 12345,
    name: 'Node.js TCP Client',
    message: encryptedMessage,
    timestamp: Date.now()
  };

  // 1. Serialize the object to a JSON string
  const jsonString = JSON.stringify(dataToSend);

  // // 2. Append a delimiter (e.g., newline) to the string for framing
  // const messageWithDelimiter = jsonString + '\n';

  // // 3. Convert the string to a Buffer using Buffer.from()
  // // The default encoding is 'utf8', which is fine for JSON strings
  // const buffer = Buffer.from(messageWithDelimiter, 'utf8');

  // // 4. Send the buffer over the socket
  // // Serialize the object to a JSON string and send
  // socket.write(buffer, (err) => {
  //     if (err) {
  //         console.error('Error sending data:', err.message);
  //     } else {
  //         console.log('Data sent');
  //     }
  // });

  socket.write(jsonString);
});
socket.on('data', (data: Buffer) => {
  const payload = data.toString().split('\r\n')[0];
  console.log('Server:', JSON.parse(payload!));
  // const plaintext = secure.readMessage(alicePrivateKey, data.toJSON())
  // const responseString = data.toString('utf8');
  // try {
  //     const responseObject = JSON.parse(responseString);
  //     console.log('Received response:', responseObject);
  // } catch (e: any) {
  //     console.error('Failed to parse response JSON:', e.message);
  // }
  socket.end();
  socket.destroy();
});
socket.on('close', () => {
  console.log('Connection closed');
});
socket.on('end', () => {
  console.log('disconnected from server');
});

// const socket = net.createConnection({
//     port: 8124,
//     // path: '/tmp/echo.sock',
//     // onread: {
//     //     // Reuses a 4KiB Buffer for every read from the socket.
//     //     buffer: Buffer.alloc(4 * 1024),
//     //     callback: function (nread, buf) {
//     //         // Received data is available in `buf` from 0 to `nread`.
//     //         console.log(buf.toString('utf8', 0, nread));
//     //     },
//     // },
// }, () => {
//     // 'connect' listener.
//     console.log('connected to server!');
//     socket.write('world!\r\n');
// });
// socket.on("data", (buf) => {
//     if (buf instanceof Buffer) {
//         let offset = 0;

//         const type = buf.readUInt8(offset);
//         offset += 1;

//         const length = buf.readUInt32BE(offset);
//         offset += 4;

//         const payload = buf.subarray(offset, offset + length);

//         for (let b of buf) {
//             console.log(String.fromCharCode(b))
//         }

//         console.log("Client: ", offset, type, length, payload, buf.toString())
//         socket.end();
//     }
// });
// socket.on('end', () => {
//     console.log('disconnected from server');
// });

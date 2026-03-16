import net from 'node:net';
import Mitm from 'mitm';

// const mitm = Mitm();

// // Intercept outgoing TCP connections
// mitm.on('connect', (socket, opts) => {
//     console.log(`Intercepted TCP connection to ${opts.host}:${opts.port}`);

//     // Simulate a fake server response
//     socket.on('data', (chunk) => {
//         console.log(`Outgoing data: ${chunk.toString()}`);
//     });

//     // Send fake data back to the client
//     socket.write('Hello from MITM interceptor!\n');
// });

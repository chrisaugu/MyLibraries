import https from 'node:https';
import http from 'node:http';
import fs, { createReadStream } from 'node:fs';

const options = {
  // key: fs.readFileSync('./certs/private_key.key'),
  key: fs.readFileSync('./certs/private_key.pem'),
  cert: fs.readFileSync('./certs/certificate.pem')
  // ca: fs.readFileSync('./certs/ca_bundle.pem')
};

const httpsServer = https
  .createServer(options, (req, res) => {
    const { headers, method, url } = req;

    res.end('Hello World\\n');
  })
  .listen(8443);

// const httpServer = http.createServer((req, res) => {
//     const { headers, method, url } = req;
//     let body = "";
//     req.on('error', (err) => {
//             console.error(err);
//             res.statusCode = 400;
//             res.end('400: Bad Request');
//         })
//         .on('data', (chunk) => body += chunk.toString())
//         .on('end', async () => {
//             // body = Buffer.concat(body).toString();

//             // // At this point, you have the full request body as a string.
//             // // You can now process the data, for example, parsing JSON:
//             // if (method === 'POST' && url == '/') {
//             try {
//                 const formData = JSON.parse(body);
//                 console.log('Received form data:', formData);
//                 const { key, prime, generator } = formData;

//                 let encryption = new Encryption()
//                 let data = await encryption.recipientKeys(prime, generator, key)
//                 await redis.set("service2", data.public_key);
//                 console.log('Recipient Keys:', data);
//                 // res.writeHead(200, { 'Content-Type': 'text/plain' });
//                 // res.end('Form data successfully received!');
//                 res.writeHead(200, { 'Content-Type': 'application/json' });
//                 res.end(JSON.stringify({
//                     public_key: data.public_key
//                 }));
//             } catch (e) {
//                 res.statusCode = 400;
//                 // res.end('400: Invalid JSON');
//                 console.error("Err:", e)
//                 res.writeHead(400, { 'Content-Type': 'application/json' });
//                 res.end(JSON.stringify({
//                     message: "invalid json"
//                 }));
//             }
//             // } else {
//             //     res.statusCode = 404;
//             //     res.end('404: Not Found');
//             // }
//         });

//     // res.writeHead(200, { 'Content-Type': 'application/json' });
//     // res.end(JSON.stringify({
//     //     public_key: "hello"
//     // }));
// })
// httpServer.listen(8124, () => {
//     console.log('Server running on http://localhost:8124');
// });
// httpServer.on('connection', () => { });

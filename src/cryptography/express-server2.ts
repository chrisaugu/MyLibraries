const cluster = require('cluster');
const os = require('os');
const http2 = require('http2');
const fs = require('fs');
const express = require('express');

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
    console.log(`Master process ${process.pid} is running`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Restart workers on exit
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Spawning a new one.`);
        cluster.fork();
    });
} else {
    const app = express();

    // Sample route
    app.get('/', (req, res) => {
        res.send('Hello from Node.js with HTTP/2 and clustering!');
    });

    // Load SSL/TLS certificates for HTTP/2
    const options = {
        key: fs.readFileSync('server-key.pem'),
        cert: fs.readFileSync('server-cert.pem')
    };

    // Create HTTP/2 Secure Server
    http2.createSecureServer(options, app).listen(3000, () => {
        console.log(`Worker ${process.pid} listening on port 3000`);
    });
}
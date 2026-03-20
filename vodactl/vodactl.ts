#!/usr/bin/env node

// bun build ./vodactl.ts --compile --outfile vodactl
// linux
// bun build ./vodactl.ts --compile --target=bun-linux-x64 --outfile vodactl
// windows
// bun build ./vodactl.ts --compile --target=bun-windows-x64 --outfile vodactl --windows-icon=path/to/icon.ico
// macos
// bun build ./vodactl.ts --compile --target=bun-darwin-x64 --outfile vodactl
// chmod +x cli.js

import YAML from 'yaml';
import fs from "node:fs";
// import { secrets } from "bun";

// import data from "./data.toml";
// import config from "./config.yaml";
// import config from "./config.yaml" with { type: "yaml" };

// config.database.port; // => 5432

// config.database.host; // => "localhost"
// config.server.port; // => 3000
// config.features.auth; // => true

// const file = Bun.file('./vodactl.yml');
const file = fs.readFileSync('./vodactl.yml', 'utf8');
if (!file) {
    console.log("File not found")
}

const parsedData = YAML.parse(file);

interface Config {
    database: { host: string; port: number };
}
interface APIsConfig {
    apis: API[];
}
interface API {
    name: string;
    url: string;
    proxies: string[];
}
parsedData
const config = parsedData as Config;
console.log(config);


// let githubToken: string | null = await secrets.get({
//     service: "my-cli-tool",
//     name: "github-token",
// });

// if (!githubToken) {
//     githubToken = prompt("Please enter your GitHub token");

//     await secrets.set({
//         service: "my-cli-tool",
//         name: "github-token",
//         value: githubToken,
//     });

//     console.log("GitHub token stored");
// }

// const response = await fetch("https://api.github.com/user", {
//     headers: { Authorization: `token ${githubToken}` },
// });

// console.log(`Logged in as ${(await response.json()).login}`);


// const stringData = YAML.stringify(config);
// fs.appendFileSync("./vodactl.yml", stringData, "utf8");


function connectToVM() {
    const { Client } = require('ssh2');

    const conn = new Client();
    conn.on('ready', () => {
        console.log('Client :: ready');
        conn.exec('uptime', (err, stream) => {
            if (err) throw err;
            stream.on('close', (code, signal) => {
                console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                conn.end();
            }).on('data', (data) => {
                console.log('STDOUT: ' + data);
            }).stderr.on('data', (data) => {
                console.log('STDERR: ' + data);
            });
        });
    });
    conn.on('ready', () => {
        console.log('Client :: ready');
        conn.shell((err, stream) => {
            if (err) throw err;
            stream.on('close', () => {
                console.log('Stream :: close');
                conn.end();
            }).on('data', (data) => {
                console.log('OUTPUT: ' + data);
            });
            stream.end('ls -l\nexit\n');
        });
    });

    conn.connect({
        host: '192.168.100.100',
        port: 22,
        username: 'frylock',
        // privateKey: fs.readFileSync('/path/to/my/key')
    });
}

connectToVM()
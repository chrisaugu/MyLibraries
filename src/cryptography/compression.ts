import { Buffer } from 'node:buffer';
import { createGzip } from 'node:zlib';
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream';

const data = Buffer.from('Hello, world!');
const compressed = Bun.gzipSync(data);
console.log(compressed);

const decompressed = Bun.gunzipSync(compressed);
const text = decompressed.toString();
console.log(new TextDecoder('utf-8').decode(decompressed));

const gzip = createGzip();
const source = createReadStream('compress-test.txt');
const destination = createWriteStream('compress-test.txt.gz');

pipeline(source, gzip, destination, (err) => {
  if (err) {
    console.error('An error occurred:', err);
    process.exitCode = 1;
  }
});

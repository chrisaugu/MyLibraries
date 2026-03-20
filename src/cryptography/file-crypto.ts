import fs from 'node:fs';
import crypto from 'node:crypto';

// More read https://mohammedshamseerpv.medium.com/encrypt-and-decrypt-files-in-node-js-a-step-by-step-guide-using-aes-256-cbc-c25b3ef687c3
export class FileEncryptor {
  private algorithm: crypto.CipherGCMTypes = 'aes-256-gcm';
  private iterations = 100000;
  private SALT_LENGTH = 16;
  private KEY_LENGTH = 32;
  private keyLength = 32;
  private ivLength = 12;
  private authTagLength = 16;
  private key: Buffer;

  constructor(password: string) {
    const salt = crypto.randomBytes(this.SALT_LENGTH).toString('hex');
    this.key = crypto.scryptSync(password, salt, this.KEY_LENGTH);
    // let key = 'MySuperSecretKey';
    // key = crypto.createHash('sha256').update(key).digest('base64').substr(0, 32);

    // console.debug(this.deriveKeyAndIV("secret", salt))
  }

  async encryptFile(inputFile: string, outputFile: string) {
    const iv = crypto.randomBytes(this.ivLength);
    const buffer = fs.readFileSync(inputFile);

    // Derive the key and IV from the passphrase and salt
    // const { key, iv } = deriveKeyAndIV(password, salt);

    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const tag = cipher.getAuthTag();

    fs.writeFileSync(outputFile, Buffer.concat([iv, encrypted, tag]));
    console.debug('File encrypted with buffer method.');
  }

  // [IV (this.ivLength bytes)][Ciphertext][Auth Tag (this.authTagLength bytes)]
  async decryptFile(inputFile: string, outputFile: string) {
    const encryptedBuffer = fs.readFileSync(inputFile);
    console.debug('File contents (hex):', encryptedBuffer.toString('hex'));
    console.debug('File contents (utf8):', encryptedBuffer.toString('utf8'));

    console.debug('Total file size:', encryptedBuffer.length);
    console.debug('IV length (expected):', this.ivLength);
    console.debug('Auth tag length (expected):', this.authTagLength);
    console.debug(
      'Expected ciphertext length:',
      encryptedBuffer.length - this.ivLength - this.authTagLength
    );

    const ivFromFile = encryptedBuffer.subarray(0, this.ivLength);
    const tag = encryptedBuffer.subarray(
      encryptedBuffer.length - this.authTagLength
    );
    const ciphertext = encryptedBuffer.subarray(
      this.ivLength,
      encryptedBuffer.length - this.authTagLength
    );

    console.debug('IV extracted length:', ivFromFile.length);
    console.debug('Tag extracted length:', tag.length);
    console.debug('Ciphertext extracted length:', ciphertext.length);

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      ivFromFile
    );
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);
    fs.writeFileSync(outputFile, decrypted);
    console.debug('File decrypted with buffer method.');
  }

  async encryptStream(inputFile: string, outputFile: string) {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    const input = fs.createReadStream(inputFile);
    const output = fs.createWriteStream(outputFile);

    console.debug(iv.toString('hex'));

    // Write IV in the first 16 bytes of the output file
    output.write(iv);
    input.pipe(cipher).pipe(output);
    // cipher.pipe(output, { end: false });
    // input.pipe(cipher);

    // cipher.on('end', () => {
    //   output.end(cipher.getAuthTag());
    // });
    output.on('finish', () => {
      // const authTag = cipher.getAuthTag().toString('hex');
      // console.debug({ iv: iv.toString('hex'), authTag });
      console.debug('File encrypted and saved to ' + outputFile);
    });

    return new Promise((resolve, reject) => {
      input.pipe(cipher).pipe(output);
      output.on('finish', () => {
        const authTag = cipher.getAuthTag();
        resolve({ iv, authTag });
      });
    });
  }

  decryptStream(
    inputFile: string,
    outputFile: string,
    iv: string,
    authTag: string
  ) {
    // const ivBuffer = Buffer.from(iv, 'hex');
    // const authTagBuffer = Buffer.from(authTag, 'hex');
    // const decipher = crypto.createDecipheriv(this.algorithm, this.key, ivBuffer);
    // decipher.setAuthTag(authTagBuffer);

    const input = fs.createReadStream(inputFile);
    const output = fs.createWriteStream(outputFile);

    // input.pipe(decipher).pipe(output);
    // Read the IV from the first 16 bytes of the input file
    input.once('data', (chunk: Buffer) => {
      const ivFromFile = chunk.subarray(0, this.ivLength);
      console.debug(ivFromFile.toString('hex'));
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.key,
        ivFromFile
      );
      // Continue piping the rest of the data (after the IV)
      input.pipe(decipher).pipe(output);
    });
    output.on('finish', () => {
      console.debug({ iv: iv, authTag });
      console.debug(`File successfully decrypted and saved to ${outputFile}`);
    });
    output.on('error', (err) => {
      console.error('Error writing decrypted file:', err);
    });
    input.on('error', (err) => {
      console.error('Error reading encrypted file:', err);
    });
  }

  // Function to derive a key and IV from a passphrase and salt
  private deriveKeyAndIV(password: string, salt: string) {
    // Derive the key using PBKDF2
    const key = crypto.pbkdf2Sync(
      password,
      salt,
      this.iterations,
      this.KEY_LENGTH,
      'sha256'
    );
    const iv = key.subarray(0, this.ivLength); // Use the first 16 bytes as the IV
    return { key, iv };
  }
}

// CLI Interface
// Usage: node file-crypto.js encrypt secret.txt secret.enc
// Usage: node file-crypto.js decrypt secret.enc secret.txt

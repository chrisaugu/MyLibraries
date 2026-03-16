import {
  Certificate,
  createHmac,
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHash
} from 'node:crypto';
import { Buffer } from 'node:buffer';

// const spkac = () => { }

// const publicKey = Certificate.exportPublicKey(spkac);
// console.log(publicKey);
// const spkacVerified = Certificate.verifySpkac(Buffer.from(spkac));

// const secret = "abcdef";
// // 'sha512'
// const hash = createHmac('sha256', secret)
//     .update("I love cupcakes")
//     .digest('hex');

//
function encrypt(text: string, key: Buffer<ArrayBuffer>) {
  const iv = randomBytes(16); // Initialization vector
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(key), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted; // return IV and encrypted text
}

//
function decrypt(encryptedText: string, key: Buffer) {
  const parts = encryptedText.split(':'); // split IV and encrypted text
  const iv = Buffer.from(parts.shift(), 'hex'); // Obtain IV
  const encryptedTextBuffer = Buffer.from(parts.join(':'), 'hex');
  const deciper = createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = deciper.update(encryptedTextBuffer, 'hex', 'utf8');
  decrypted += deciper.final('utf8');
  return decrypted;
}

// const key = randomBytes(32); // Generate a secure key
// const textToEncrypt = "Hello, World";
// const encryptedData = encrypt(textToEncrypt, key);
// console.log("Encrypted Data: " + encryptedData);
// const decryptedData = decrypt(encryptedData, key);
// console.log("Decrypted Data: " + decryptedData);

// hashing of password should be done with brcypt and argon2 algorithms
// SHA-512 should never be used
function passwordHash(password: string) {
  return createHash('sha512').update(password).digest('hex');
}
// console.log(passwordHash("secret"));

// const password = "super-secure-pa$$word";
// const hash = await Bun.password.hash(password);
// console.log("Hashed password: " + hash);
// const isValid = await Bun.password.verify(password, hash);
// console.log("Password is valid: " + isValid);

// const bytes = randomBytes(16)
// const b64 = bytes.toString("base64");
// const hex = bytes.toString('hex');
// const utf8 = bytes.toString('utf8');
// console.log(bytes, b64, hex, utf8)

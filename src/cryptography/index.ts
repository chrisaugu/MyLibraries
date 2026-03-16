import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { Database } from 'bun:sqlite';

class Message {
  id!: number;
  message!: string;
  user!: string;
  date!: Date;

  get isNow() {
    return this.date.getTime() == Date.now();
  }
}

// const db = new Database(":memory:");
const db = new Database('mydb.db', { create: true });
let query;
// query = db.query('DROP TABLE messages;').run();
// query = db.query(`CREATE TABLE messages (
//   id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
//   message text NOT NULL,
//   user text NOT NULL,
//   date int(11) NOT NULL
// );`);
// query.run();

const encrypt = (text: string, key: string) => {
  const iv = randomBytes(96);
  // try this: const iv = Buffer.from(Array(96).fill(0))
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(key), iv);
  const ciphertext = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return ciphertext + '|' + authTag + '|' + iv.toString('hex');
};
const decrypt = (ciphertextWithAuthTagAndIv: string, key: string) => {
  const [ciphertext, authTagHex, ivHex] = ciphertextWithAuthTagAndIv.split('|');
  const decipher = createDecipheriv(
    'aes-256-gcm',
    Buffer.from(key),
    Buffer.from(ivHex!, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTagHex!, 'hex'));
  return (
    decipher.update(ciphertext!, 'hex').toString('utf8') +
    decipher.final('utf8')
  );
};

const username = 'dolly';
const secret = 'my super secret, do not tell anyone!';
const password = 'password'.repeat(4);
const encrypted = encrypt(secret, password);

// let lastId = db.query("SELECT last_insert_rowid();").get();

query = db
  .query(
    'INSERT INTO messages(message, user, date) VALUES($message, $user, $date)'
  )
  .run({
    $message: encrypted,
    $user: username,
    $date: Date.now()
  });

const encryptedSecret =
  '5382ced1e55b88c7e7d73d1dea2f0f20e280af5c6b72b01547821a905ea902843a79f1fa|3deb02fd01bc993acf07d9d3c5baf4bb|8a79abd2768fe50b92642ee8662844d98c788fdd80040b9cc9a7d9c8dbe410c265a74ca5948ec5c86a9d0060f1d3bc6523da4c289ce081c745df89ffd4d13730ff395a0f951cf6e0f6a355270af9e28265342892e05a6737516a0c7e7fb085c9';
// const decryptedSecret = decrypt(encryptedSecret, password)

// console.log('secret:', secret)
// console.log('password:', password)
// console.log('encrypted text in hex:', encrypted)
// console.log('encrypted text in utf:', Buffer.from(encrypted, 'hex').toString())
// console.log('encryptedSecret:', encryptedSecret)
// console.log('decryptedSecret:', decryptedSecret)

query = db.query('SELECT * FROM messages;').as(Message);
const messages = query.all();

console.log(messages);

for (const row of query.iterate()) {
  // for (const row of query) {
  const decryptedSecret = decrypt(encryptedSecret, password);
  console.log('decryptedSecret:', decryptedSecret);
}

// openssl list -cipher-algorithms
// For example, AES-128-CBC means "use the cipher AES with a key length of 128 bits and the operation mode CBC".
// We can break this down into three choices:
// first, we need to decide which cipher to use,
// then, which key size,
// and last but not least, which mode of operation.
// const cipher = createCipheriv('id-aes256-GCM', Buffer.from(key), iv)
// This second parameter for the cipher algorithm, 256 in this case, is the key length or key size, which is always expressed in bits, not bytes.
// The chosen key length determines how many possible different keys there are.

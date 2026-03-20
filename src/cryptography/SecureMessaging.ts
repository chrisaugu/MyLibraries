import crypto, { publicDecrypt } from 'node:crypto';

export default class SecureMessaging {
  private keyLength = 32; // 32 bytes (256 bits)
  private keyPair: crypto.KeyPairExportResult<any>; // sender's private/public key
  private ivLength = 16;
  private peerPublicKeys: Map<any, any>;

  constructor() {
    // Generate RSA key pair on initialization
    this.keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048, // secured key length 2048, 4096
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    // console.log(
    //   publicKey.export({
    //     type: "pkcs1",
    //     format: "pem",
    //   }),

    //   privateKey.export({
    //     type: "pkcs1",
    //     format: "pem",
    //   })
    // );
    // Store peer public keys for signature verification
    this.peerPublicKeys = new Map();
  }

  // Register a peer's public key for verification
  registerPeer(peerId: string, publicKeyPem: string) {
    this.peerPublicKeys.set(peerId, publicKeyPem);
  }

  // Utility: Export public key for sharing
  getPublicKey() {
    return this.keyPair.publicKey;
  }

  // For sending messages to someone
  createMessage(bPublicKey: string, plaintext: string, senderId?: string) {
    // Generate ephemeral AES key
    const ephemeralAesKey = crypto.randomBytes(this.keyLength); // similar to iv
    const iv = crypto.randomBytes(this.ivLength);
    // Encrypt message with AES-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', ephemeralAesKey, iv);
    let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
    ciphertext += cipher.final('base64');
    // const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag().toBase64();
    // Encrypt AES key with recipient's RSA public key
    // const encryptedAesKey = crypto.publicEncrypt(bPublicKey, ephemeralAesKey).toBase64();
    const encryptedAesKey = crypto
      .publicEncrypt(
        {
          key: bPublicKey as string, //this.keyPair.publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        ephemeralAesKey
      )
      .toBase64();

    // Prepare message package
    const messagePackage = {
      encryptedKey: encryptedAesKey,
      iv: iv.toBase64(),
      authTag,
      ciphertext,
      timestamp: Date.now(),
      algorithm: 'aes-256-gcm',
      senderId: '',
      signature: ''
    };

    // If sender wants to sign the message
    if (senderId) {
      messagePackage['senderId'] = senderId;
      messagePackage['signature'] = this.signMessage(
        JSON.stringify(messagePackage)
      );
    }

    // Package everything: { encryptedKey, iv, authTag, ciphertext }
    return messagePackage;
  }

  // For receiving messages
  readMessage(
    aPrivateKey: string,
    encryptedPackage: {
      encryptedKey: string;
      iv: string;
      authTag: string;
      ciphertext: string;
      senderId?: string;
      signature?: string;
    }
  ) {
    const encryptedKey = Buffer.from(encryptedPackage.encryptedKey, 'base64');
    const iv = Buffer.from(encryptedPackage.iv, 'base64');
    const authTag = Buffer.from(encryptedPackage.authTag, 'base64');
    const ciphertext = Buffer.from(encryptedPackage.ciphertext, 'base64');

    // Decrypt AES key with private key
    // const decryptedAesKey = crypto.privateDecrypt(
    //   this.keyPair.privateKey as string,
    //   encryptedKey
    // );
    const decryptedAesKey = crypto.privateDecrypt(
      {
        key: aPrivateKey, //this.keyPair.privateKey as string,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, // Must match encryption padding
        oaepHash: 'sha256'
      },
      encryptedKey
    );

    // Decrypt message with AES key
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      decryptedAesKey,
      iv
    );
    decipher.setAuthTag(authTag);
    let plaintext = decipher.update(
      encryptedPackage.ciphertext,
      'base64',
      'utf8'
    );
    plaintext += decipher.final('utf8');
    // const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

    // Verify sender? (Add digital signature)
    if (encryptedPackage.senderId) {
      if (
        this.verifySignature(
          encryptedPackage.senderId,
          encryptedPackage.ciphertext,
          encryptedPackage.signature!
        )
      ) {
        console.log('Verified');
      } else {
        console.warn('Invalid');
      }
    }

    return plaintext;
  }

  signMessage(message: string) {
    const sign = crypto.createSign('SHA256');
    sign.update(message);
    return sign.sign(this.keyPair.privateKey as crypto.KeyLike, 'base64');
  }

  verifyMessage(message: string, signature: string) {
    const verifier = crypto.createVerify('sha256');
    verifier.update(message);
    verifier.end();
    return verifier.verify(
      this.keyPair.publicKey as crypto.KeyLike,
      signature,
      'base64'
    );
  }

  verifySignature(senderId: string, messageString: string, signature: string) {
    // const senderPublicKey = this.peerPublicKeys.get(senderId);
    // if (!senderPublicKey) {
    //   console.warn(`No public key registered for sender: ${senderId}`);
    //   return false;
    // }

    // const verify = crypto.createVerify('SHA256');
    // verify.update(messageString);
    // verify.end();
    // return verify.verify(senderPublicKey, signature, 'base64');
    return this.verifyMessage(messageString, signature);
  }

  //   Challenge: Group Messaging Extension
  // How would you encrypt a message for multiple recipients?
  // Implement a system where each recipient can decrypt the same message
}

// const secure = new SecureMessaging();
// Use this site https://cryptotools.net/rsagen, https://emn178.github.io/online-tools/rsa/key-generator/ to generate private/public key

// encrypte message
// let users = [1, 2, 3, 4, 5];
// users.forEach((user) => {
//   // encrypt the secret key using each user's public key
//   // send message to each user
// });

// // Sender's part
// const securedMessage = secure.createMessage(alicePublicKey, "hello world", "abc1234");
// console.log(securedMessage);

// // Recipient's part
// const plaintext = secure.readMessage(bobPrivateKey, securedMessage);
// console.log(plaintext);
// secure.verify("hello", "")

// # Generate a private key
// $ openssl genpkey -algorithm RSA -out private_key.pem
// $ openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
// Run this command to generate a 4096-bit private key and output it to the private.pem file.
// If you like, you may change the key length and/or output file.
// $ openssl genrsa
// Derive Public Key
// Given a private key, you may derive its public key and output it to public.pem using this command.
// (You may also paste your OpenSSL-generated private key into the form above to get its public key.)
// # The public key can be extracted from private key
// $ openssl rsa -in private_key.pem -pubout -out public_key.pem

// Encrypt Data
// We can now use this key pair to encrypt and decrypt a file, data.txt.
// $ openssl rsautl -encrypt -inkey public.pem -pubin -in data.txt -out data.txt.enc
// Decrypt Data
// Given the encrypted file from the previous step, you may decrypt it like so.
// $ openssl rsautl -decrypt -inkey private.pem -in data.txt.enc -out data.txt
// # Generate the certificate sign request
// openssl req -new -key app_private_key.pem -out app_csr.csr \
// -subj "/C=CA/ST=ON/L=Toronto/O=ExampleOrg/OU=IT/CN=example.org/emailAddress=hey@example.org" \
// -addext "subjectAltName=DNS:host.docker.internal,DNS:myapp.local,IP:172.18.0.1,IP:10.30.20.11"
// # Generate the Self-Signed CA certificate
// openssl req -x509 -new -key ca_private_key.pem -days 365 -out ca_certificate.crt \
// -subj "/C=CA/ST=ON/L=Toronto/O=ExampleOrg/OU=IT/CN=example.org/emailAddress=hey@example.org"

// # Use CA certificate to sign the CSR
// openssl x509 -req -in app_csr.csr \
//   -CA ca_certificate.crt \
//   -CAkey ca_private_key.pem \
//   -CAcreateserial -out app_certificate.crt

// openssl verify -CAfile ca.crt tls.crt

// openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout private-key.pem -out certificate.pem
// openssl genrsa -out key.pem
// openssl req -new -key key.pem -out csr.pem
// openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
// rm csr.pem

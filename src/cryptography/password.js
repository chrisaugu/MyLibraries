const crypto = require('crypto');

// Generate secure random data
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Hash data with SHA-256
function hashData(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Hash password with salt (simplified - use bcrypt for production)
function hashPassword(password, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return { hash, salt };
}

// Symmetric encryption/decryption
function encrypt(text, key) {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encrypted,
    iv: iv.toString('hex')
  };
}

function decrypt(encryptedData, key) {
  const algorithm = 'aes-256-gcm';
  const decipher = crypto.createDecipher(algorithm, key);

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Usage examples
console.log('Token:', generateSecureToken());
console.log('Hash:', hashData('Hello World'));

const passwordResult = hashPassword('mypassword');
console.log('Password hash:', passwordResult);

const encrypted = encrypt('sensitive data', 'mySecretKey');
console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypt(encrypted, 'mySecretKey'));

import crypto from 'node:crypto';

// Example certificate structure:
// {
//   entity: 'example.com',
//   publicKey: '...',
//   issuer: 'MyCA',
//   validFrom: '2024-01-01',
//   validTo: '2025-01-01',
//   signature: '...'
// }

class Certificate {
  entity: string;
  publicKey: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  signature?: string;

  constructor(entityName: string, publicKeyPem: string, validityDays = 365) {
    this.entity = entityName;
    this.publicKey = publicKeyPem
      .replace('-----BEGIN PUBLIC KEY-----\n', '')
      .replace('\n-----END PUBLIC KEY-----\n', '');
    this.issuer = 'MyCA';
    const today = new Date();
    this.validFrom = today.toISOString().split('T')[0]!;
    this.validTo = new Date(today.setDate(today.getDate() + validityDays))
      .toISOString()
      .split('T')[0]!;
  }
}

export class SimpleCA {
  caKeys: crypto.KeyPairExportResult<any>;
  revokeList: Set<string> = new Set();

  constructor() {
    // CA's own key pair
    this.caKeys = crypto.generateKeyPairSync('ec', {
      namedCurve: 'prime256v1', // or 'secp256k1' or 'P-256'
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });
  }

  issueCertificate(
    entityName: string,
    publicKeyPem: string,
    validityDays = 365
  ): Certificate {
    // TODO: Create certificate data structure
    const certificate: Certificate = {
      entity: entityName,
      publicKey: publicKeyPem
        .replace('-----BEGIN PUBLIC KEY-----\n', '')
        .replace('\n-----END PUBLIC KEY-----\n', ''),
      issuer: 'MyCA',
      validFrom: '2024-01-01',
      validTo: '2025-01-01',
      signature: '...'
    };

    // TODO: Include: entity, publicKey, issuer (CA), validFrom, validTo
    const today = new Date();
    certificate['validFrom'] = today.toISOString().split('T')[0]!;
    certificate['validTo'] = new Date(
      today.setDate(today.getDate() + validityDays)
    )
      .toISOString()
      .split('T')[0]!;

    // TODO: Sign with CA's private key
    const sign = crypto.createSign('SHA256');
    sign.update(entityName);
    certificate['signature'] = sign.sign(
      this.caKeys.privateKey as crypto.KeyLike,
      'base64'
    );

    // TODO: Return certificate (data + signature)
    return certificate;
  }

  verifyCertificate(certificate: Certificate) {
    // TODO: Check validity dates
    const timeFrom = new Date(certificate.validFrom).getTime();
    const timeTo = new Date(certificate.validTo).getTime();
    const today = new Date().getTime();
    const isValidDate = today >= timeFrom && today < timeTo;
    if (!isValidDate) {
      throw new Error('Invalid dates');
    }

    // TODO: Verify signature using CA's public key
    const verifier = crypto.createVerify('sha256');
    verifier.update(certificate.entity);
    verifier.end();
    const isValidSignature =
      certificate.signature &&
      verifier.verify(
        this.caKeys.publicKey as crypto.KeyLike,
        certificate.signature,
        'base64'
      );
    if (!isValidSignature) {
      throw new Error('Invalid signature');
    }

    // TODO: Check if certificate is revoked (bonus)
    if (this.revokeList.has(certificate['entity'])) {
      throw new Error('Certificate has been revoked');
    }

    console.log('Certificate verified');
  }

  revokeCertificate(certificateId: Certificate['entity']) {
    // TODO: Maintain CRL (Certificate Revocation List)
    this.revokeList.add(certificateId);
    console.log('Certificate has been revoked');
  }
}

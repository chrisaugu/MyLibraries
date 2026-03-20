import { expect, test } from 'bun:test';
import { SimpleCA } from '../SimpleCA';

test('issue, verify, revoke', () => {
  const simpleCA = new SimpleCA();
  const certificate = simpleCA.issueCertificate(
    'Fantastix',
    simpleCA.caKeys.publicKey.toString()
  );

  expect(() => simpleCA.verifyCertificate(certificate)).not.toThrow();
  simpleCA.revokeCertificate('Fantastix');
  expect(() => simpleCA.verifyCertificate(certificate)).toThrow();
});

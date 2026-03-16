import { DiffieHellman, createDiffieHellman } from 'node:crypto';
import { Buffer } from 'node:buffer';

interface InitKey {
  key: string;
  prime: string;
  generator: string;
}

/**
 *
 */
export class KeyGenerator {
  private PRIME_LENGTH = 512;
  private initiator!: DiffieHellman;
  private recipient!: DiffieHellman;

  initiatorKey(): InitKey {
    const first = createDiffieHellman(this.PRIME_LENGTH);
    this.initiator = first;

    const key = first.generateKeys('base64');
    const prime = first.getPrime('base64');
    const generator = first.getGenerator('base64');

    return {
      key,
      prime,
      generator
    };
  }

  recipientKey(prime: string, generator: string): string {
    const second = createDiffieHellman(
      Buffer.from(prime, 'base64'),
      Buffer.from(generator, 'base64')
    );
    this.recipient = second;
    return second.generateKeys('base64');
  }

  initiatorSecret(recipientKey: string): string {
    const secret = this.initiator.computeSecret(
      recipientKey,
      'base64',
      'base64'
    );
    return secret;
  }

  recipientSecret(initiatorKey: string): string {
    const secret = this.recipient.computeSecret(
      initiatorKey,
      'base64',
      'base64'
    );
    return secret;
  }
}

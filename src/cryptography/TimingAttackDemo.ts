// WARNING: This is for educational purposes only!
// DO NOT use insecure comparisons in production

import type { WithImplicitCoercion } from 'node:buffer';

class TimingAttackDemo {
  // INSECURE - Don't use this!
  static insecureCompare(a: string | any[], b: string | any[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  // SECURE - Always use this
  static secureCompare(
    a: WithImplicitCoercion<string>,
    b: WithImplicitCoercion<string>
  ) {
    try {
      return crypto.timingSafeEqual(
        Buffer.from(a, 'utf8'),
        Buffer.from(b, 'utf8')
      );
    } catch (err) {
      // Handle different lengths gracefully
      return false;
    }
  }

  static async measureComparisonTime(
    compareFn: { (a: any, b: any): boolean; (arg0: any, arg1: any): void },
    a: string,
    b: string
  ) {
    const start = process.hrtime.bigint();
    compareFn(a, b);
    const end = process.hrtime.bigint();
    return Number(end - start) / 1000000; // Convert to milliseconds
  }

  static async demonstrateAttack() {
    const secret = 'MySecretPassword123';
    const attempts = ['A', 'My', 'MyS', 'MySe', 'MySec'];

    console.log('Timing differences with insecure compare:');
    for (const attempt of attempts) {
      const time = await this.measureComparisonTime(
        // this.insecureCompare,
        this.secureCompare,
        secret,
        attempt
      );
      console.log(`Attempt "${attempt}": ${time.toFixed(3)}ms`);
    }

    // Observe how longer matches take more time!
  }
}

await TimingAttackDemo.demonstrateAttack();

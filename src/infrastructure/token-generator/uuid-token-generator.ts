import { randomUUID } from 'node:crypto';
import type { TokenGenerator } from '@application/contracts/token-generator.interface';

export class UuidTokenGenerator implements TokenGenerator {
  public generate(): string {
    return randomUUID();
  }
}

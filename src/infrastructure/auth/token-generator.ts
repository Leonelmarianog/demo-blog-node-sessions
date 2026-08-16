import { randomUUID } from 'node:crypto';
import type { TokenGenerator } from '@application/common/contracts/token-generator.port';

export class UuidTokenGenerator implements TokenGenerator {
  public generate(): string {
    return randomUUID();
  }
}

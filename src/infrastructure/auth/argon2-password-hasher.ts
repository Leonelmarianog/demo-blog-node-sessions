import { hash, verify, Algorithm } from '@node-rs/argon2';
import type { PasswordHasher } from '@application/common/contracts/password-hasher.interface';

export class Argon2PasswordHasher implements PasswordHasher {
  private readonly options = {
    algorithm: Algorithm.Argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
    outputLen: 32,
  };

  public async hash(plain: string): Promise<string> {
    return hash(plain, this.options);
  }

  public async verify(plain: string, hashed: string): Promise<boolean> {
    return verify(hashed, plain);
  }
}

export abstract class PasswordHasher {
  /** Returns a one-way hash of the given plain password. */
  abstract hash(plain: string): Promise<string>;

  /** Returns whether the plain password matches the hash. */
  abstract verify(plain: string, hash: string): Promise<boolean>;
}

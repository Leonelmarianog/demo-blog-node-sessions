export abstract class Hasher {
  /** Returns a one-way hash of the given plain value. */
  abstract hash(plain: string): Promise<string>;

  /** Returns whether the plain value matches the hash. */
  abstract verify(plain: string, hash: string): Promise<boolean>;
}

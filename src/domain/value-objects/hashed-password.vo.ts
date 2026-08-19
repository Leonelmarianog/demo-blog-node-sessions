export class HashedPassword {
  private constructor(private readonly _value: string) {}

  /** Builds a HashedPassword from an existing hash. */
  public static fromHash(hash: string): HashedPassword {
    return new HashedPassword(hash);
  }

  public get value(): string {
    return this._value;
  }
}

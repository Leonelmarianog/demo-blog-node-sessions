export class VerificationToken {
  private constructor(
    private readonly _token: string,
    private readonly _userId: string,
    private readonly _expiresAt: Date,
  ) {}

  public static create(
    token: string,
    userId: string,
    ttlSeconds: number,
  ): VerificationToken {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    return new VerificationToken(token, userId, expiresAt);
  }

  public static from(
    token: string,
    userId: string,
    expiresAt: Date,
  ): VerificationToken {
    return new VerificationToken(token, userId, expiresAt);
  }

  public get token(): string {
    return this._token;
  }

  public get userId(): string {
    return this._userId;
  }

  public get expiresAt(): Date {
    return this._expiresAt;
  }

  public isExpired(): boolean {
    return this._expiresAt.getTime() <= Date.now();
  }

  public isValid(): boolean {
    return !this.isExpired();
  }
}

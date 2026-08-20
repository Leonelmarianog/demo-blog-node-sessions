export class PasswordResetToken {
  private constructor(
    private readonly _token: string,
    private readonly _userId: string,
    private readonly _expiresAt: Date,
  ) {}

  /** Builds a new password reset token that expires after the given time to live. */
  public static create(
    token: string,
    userId: string,
    ttlSeconds: number,
  ): PasswordResetToken {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    return new PasswordResetToken(token, userId, expiresAt);
  }

  /** Rebuilds a password reset token from stored data. */
  public static from(
    token: string,
    userId: string,
    expiresAt: Date,
  ): PasswordResetToken {
    return new PasswordResetToken(token, userId, expiresAt);
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

  /** Returns whether the token is past its expiry time. */
  public isExpired(): boolean {
    return this._expiresAt.getTime() <= Date.now();
  }

  /** Returns whether the token is still valid (not expired). */
  public isValid(): boolean {
    return !this.isExpired();
  }
}

import type { User } from '@domain/entities/user.entity';

export class RememberMeSession {
  private constructor(
    private readonly _user: User,
    private readonly _expiresAt: Date,
  ) {}

  public static of(user: User, expiresAt: Date): RememberMeSession {
    return new RememberMeSession(user, expiresAt);
  }

  public get user(): User {
    return this._user;
  }

  public get expiresAt(): Date {
    return this._expiresAt;
  }

  /** Returns whether the session is past its expiry time. */
  public isExpired(): boolean {
    return this._expiresAt.getTime() <= Date.now();
  }
}

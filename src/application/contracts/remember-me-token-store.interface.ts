import type { RememberMeSession } from '@application/entities/remember-me-session.entity';

export abstract class RememberMeTokenStore {
  /** Stores the hash of the raw token for the user with the given expiry. */
  abstract save(
    rawToken: string,
    userId: string,
    expiresAt: Date,
  ): Promise<void>;

  /** Returns the session for the raw token, or null if no row matches. */
  abstract find(rawToken: string): Promise<RememberMeSession | null>;

  /** Deletes the row whose hash matches the raw token. */
  abstract revoke(rawToken: string): Promise<void>;

  /** Deletes every row for the user. */
  abstract revokeByUserId(userId: string): Promise<void>;

  /**
   * Deletes the old row and inserts the new row. Runs inside the caller's
   * unit of work so both writes share one transaction.
   */
  abstract rotate(
    oldRawToken: string,
    newRawToken: string,
    userId: string,
    newExpiresAt: Date,
  ): Promise<void>;
}

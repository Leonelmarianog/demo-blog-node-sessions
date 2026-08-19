import type { VerificationToken } from '@application/entities/verification-token.entity';

export abstract class VerifyEmailRepository {
  /** Loads the verification token for the given token string, or null if it does not exist. */
  abstract findByToken(token: string): Promise<VerificationToken | null>;

  /**
   * Marks the user as verified and active, and deletes the token.
   * Runs inside the caller's unit of work so the writes share one transaction.
   */
  abstract applyVerification(token: string, userId: string): Promise<void>;
}

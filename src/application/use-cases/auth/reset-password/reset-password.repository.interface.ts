import type { PasswordResetToken } from '@application/entities/password-reset-token.entity';
import type { HashedPassword } from '@domain/value-objects/hashed-password.vo';

export abstract class ResetPasswordRepository {
  /** Loads the password reset token for the given token string, or null if it does not exist. */
  abstract findByToken(token: string): Promise<PasswordResetToken | null>;

  /**
   * Updates the user's password hash and deletes the token.
   * Runs inside the caller's unit of work so the writes share one transaction.
   */
  abstract applyReset(
    token: string,
    userId: string,
    newPasswordHash: HashedPassword,
  ): Promise<void>;
}

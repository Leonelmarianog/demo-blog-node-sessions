import type { User } from '@domain/entities/user.entity';
import type { PasswordResetToken } from '@application/entities/password-reset-token.entity';

export abstract class RequestPasswordResetRepository {
  /** Loads the user for the given email, or null if no user has that email. */
  abstract findByEmail(email: string): Promise<User | null>;

  /** Deletes every password reset token that belongs to the given user. */
  abstract deleteByUserId(userId: string): Promise<void>;

  /** Saves the password reset token. */
  abstract save(token: PasswordResetToken): Promise<void>;
}

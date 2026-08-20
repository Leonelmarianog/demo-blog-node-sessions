import type { User } from '@domain/entities/user.entity';
import type { PasswordResetToken } from '@application/entities/password-reset-token.entity';

export abstract class RequestPasswordResetRepository {
  /** Loads the user for the given email, or null if no user has that email. */
  abstract findByEmail(email: string): Promise<User | null>;

  /** Saves the password reset token. */
  abstract save(token: PasswordResetToken): Promise<void>;
}

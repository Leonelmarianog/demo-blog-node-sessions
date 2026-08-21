import type { User } from '@domain/entities/user.entity';
import type { VerificationToken } from '@application/entities/verification-token.entity';

export abstract class ResendVerificationEmailRepository {
  /** Loads the user for the given email, or null if no user has that email. */
  abstract findByEmail(email: string): Promise<User | null>;

  /** Deletes every verification token that belongs to the given user. */
  abstract deleteByUserId(userId: string): Promise<void>;

  /** Saves the verification token. */
  abstract save(token: VerificationToken): Promise<void>;
}

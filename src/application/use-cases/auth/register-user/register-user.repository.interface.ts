import type { User } from '@domain/entities/user.entity';
import type { VerificationToken } from '@domain/auth/verification-token';

export abstract class RegisterUserRepository {
  /** Returns whether a user with the given email already exists. */
  abstract existsByEmail(email: string): Promise<boolean>;

  /** Returns whether a user with the given username already exists. */
  abstract existsByUsername(username: string): Promise<boolean>;

  /** Saves the user and the verification token. */
  abstract save(user: User, token: VerificationToken): Promise<void>;
}

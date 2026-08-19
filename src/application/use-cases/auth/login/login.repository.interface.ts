import type { User } from '@domain/entities/user.entity';

export abstract class LoginUserRepository {
  /** Loads the user for the given email, or null if no user has that email. */
  abstract findByEmail(email: string): Promise<User | null>;

  /**
   * Persists a change to the user's account state and updated time.
   * Runs inside the caller's unit of work so the write shares one transaction.
   */
  abstract updateAccountState(user: User): Promise<void>;
}

import type { User } from '@domain/entities/user.entity';
import type { VerificationToken } from '@domain/auth/verification-token';
import type { TransactionContext } from '@application/contracts/unit-of-work.interface';

export abstract class RegisterUserRepository {
  abstract existsByEmail(
    email: string,
    tx?: TransactionContext,
  ): Promise<boolean>;
  abstract existsByUsername(
    username: string,
    tx?: TransactionContext,
  ): Promise<boolean>;
  abstract save(
    user: User,
    token: VerificationToken,
    tx?: TransactionContext,
  ): Promise<void>;
}

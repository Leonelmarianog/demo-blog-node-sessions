import type { User } from '@domain/entities/user.entity';
import type { VerificationToken } from '@domain/auth/verification-token';
import type { TransactionContext } from '@application/common/contracts/unit-of-work.port';

export const REGISTER_USER_REPOSITORY = 'REGISTER_USER_REPOSITORY';

export interface RegisterUserRepository {
  existsByEmail(email: string, tx?: TransactionContext): Promise<boolean>;
  existsByUsername(username: string, tx?: TransactionContext): Promise<boolean>;
  save(
    user: User,
    token: VerificationToken,
    tx?: TransactionContext,
  ): Promise<void>;
}

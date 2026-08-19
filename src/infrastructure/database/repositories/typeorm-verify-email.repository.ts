import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import { VerificationToken } from '@application/entities/verification-token.entity';
import type { VerifyEmailRepository } from '@application/use-cases/auth/verify-email/verify-email.repository.interface';
import { User } from '@domain/entities/user.entity';
import { UserEntity } from '@infrastructure/database/entities/user.entity';
import { VerificationTokenEntity } from '@infrastructure/database/entities/verification-token.entity';
import { getCurrentManager } from '@infrastructure/database/transactions/transaction-context.storage';

@Injectable()
export class TypeOrmVerifyEmailRepository implements VerifyEmailRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  public async findByToken(token: string): Promise<VerificationToken | null> {
    const row = await this.repositoryFor(VerificationTokenEntity).findOneBy({
      token,
    });

    if (!row) {
      return null;
    }

    return VerificationToken.from(row.token, row.userId, row.expiresAt);
  }

  public async applyVerification(token: string, userId: string): Promise<void> {
    const userRepo = this.repositoryFor(UserEntity);
    const tokenRepo = this.repositoryFor(VerificationTokenEntity);

    const row = await userRepo.findOneByOrFail({ id: userId });
    const user = User.reconstitute(
      row.id,
      row.email,
      row.username,
      row.passwordHash,
      row.accountState,
      row.emailVerifiedAt,
      row.createdAt,
      row.updatedAt,
    );
    user.markEmailAsVerified();

    await userRepo.update(
      { id: user.id },
      {
        accountState: user.accountState.value,
        emailVerifiedAt: user.emailVerifiedAt,
        updatedAt: user.updatedAt,
      },
    );
    await tokenRepo.delete({ token });
  }

  /**
   * Returns the repository for the given entity.
   *
   * During a unit of work it uses the open transaction. Outside a unit of
   * work it uses the default database connection.
   */
  private repositoryFor<T extends ObjectLiteral>(
    target: new () => T,
  ): Repository<T> {
    const manager = getCurrentManager(this.dataSource.manager);
    return manager.getRepository(target);
  }
}

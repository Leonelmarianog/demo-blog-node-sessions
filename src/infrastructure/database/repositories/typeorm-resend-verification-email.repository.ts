import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import { User } from '@domain/entities/user.entity';
import type { ResendVerificationEmailRepository } from '@application/use-cases/auth/resend-verification-email/resend-verification-email.repository.interface';
import type { VerificationToken } from '@application/entities/verification-token.entity';
import { UserEntity } from '@infrastructure/database/entities/user.entity';
import { VerificationTokenEntity } from '@infrastructure/database/entities/verification-token.entity';
import { getCurrentManager } from '@infrastructure/database/transactions/transaction-context.storage';

@Injectable()
export class TypeOrmResendVerificationEmailRepository implements ResendVerificationEmailRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  public async findByEmail(email: string): Promise<User | null> {
    const row = await this.repositoryFor(UserEntity).findOneBy({ email });

    if (!row) {
      return null;
    }

    return User.reconstitute(
      row.id,
      row.email,
      row.username,
      row.passwordHash,
      row.accountState,
      row.emailVerifiedAt,
      row.createdAt,
      row.updatedAt,
    );
  }

  public async save(token: VerificationToken): Promise<void> {
    await this.repositoryFor(VerificationTokenEntity).save({
      token: token.token,
      userId: token.userId,
      expiresAt: token.expiresAt,
    });
  }

  public async deleteByUserId(userId: string): Promise<void> {
    await this.repositoryFor(VerificationTokenEntity).delete({ userId });
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

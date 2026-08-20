import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import type { ResetPasswordRepository } from '@application/use-cases/auth/reset-password/reset-password.repository.interface';
import { PasswordResetToken } from '@application/entities/password-reset-token.entity';
import type { HashedPassword } from '@domain/value-objects/hashed-password.vo';
import { User } from '@domain/entities/user.entity';
import { UserEntity } from '@infrastructure/database/entities/user.entity';
import { PasswordResetTokenEntity } from '@infrastructure/database/entities/password-reset-token.entity';
import { getCurrentManager } from '@infrastructure/database/transactions/transaction-context.storage';

@Injectable()
export class TypeOrmResetPasswordRepository implements ResetPasswordRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  public async findByToken(token: string): Promise<PasswordResetToken | null> {
    const row = await this.repositoryFor(PasswordResetTokenEntity).findOneBy({
      token,
    });

    if (!row) {
      return null;
    }

    return PasswordResetToken.from(row.token, row.userId, row.expiresAt);
  }

  public async applyReset(
    token: string,
    userId: string,
    newPasswordHash: HashedPassword,
  ): Promise<void> {
    const userRepo = this.repositoryFor(UserEntity);
    const tokenRepo = this.repositoryFor(PasswordResetTokenEntity);

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
    user.changePassword(newPasswordHash);

    await userRepo.update(
      { id: user.id },
      {
        passwordHash: user.passwordHash,
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

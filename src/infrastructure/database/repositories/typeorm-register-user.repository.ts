import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import type { User } from '@domain/entities/user.entity';
import type { VerificationToken } from '@domain/auth/verification-token';
import type { RegisterUserRepository } from '@application/use-cases/auth/register-user/register-user.repository.interface';
import { UserEntity } from '@infrastructure/database/entities/user.entity';
import { VerificationTokenEntity } from '@infrastructure/database/entities/verification-token.entity';
import { getCurrentManager } from '@infrastructure/database/transactions/transaction-context.storage';

@Injectable()
export class TypeOrmRegisterUserRepository implements RegisterUserRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  public async existsByEmail(email: string): Promise<boolean> {
    const repo = this.repositoryFor(UserEntity);
    return (await repo.countBy({ email })) > 0;
  }

  public async existsByUsername(username: string): Promise<boolean> {
    const repo = this.repositoryFor(UserEntity);
    return (await repo.countBy({ username })) > 0;
  }

  public async save(user: User, token: VerificationToken): Promise<void> {
    const userRepo = this.repositoryFor(UserEntity);
    const tokenRepo = this.repositoryFor(VerificationTokenEntity);

    await userRepo.save({
      id: user.id,
      email: user.email,
      username: user.username,
      passwordHash: user.passwordHash,
      accountState: user.accountState.value,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    await tokenRepo.save({
      token: token.token,
      userId: token.userId,
      expiresAt: token.expiresAt,
    });
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

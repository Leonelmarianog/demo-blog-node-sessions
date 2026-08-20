import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import { User } from '@domain/entities/user.entity';
import type { LoginUserRepository } from '@application/use-cases/auth/login/login.repository.interface';
import { UserEntity } from '@infrastructure/database/entities/user.entity';
import { getCurrentManager } from '@infrastructure/database/transactions/transaction-context.storage';

@Injectable()
export class TypeOrmLoginUserRepository implements LoginUserRepository {
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

  public async updateAccountState(user: User): Promise<void> {
    await this.repositoryFor(UserEntity).update(
      { id: user.id },
      {
        accountState: user.accountState.value,
        updatedAt: user.updatedAt,
      },
    );
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

import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import { User } from '@domain/entities/user.entity';
import type { RememberMeTokenStore } from '@application/contracts/remember-me-token-store.interface';
import { RememberMeSession } from '@application/entities/remember-me-session.entity';
import { UserEntity } from '@infrastructure/database/entities/user.entity';
import { RememberMeTokenEntity } from '@infrastructure/database/entities/remember-me-token.entity';
import { getCurrentManager } from '@infrastructure/database/transactions/transaction-context.storage';

@Injectable()
export class TypeOrmRememberMeTokenStore implements RememberMeTokenStore {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  public async save(
    rawToken: string,
    userId: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.repositoryFor(RememberMeTokenEntity).save({
      tokenHash: this.hash(rawToken),
      userId,
      expiresAt,
    });
  }

  public async find(rawToken: string): Promise<RememberMeSession | null> {
    const row = await this.repositoryFor(RememberMeTokenEntity).findOneBy({
      tokenHash: this.hash(rawToken),
    });

    if (!row) {
      return null;
    }

    const userRow = await this.repositoryFor(UserEntity).findOneBy({
      id: row.userId,
    });

    if (!userRow) {
      return null;
    }

    const user = User.reconstitute(
      userRow.id,
      userRow.email,
      userRow.username,
      userRow.passwordHash,
      userRow.accountState,
      userRow.emailVerifiedAt,
      userRow.createdAt,
      userRow.updatedAt,
    );

    return RememberMeSession.of(user, row.expiresAt);
  }

  public async revoke(rawToken: string): Promise<void> {
    await this.repositoryFor(RememberMeTokenEntity).delete({
      tokenHash: this.hash(rawToken),
    });
  }

  public async revokeByUserId(userId: string): Promise<void> {
    await this.repositoryFor(RememberMeTokenEntity).delete({ userId });
  }

  public async rotate(
    oldRawToken: string,
    newRawToken: string,
    userId: string,
    newExpiresAt: Date,
  ): Promise<void> {
    const repo = this.repositoryFor(RememberMeTokenEntity);
    await repo.delete({ tokenHash: this.hash(oldRawToken) });
    await repo.save({
      tokenHash: this.hash(newRawToken),
      userId,
      expiresAt: newExpiresAt,
    });
  }

  private hash(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
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

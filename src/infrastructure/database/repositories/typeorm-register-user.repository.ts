import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { EntityManager, ObjectLiteral, Repository } from 'typeorm';
import type { TransactionContext } from '@application/contracts/unit-of-work.interface';
import type { User } from '@domain/entities/user.entity';
import type { VerificationToken } from '@domain/auth/verification-token';
import type { RegisterUserRepository } from '@application/use-cases/auth/register-user/register-user.repository.interface';
import { UserEntity } from '@infrastructure/database/entities/user.entity';
import { VerificationTokenEntity } from '@infrastructure/database/entities/verification-token.entity';

@Injectable()
export class TypeOrmRegisterUserRepository implements RegisterUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(VerificationTokenEntity)
    private readonly tokens: Repository<VerificationTokenEntity>,
  ) {}

  public async existsByEmail(
    email: string,
    tx?: TransactionContext,
  ): Promise<boolean> {
    const repo = this.repositoryFor(tx, UserEntity);
    return (await repo.countBy({ email })) > 0;
  }

  public async existsByUsername(
    username: string,
    tx?: TransactionContext,
  ): Promise<boolean> {
    const repo = this.repositoryFor(tx, UserEntity);
    return (await repo.countBy({ username })) > 0;
  }

  public async save(
    user: User,
    token: VerificationToken,
    tx?: TransactionContext,
  ): Promise<void> {
    const userRepo = this.repositoryFor(tx, UserEntity);
    const tokenRepo = this.repositoryFor(tx, VerificationTokenEntity);
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

  private repositoryFor<T extends ObjectLiteral>(
    tx: TransactionContext | undefined,
    target: new () => T,
  ): Repository<T> {
    if (tx) {
      return (tx as unknown as EntityManager).getRepository(target);
    }

    if (target === (UserEntity as unknown as new () => T)) {
      return this.users as unknown as Repository<T>;
    }

    return this.tokens as unknown as Repository<T>;
  }
}

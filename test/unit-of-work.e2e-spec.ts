import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { AppModule } from './../src/app.module';
import { resetDatabase } from './utils/db';
import { UnitOfWork } from '@application/contracts/unit-of-work.interface';
import { RegisterUserRepository } from '@application/use-cases/auth/register-user/register-user.repository.interface';
import { Email } from '@domain/value-objects/email.vo';
import { Username } from '@domain/value-objects/username.vo';
import { HashedPassword } from '@domain/value-objects/hashed-password.vo';
import { User } from '@domain/entities/user.entity';
import { VerificationToken } from '@domain/auth/verification-token';

describe('Unit of Work (e2e)', () => {
  let app: INestApplication;
  let unitOfWork: UnitOfWork;
  let users: RegisterUserRepository;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    unitOfWork = app.get(UnitOfWork);
    users = app.get(RegisterUserRepository);
    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    await app.close();
    await resetDatabase();
  });

  async function userCount(): Promise<number> {
    const rows = await dataSource.query<Array<{ count: number }>>(
      'SELECT COUNT(*)::int AS count FROM users',
    );
    return rows[0].count;
  }

  async function tokenCount(): Promise<number> {
    const rows = await dataSource.query<Array<{ count: number }>>(
      'SELECT COUNT(*)::int AS count FROM verification_tokens',
    );
    return rows[0].count;
  }

  it('commits every write when the work succeeds', async () => {
    const user = User.create(
      Email.create('alice@example.com'),
      Username.create('alice'),
      HashedPassword.fromHash('hashed'),
    );
    const token = VerificationToken.create(randomUUID(), user.id, 3600);

    await unitOfWork.execute(async () => {
      await users.save(user, token);
    });

    expect(await userCount()).toBe(1);
    expect(await tokenCount()).toBe(1);
  });

  // This also proves the repository writes through the transaction manager,
  // not the default connection: a default-connection write would autocommit
  // and survive the throw, leaving a row behind.
  it('rolls back every write when the work throws', async () => {
    const user = User.create(
      Email.create('bob@example.com'),
      Username.create('bob'),
      HashedPassword.fromHash('hashed'),
    );
    const token = VerificationToken.create(randomUUID(), user.id, 3600);

    await expect(
      unitOfWork.execute(async () => {
        await users.save(user, token);
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    expect(await userCount()).toBe(0);
    expect(await tokenCount()).toBe(0);
  });
});

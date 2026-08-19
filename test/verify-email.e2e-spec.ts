import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'node:http';
import { DataSource } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';
import { resetDatabase } from './utils/db';
import { UnitOfWork } from '@application/contracts/unit-of-work.interface';
import { UrlSigner } from '@application/contracts/url-signer.interface';
import { RegisterUserRepository } from '@application/use-cases/auth/register-user/register-user.repository.interface';
import { Email } from '@domain/value-objects/email.vo';
import { Username } from '@domain/value-objects/username.vo';
import { HashedPassword } from '@domain/value-objects/hashed-password.vo';
import { User } from '@domain/entities/user.entity';
import { VerificationToken } from '@application/entities/verification-token.entity';

describe('Verify email (e2e)', () => {
  let app: INestApplication;
  let unitOfWork: UnitOfWork;
  let urlSigner: UrlSigner;
  let users: RegisterUserRepository;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await setupApp(app);
    await app.init();

    unitOfWork = app.get(UnitOfWork);
    urlSigner = app.get(UrlSigner);
    users = app.get(RegisterUserRepository);
    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    await app.close();
    await resetDatabase();
  });

  async function seedAccount(expiresAt: Date): Promise<VerificationToken> {
    const user = User.create(
      Email.create('morgan@example.com'),
      Username.create('morgan'),
      HashedPassword.fromHash('hashed'),
    );
    const token = VerificationToken.from(randomUUID(), user.id, expiresAt);

    await unitOfWork.execute(async () => {
      await users.save(user, token);
    });

    return token;
  }

  async function tokenCount(): Promise<number> {
    const rows = await dataSource.query<Array<{ count: number }>>(
      'SELECT COUNT(*)::int AS count FROM verification_tokens',
    );
    return rows[0].count;
  }

  async function userRow(): Promise<{
    account_state: string;
    email_verified_at: Date | null;
  }> {
    const rows = await dataSource.query<
      Array<{ account_state: string; email_verified_at: Date | null }>
    >('SELECT account_state, email_verified_at FROM users LIMIT 1');
    return rows[0];
  }

  it('activates the account and redirects to the login page', async () => {
    const token = await seedAccount(new Date(Date.now() + 60 * 60 * 1000));
    const signedPath = urlSigner.sign(
      `/verify-email?token=${token.token}`,
      3600,
    );

    const agent = request.agent(app.getHttpServer() as Server);
    await agent.get(signedPath).expect(302).expect('Location', '/login');

    const follow = await agent.get('/login').expect(200);
    expect(follow.text).toMatch(/Your email is verified/);

    const row = await userRow();
    expect(row.account_state).toBe('active');
    expect(row.email_verified_at).not.toBeNull();
    expect(await tokenCount()).toBe(0);
  });

  it('rejects a link with no signature as invalid', async () => {
    const res = await request(app.getHttpServer() as Server)
      .get('/verify-email')
      .expect(200);
    expect(res.text).toMatch(/invalid/);
  });

  it('rejects a tampered link as invalid', async () => {
    const token = await seedAccount(new Date(Date.now() + 60 * 60 * 1000));
    const signedPath = urlSigner.sign(
      `/verify-email?token=${token.token}`,
      3600,
    );
    const tampered = signedPath.replace(
      `token=${token.token}`,
      `token=${randomUUID()}`,
    );

    const res = await request(app.getHttpServer() as Server)
      .get(tampered)
      .expect(200);
    expect(res.text).toMatch(/invalid/);
  });

  it('rejects an expired stored token', async () => {
    const token = await seedAccount(new Date(Date.now() - 1000));
    const signedPath = urlSigner.sign(
      `/verify-email?token=${token.token}`,
      3600,
    );

    const res = await request(app.getHttpServer() as Server)
      .get(signedPath)
      .expect(200);
    expect(res.text).toMatch(/expired/);
    expect(await tokenCount()).toBe(1);
  });
});

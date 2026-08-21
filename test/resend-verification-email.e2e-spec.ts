import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'node:http';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';
import { resetDatabase } from './utils/db';
import { RegisterUserUseCase } from '@application/use-cases/auth/register-user/register-user.use-case';
import { RegisterUserDto } from '@application/use-cases/auth/register-user/register-user.dto';

describe('Resend verification email (e2e)', () => {
  let app: INestApplication;
  let registerUser: RegisterUserUseCase;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await setupApp(app);
    await app.init();

    registerUser = app.get(RegisterUserUseCase);
    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    await app.close();
    await resetDatabase();
  });

  async function seedUnverifiedUser(email: string): Promise<string> {
    await registerUser.execute(
      new RegisterUserDto(email, 'morgan', 'Password1', 'Password1'),
    );
    const rows = await dataSource.query<Array<{ id: string }>>(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );
    return rows[0].id;
  }

  async function seedVerifiedUser(email: string): Promise<void> {
    await seedUnverifiedUser(email);
    await dataSource.query(
      'UPDATE users SET account_state = $1, email_verified_at = $2 WHERE email = $3',
      ['active', new Date(), email],
    );
  }

  async function verificationTokenCountFor(email: string): Promise<number> {
    const rows = await dataSource.query<Array<{ count: number }>>(
      'SELECT COUNT(*)::int AS count FROM verification_tokens t JOIN users u ON u.id = t.user_id WHERE u.email = $1',
      [email],
    );
    return rows[0].count;
  }

  async function currentTokenFor(email: string): Promise<string | null> {
    const rows = await dataSource.query<Array<{ token: string }>>(
      'SELECT t.token FROM verification_tokens t JOIN users u ON u.id = t.user_id WHERE u.email = $1',
      [email],
    );
    return rows.length > 0 ? rows[0].token : null;
  }

  it('renders the resend form on GET /verify-email/resend', async () => {
    const res = await request(app.getHttpServer() as Server)
      .get('/verify-email/resend')
      .expect(200);

    expect(res.text).toMatch(/resend|verify/i);
    expect(res.text).toMatch(/email/i);
  });

  it('replaces the verification token and redirects to the sent page for an unverified user', async () => {
    const email = 'morgan@example.com';
    await seedUnverifiedUser(email);
    const originalToken = await currentTokenFor(email);

    const res = await request(app.getHttpServer() as Server)
      .post('/verify-email/resend')
      .send({ email })
      .expect(302)
      .expect('Location', '/verify-email/sent');

    expect(res.text).not.toMatch(/morgan@example.com/);
    expect(await verificationTokenCountFor(email)).toBe(1);
    expect(await currentTokenFor(email)).not.toBe(originalToken);
  });

  it('sends nothing for a non-existent email and leaks no account info', async () => {
    const res = await request(app.getHttpServer() as Server)
      .post('/verify-email/resend')
      .send({ email: 'nobody@example.com' })
      .expect(302)
      .expect('Location', '/verify-email/sent');

    expect(res.text).not.toMatch(/nobody@example.com/);
    expect(await verificationTokenCountFor('nobody@example.com')).toBe(0);
  });

  it('sends nothing for an already-verified account and leaves the token unchanged', async () => {
    const email = 'morgan@example.com';
    await seedVerifiedUser(email);
    const staleToken = await currentTokenFor(email);

    await request(app.getHttpServer() as Server)
      .post('/verify-email/resend')
      .send({ email })
      .expect(302)
      .expect('Location', '/verify-email/sent');

    expect(await currentTokenFor(email)).toBe(staleToken);
  });

  it('keeps only one verification token when the resend is requested twice', async () => {
    const email = 'morgan@example.com';
    await seedUnverifiedUser(email);

    await request(app.getHttpServer() as Server)
      .post('/verify-email/resend')
      .send({ email })
      .expect(302);

    await request(app.getHttpServer() as Server)
      .post('/verify-email/resend')
      .send({ email })
      .expect(302);

    expect(await verificationTokenCountFor(email)).toBe(1);
  });

  it('re-renders the form with an email error for a bad email shape', async () => {
    const res = await request(app.getHttpServer() as Server)
      .post('/verify-email/resend')
      .send({ email: 'not-an-email' })
      .expect(200);

    expect(res.text).toMatch(/Email/);
  });
});

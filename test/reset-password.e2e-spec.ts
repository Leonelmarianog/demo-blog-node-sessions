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
import { RequestPasswordResetUseCase } from '@application/use-cases/auth/request-password-reset/request-password-reset.use-case';
import { RequestPasswordResetDto } from '@application/use-cases/auth/request-password-reset/request-password-reset.dto';

describe('Reset password (e2e)', () => {
  let app: INestApplication;
  let registerUser: RegisterUserUseCase;
  let requestPasswordReset: RequestPasswordResetUseCase;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await setupApp(app);
    await app.init();

    registerUser = app.get(RegisterUserUseCase);
    requestPasswordReset = app.get(RequestPasswordResetUseCase);
    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    await app.close();
    await resetDatabase();
  });

  async function seedActiveUser(email: string): Promise<void> {
    await registerUser.execute(
      new RegisterUserDto(email, 'morgan', 'Password1', 'Password1'),
    );
    await dataSource.query(
      "UPDATE users SET account_state = 'active', email_verified_at = NOW() WHERE email = $1",
      [email],
    );
  }

  async function requestResetAndGetLink(email: string): Promise<string> {
    const result = await requestPasswordReset.execute(
      new RequestPasswordResetDto(email),
    );
    return result.resetLink ?? '';
  }

  async function passwordHashFor(email: string): Promise<string> {
    const rows = await dataSource.query<Array<{ password_hash: string }>>(
      'SELECT password_hash FROM users WHERE email = $1',
      [email],
    );
    return rows[0].password_hash;
  }

  async function resetTokenCount(): Promise<number> {
    const rows = await dataSource.query<Array<{ count: number }>>(
      'SELECT COUNT(*)::int AS count FROM password_reset_tokens',
    );
    return rows[0].count;
  }

  it('sets a new password and redirects to the login page', async () => {
    await seedActiveUser('morgan@example.com');
    const link = await requestResetAndGetLink('morgan@example.com');
    expect(link).not.toBe('');

    const oldHash = await passwordHashFor('morgan@example.com');
    const path = link.replace('http://localhost:3000', '');

    const form = await request(app.getHttpServer() as Server)
      .get(path)
      .expect(200);
    expect(form.text).toMatch(/Set a new password/);

    await request(app.getHttpServer() as Server)
      .post(path)
      .send({ password: 'NewPassword1', confirmPassword: 'NewPassword1' })
      .expect(302)
      .expect('Location', '/login');

    expect(await passwordHashFor('morgan@example.com')).not.toBe(oldHash);
    expect(await resetTokenCount()).toBe(0);

    const agent = request.agent(app.getHttpServer() as Server);
    await agent
      .post('/login')
      .send({ email: 'morgan@example.com', password: 'NewPassword1' })
      .expect(302)
      .expect('Location', '/dashboard');
  });

  it('shows the error page for an expired link', async () => {
    await seedActiveUser('morgan@example.com');
    const link = await requestResetAndGetLink('morgan@example.com');
    const expired = link.replace(
      /expires=\d+/,
      `expires=${Math.floor(Date.now() / 1000) - 1}`,
    );

    const res = await request(app.getHttpServer() as Server)
      .get(expired.replace('http://localhost:3000', ''))
      .expect(200);
    expect(res.text).toMatch(/Could not reset your password/);
  });

  it('shows the error page for a tampered signature', async () => {
    await seedActiveUser('morgan@example.com');
    const link = await requestResetAndGetLink('morgan@example.com');
    const tampered = link.replace(/sig=[^&]+/, 'sig=tampered');

    const res = await request(app.getHttpServer() as Server)
      .get(tampered.replace('http://localhost:3000', ''))
      .expect(200);
    expect(res.text).toMatch(/Could not reset your password/);
  });

  it('rejects the first link after a second request supersedes it', async () => {
    await seedActiveUser('morgan@example.com');

    const firstLink = await requestResetAndGetLink('morgan@example.com');
    const secondLink = await requestResetAndGetLink('morgan@example.com');

    const firstPath = firstLink.replace('http://localhost:3000', '');
    const secondPath = secondLink.replace('http://localhost:3000', '');

    await request(app.getHttpServer() as Server)
      .post(firstPath)
      .send({ password: 'NewPassword1', confirmPassword: 'NewPassword1' })
      .expect(200)
      .expect(/Could not reset your password/);

    await request(app.getHttpServer() as Server)
      .post(secondPath)
      .send({ password: 'NewPassword1', confirmPassword: 'NewPassword1' })
      .expect(302)
      .expect('Location', '/login');

    expect(await resetTokenCount()).toBe(0);

    const agent = request.agent(app.getHttpServer() as Server);
    await agent
      .post('/login')
      .send({ email: 'morgan@example.com', password: 'NewPassword1' })
      .expect(302)
      .expect('Location', '/dashboard');
  });

  it('rejects a reused link after the reset is done', async () => {
    await seedActiveUser('morgan@example.com');
    const link = await requestResetAndGetLink('morgan@example.com');
    const path = link.replace('http://localhost:3000', '');

    await request(app.getHttpServer() as Server)
      .post(path)
      .send({ password: 'NewPassword1', confirmPassword: 'NewPassword1' })
      .expect(302)
      .expect('Location', '/login');

    const res = await request(app.getHttpServer() as Server)
      .post(path)
      .send({
        password: 'AnotherPassword1',
        confirmPassword: 'AnotherPassword1',
      })
      .expect(200);
    expect(res.text).toMatch(/Could not reset your password/);
  });

  it('re-renders the form with a password error for a weak password', async () => {
    await seedActiveUser('morgan@example.com');
    const link = await requestResetAndGetLink('morgan@example.com');
    const path = link.replace('http://localhost:3000', '');

    const res = await request(app.getHttpServer() as Server)
      .post(path)
      .send({ password: 'short', confirmPassword: 'short' })
      .expect(200);
    expect(res.text).toMatch(/Set a new password/);
    expect(res.text).toMatch(/Password must be 8 to 128 characters/);
  });

  it('re-renders the form with a confirm error for a mismatch', async () => {
    await seedActiveUser('morgan@example.com');
    const link = await requestResetAndGetLink('morgan@example.com');
    const path = link.replace('http://localhost:3000', '');

    const res = await request(app.getHttpServer() as Server)
      .post(path)
      .send({ password: 'NewPassword1', confirmPassword: 'DifferentPassword1' })
      .expect(200);
    expect(res.text).toMatch(/Set a new password/);
    expect(res.text).toMatch(/Passwords do not match/);
  });
});

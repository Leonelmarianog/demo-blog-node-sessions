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

type AccountState = 'unverified' | 'active' | 'suspended' | 'self-deactivated';

describe('Forgot password (e2e)', () => {
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

  async function seedUser(email: string, state: AccountState): Promise<void> {
    await registerUser.execute(
      new RegisterUserDto(email, 'morgan', 'Password1', 'Password1'),
    );

    if (state === 'unverified') {
      return;
    }

    const verified = state === 'active' || state === 'self-deactivated';
    await dataSource.query(
      'UPDATE users SET account_state = $1, email_verified_at = $2 WHERE email = $3',
      [state, verified ? new Date() : null, email],
    );
  }

  async function resetTokenCountFor(email: string): Promise<number> {
    const rows = await dataSource.query<Array<{ count: number }>>(
      'SELECT COUNT(*)::int AS count FROM password_reset_tokens t JOIN users u ON u.id = t.user_id WHERE u.email = $1',
      [email],
    );
    return rows[0].count;
  }

  it('stores a reset token and redirects to the sent page for an active user', async () => {
    await seedUser('morgan@example.com', 'active');

    const res = await request(app.getHttpServer() as Server)
      .post('/forgot-password')
      .send({ email: 'morgan@example.com' })
      .expect(302)
      .expect('Location', '/forgot-password/sent');

    expect(res.text).not.toMatch(/morgan/);
    expect(await resetTokenCountFor('morgan@example.com')).toBe(1);
  });
});

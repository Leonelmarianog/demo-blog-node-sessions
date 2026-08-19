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

describe('Login (e2e)', () => {
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

  async function accountStateOf(email: string): Promise<string> {
    const rows = await dataSource.query<Array<{ account_state: string }>>(
      'SELECT account_state FROM users WHERE email = $1',
      [email],
    );
    return rows[0].account_state;
  }

  it('signs in an active account and redirects to the dashboard', async () => {
    await seedUser('morgan@example.com', 'active');

    const agent = request.agent(app.getHttpServer() as Server);
    await agent
      .post('/login')
      .send({ email: 'morgan@example.com', password: 'Password1' })
      .expect(302)
      .expect('Location', '/dashboard');

    const dashboard = await agent.get('/dashboard').expect(200);
    expect(dashboard.text).toMatch(/Signed in as morgan/);
  });

  it('rejects a wrong password with a generic credentials error', async () => {
    await seedUser('morgan@example.com', 'active');

    const res = await request(app.getHttpServer() as Server)
      .post('/login')
      .send({ email: 'morgan@example.com', password: 'WrongPass1' })
      .expect(200);
    expect(res.text).toMatch(/Email or password is incorrect/);
  });

  it('rejects an unknown email with the same generic credentials error', async () => {
    const res = await request(app.getHttpServer() as Server)
      .post('/login')
      .send({ email: 'nobody@example.com', password: 'Password1' })
      .expect(200);
    expect(res.text).toMatch(/Email or password is incorrect/);
  });

  it('refuses an unverified account and asks to verify the email', async () => {
    await seedUser('morgan@example.com', 'unverified');

    const res = await request(app.getHttpServer() as Server)
      .post('/login')
      .send({ email: 'morgan@example.com', password: 'Password1' })
      .expect(200);
    expect(res.text).toMatch(/Please verify your email/);
  });

  it('refuses a suspended account with the generic credentials error', async () => {
    await seedUser('morgan@example.com', 'suspended');

    const res = await request(app.getHttpServer() as Server)
      .post('/login')
      .send({ email: 'morgan@example.com', password: 'Password1' })
      .expect(200);
    expect(res.text).toMatch(/Email or password is incorrect/);
  });

  it('re-renders the form with every field error at once', async () => {
    const res = await request(app.getHttpServer() as Server)
      .post('/login')
      .send({ email: '', password: '' })
      .expect(200);
    expect(res.text).toMatch(/Email is required/);
    expect(res.text).toMatch(/Password is required/);
  });

  it('reactivates a self-deactivated account on a successful login', async () => {
    await seedUser('morgan@example.com', 'self-deactivated');
    expect(await accountStateOf('morgan@example.com')).toBe('self-deactivated');

    const agent = request.agent(app.getHttpServer() as Server);
    await agent
      .post('/login')
      .send({ email: 'morgan@example.com', password: 'Password1' })
      .expect(302)
      .expect('Location', '/dashboard');

    expect(await accountStateOf('morgan@example.com')).toBe('active');
  });
});

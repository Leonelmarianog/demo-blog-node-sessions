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

function cookieValue(
  setCookie: string | string[] | undefined,
  name: string,
): string | null {
  if (!setCookie) {
    return null;
  }
  const entries = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const entry of entries) {
    const prefix = `${name}=`;
    if (entry.startsWith(prefix)) {
      return entry.slice(prefix.length).split(';')[0];
    }
  }
  return null;
}

function cookieWasCleared(setCookie: string | string[] | undefined): boolean {
  if (!setCookie) {
    return false;
  }
  const entries = Array.isArray(setCookie) ? setCookie : [setCookie];
  return entries.some(
    (entry) => entry.startsWith('remember_me=;') || entry.includes('Max-Age=0'),
  );
}

describe('Remember-me (e2e)', () => {
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

    await registerUser.execute(
      new RegisterUserDto(
        'morgan@example.com',
        'morgan',
        'Password1',
        'Password1',
      ),
    );
    await dataSource.query(
      'UPDATE users SET account_state = $1, email_verified_at = $2 WHERE email = $3',
      ['active', new Date(), 'morgan@example.com'],
    );
  });

  afterEach(async () => {
    await app.close();
    await resetDatabase();
  });

  async function tokenCountFor(email: string): Promise<number> {
    const rows = await dataSource.query<Array<{ count: number }>>(
      'SELECT COUNT(*)::int AS count FROM remember_me_tokens t JOIN users u ON u.id = t.user_id WHERE u.email = $1',
      [email],
    );
    return rows[0].count;
  }

  it('sets a remember_me cookie and stores a token when the box is checked', async () => {
    const res = await request(app.getHttpServer() as Server)
      .post('/login')
      .send({
        email: 'morgan@example.com',
        password: 'Password1',
        rememberMe: 'on',
      })
      .expect(302)
      .expect('Location', '/dashboard');

    const cookie = cookieValue(res.headers['set-cookie'], 'remember_me');
    expect(cookie).not.toBeNull();
    expect(await tokenCountFor('morgan@example.com')).toBe(1);
  });

  it('sets no remember_me cookie and stores no token when the box is unchecked', async () => {
    const res = await request(app.getHttpServer() as Server)
      .post('/login')
      .send({ email: 'morgan@example.com', password: 'Password1' })
      .expect(302)
      .expect('Location', '/dashboard');

    expect(cookieValue(res.headers['set-cookie'], 'remember_me')).toBeNull();
    expect(await tokenCountFor('morgan@example.com')).toBe(0);
  });

  async function loginWithRememberMe(): Promise<string> {
    const res = await request(app.getHttpServer() as Server)
      .post('/login')
      .send({
        email: 'morgan@example.com',
        password: 'Password1',
        rememberMe: 'on',
      })
      .expect(302);

    const cookie = cookieValue(res.headers['set-cookie'], 'remember_me');
    if (!cookie) {
      throw new Error('login did not set a remember_me cookie');
    }
    return cookie;
  }

  async function setAccountState(email: string, state: string): Promise<void> {
    await dataSource.query(
      'UPDATE users SET account_state = $1 WHERE email = $2',
      [state, email],
    );
  }

  it('restores the session and rotates the cookie when the session is gone but the cookie is valid', async () => {
    const oldCookie = await loginWithRememberMe();

    const res = await request(app.getHttpServer() as Server)
      .get('/dashboard')
      .set('Cookie', `remember_me=${oldCookie}`);

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Signed in as morgan/);

    const newCookie = cookieValue(res.headers['set-cookie'], 'remember_me');
    expect(newCookie).not.toBeNull();
    expect(newCookie).not.toBe(oldCookie);

    const rows = await dataSource.query<Array<{ token_hash: string }>>(
      'SELECT t.token_hash FROM remember_me_tokens t JOIN users u ON u.id = t.user_id WHERE u.email = $1',
      ['morgan@example.com'],
    );
    expect(rows.length).toBe(1);
  });

  it('does not restore and shows the logged-out nav when there is no cookie', async () => {
    const res = await request(app.getHttpServer() as Server).get('/dashboard');

    expect(res.status).toBe(200);
    expect(res.text).not.toMatch(/Signed in as morgan/);
  });

  it('clears the cookie and does not restore for a tampered cookie', async () => {
    const res = await request(app.getHttpServer() as Server)
      .get('/dashboard')
      .set('Cookie', 'remember_me=not-a-real-token');

    expect(res.status).toBe(200);
    expect(res.text).not.toMatch(/Signed in as morgan/);
    expect(cookieWasCleared(res.headers['set-cookie'])).toBe(true);
  });

  it('does not restore for a suspended account and clears the cookie', async () => {
    const oldCookie = await loginWithRememberMe();
    await setAccountState('morgan@example.com', 'suspended');

    const res = await request(app.getHttpServer() as Server)
      .get('/dashboard')
      .set('Cookie', `remember_me=${oldCookie}`);

    expect(res.status).toBe(200);
    expect(res.text).not.toMatch(/Signed in as morgan/);
    expect(cookieWasCleared(res.headers['set-cookie'])).toBe(true);
    expect(await tokenCountFor('morgan@example.com')).toBe(0);
  });
});

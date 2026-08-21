import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createHash } from 'node:crypto';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';
import { resetDatabase } from './utils/db';
import { RegisterUserUseCase } from '@application/use-cases/auth/register-user/register-user.use-case';
import { RegisterUserDto } from '@application/use-cases/auth/register-user/register-user.dto';
import { RememberMeTokenStore } from '@application/contracts/remember-me-token-store.interface';
import { UnitOfWork } from '@application/contracts/unit-of-work.interface';

const sha256 = (value: string): string =>
  createHash('sha256').update(value).digest('hex');

describe('TypeOrmRememberMeTokenStore (e2e)', () => {
  let app: INestApplication;
  let store: RememberMeTokenStore;
  let uow: UnitOfWork;
  let dataSource: DataSource;
  let userId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await setupApp(app);
    await app.init();

    store = app.get(RememberMeTokenStore);
    uow = app.get(UnitOfWork);
    dataSource = app.get(DataSource);

    const register = app.get(RegisterUserUseCase);
    await register.execute(
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

    const rows = await dataSource.query<Array<{ id: string }>>(
      'SELECT id FROM users WHERE email = $1',
      ['morgan@example.com'],
    );
    userId = rows[0].id;
  });

  afterEach(async () => {
    await app.close();
    await resetDatabase();
  });

  async function hashRowFor(rawToken: string): Promise<string | null> {
    const rows = await dataSource.query<Array<{ token_hash: string }>>(
      'SELECT token_hash FROM remember_me_tokens WHERE token_hash = $1',
      [sha256(rawToken)],
    );
    return rows.length ? rows[0].token_hash : null;
  }

  it('save stores the sha-256 hash of the raw token, not the raw token', async () => {
    const expiresAt = new Date(Date.now() + 60_000);
    await store.save('raw-token-one', userId, expiresAt);

    expect(await hashRowFor('raw-token-one')).toBe(sha256('raw-token-one'));
    const rawRows = await dataSource.query<Array<{ count: number }>>(
      'SELECT COUNT(*)::int AS count FROM remember_me_tokens WHERE token_hash = $1',
      ['raw-token-one'],
    );
    expect(rawRows[0].count).toBe(0);
  });

  it('find returns a session with the user and expiry for a stored token', async () => {
    const expiresAt = new Date(Date.now() + 60_000);
    await store.save('raw-token-two', userId, expiresAt);

    const session = await store.find('raw-token-two');

    expect(session).not.toBeNull();
    expect(session!.user.id).toBe(userId);
    expect(session!.user.email).toBe('morgan@example.com');
    expect(session!.expiresAt.getTime()).toBe(expiresAt.getTime());
  });

  it('find returns null for an unknown token', async () => {
    expect(await store.find('no-such-token')).toBeNull();
  });

  it('revoke deletes the row for the given raw token', async () => {
    await store.save('raw-token-three', userId, new Date(Date.now() + 60_000));
    await store.revoke('raw-token-three');

    expect(await hashRowFor('raw-token-three')).toBeNull();
  });

  it('revokeByUserId deletes all rows for the user', async () => {
    await store.save('raw-a', userId, new Date(Date.now() + 60_000));
    await store.save('raw-b', userId, new Date(Date.now() + 60_000));
    await store.revokeByUserId(userId);

    expect(await hashRowFor('raw-a')).toBeNull();
    expect(await hashRowFor('raw-b')).toBeNull();
  });

  it('rotate deletes the old hash and inserts the new hash inside one transaction', async () => {
    await store.save('raw-old', userId, new Date(Date.now() + 60_000));
    const newExpiresAt = new Date(Date.now() + 120_000);

    await uow.execute(() =>
      store.rotate('raw-old', 'raw-new', userId, newExpiresAt),
    );

    expect(await hashRowFor('raw-old')).toBeNull();
    expect(await hashRowFor('raw-new')).toBe(sha256('raw-new'));
    const session = await store.find('raw-new');
    expect(session!.expiresAt.getTime()).toBe(newExpiresAt.getTime());
  });
});

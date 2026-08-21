import { RestoreRememberMeSessionUseCase } from '../restore-remember-me-session.use-case';
import { RestoreRememberMeSessionResult } from '../restore-remember-me-session.result';
import { RememberMeTokenStore } from '@application/contracts/remember-me-token-store.interface';
import { TokenGenerator } from '@application/contracts/token-generator.interface';
import { UnitOfWork } from '@application/contracts/unit-of-work.interface';
import { RememberMeSession } from '@application/entities/remember-me-session.entity';
import { User } from '@domain/entities/user.entity';
import { AccountStateValue } from '@domain/value-objects/account-state.vo';
import { UuidTokenGenerator } from '@infrastructure/token-generator/uuid-token-generator';

class FakeStore implements RememberMeTokenStore {
  public rotated: {
    oldRaw: string;
    newRaw: string;
    userId: string;
    expiresAt: Date;
  } | null = null;
  public revokedRaw: string | null = null;

  constructor(private readonly session: RememberMeSession | null) {}

  save(): Promise<void> {
    return Promise.resolve();
  }
  find(): Promise<RememberMeSession | null> {
    return Promise.resolve(this.session);
  }
  revoke(rawToken: string): Promise<void> {
    this.revokedRaw = rawToken;
    return Promise.resolve();
  }
  revokeByUserId(): Promise<void> {
    return Promise.resolve();
  }
  rotate(
    oldRawToken: string,
    newRawToken: string,
    userId: string,
    newExpiresAt: Date,
  ): Promise<void> {
    this.rotated = {
      oldRaw: oldRawToken,
      newRaw: newRawToken,
      userId,
      expiresAt: newExpiresAt,
    };
    return Promise.resolve();
  }
}

const fakeUnitOfWork: UnitOfWork = {
  execute<T>(work: () => Promise<T>): Promise<T> {
    return work();
  },
};

function buildUser(state: AccountStateValue): User {
  return User.reconstitute(
    'user-1',
    'morgan@example.com',
    'morgan',
    'hash',
    state,
    new Date(),
    new Date(),
    new Date(),
  );
}

describe('RestoreRememberMeSessionUseCase', () => {
  const ttl = 2592000;

  it('returns null when no token matches the cookie', async () => {
    const store = new FakeStore(null);
    const useCase = new RestoreRememberMeSessionUseCase(
      store,
      new UuidTokenGenerator(),
      fakeUnitOfWork,
      ttl,
    );

    const result = await useCase.execute('raw');

    expect(result).toBeNull();
    expect(store.revokedRaw).toBeNull();
    expect(store.rotated).toBeNull();
  });

  it('returns null without revoking when the token is expired', async () => {
    const expired = RememberMeSession.of(
      buildUser(AccountStateValue.Active),
      new Date(Date.now() - 60_000),
    );
    const store = new FakeStore(expired);
    const useCase = new RestoreRememberMeSessionUseCase(
      store,
      new UuidTokenGenerator(),
      fakeUnitOfWork,
      ttl,
    );

    const result = await useCase.execute('raw');

    expect(result).toBeNull();
    expect(store.revokedRaw).toBeNull();
    expect(store.rotated).toBeNull();
  });

  it('revokes and returns null when the account is not active', async () => {
    const session = RememberMeSession.of(
      buildUser(AccountStateValue.Suspended),
      new Date(Date.now() + 60_000),
    );
    const store = new FakeStore(session);
    const useCase = new RestoreRememberMeSessionUseCase(
      store,
      new UuidTokenGenerator(),
      fakeUnitOfWork,
      ttl,
    );

    const result = await useCase.execute('raw');

    expect(result).toBeNull();
    expect(store.revokedRaw).toBe('raw');
    expect(store.rotated).toBeNull();
  });

  it('rotates the token and returns the restored identity for an active user', async () => {
    const session = RememberMeSession.of(
      buildUser(AccountStateValue.Active),
      new Date(Date.now() + 60_000),
    );
    const store = new FakeStore(session);
    const tokenGenerator: TokenGenerator = {
      generate: () => 'generated-new-raw',
    };
    const useCase = new RestoreRememberMeSessionUseCase(
      store,
      tokenGenerator,
      fakeUnitOfWork,
      ttl,
    );

    const result = await useCase.execute('raw');

    expect(result).toStrictEqual(
      new RestoreRememberMeSessionResult(
        'user-1',
        'morgan',
        'generated-new-raw',
      ),
    );
    expect(store.rotated).not.toBeNull();
    expect(store.rotated!.oldRaw).toBe('raw');
    expect(store.rotated!.newRaw).toBe('generated-new-raw');
    expect(store.rotated!.userId).toBe('user-1');
    expect(store.rotated!.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});

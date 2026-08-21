import type { RememberMeTokenStore } from '@application/contracts/remember-me-token-store.interface';
import type { TokenGenerator } from '@application/contracts/token-generator.interface';
import type { UnitOfWork } from '@application/contracts/unit-of-work.interface';
import type { RememberMeSession } from '@application/entities/remember-me-session.entity';
import { AccountStateValue } from '@domain/value-objects/account-state.vo';
import { RestoreRememberMeSessionResult } from './restore-remember-me-session.result';

export class RestoreRememberMeSessionUseCase {
  constructor(
    private readonly tokenStore: RememberMeTokenStore,
    private readonly tokenGenerator: TokenGenerator,
    private readonly unitOfWork: UnitOfWork,
    private readonly rememberMeTokenTtlSeconds: number,
  ) {}

  public async execute(
    rawToken: string,
  ): Promise<RestoreRememberMeSessionResult | null> {
    const session = await this.findSession(rawToken);

    if (!session) {
      return null;
    }

    if (session.isExpired()) {
      return null;
    }

    if (!this.canRestore(session)) {
      await this.tokenStore.revoke(rawToken);
      return null;
    }

    return this.rotateToken(rawToken, session);
  }

  private async findSession(
    rawToken: string,
  ): Promise<RememberMeSession | null> {
    return this.tokenStore.find(rawToken);
  }

  private canRestore(session: RememberMeSession): boolean {
    return session.user.accountState.value === AccountStateValue.Active;
  }

  private async rotateToken(
    rawToken: string,
    session: RememberMeSession,
  ): Promise<RestoreRememberMeSessionResult> {
    const newRawToken = this.tokenGenerator.generate();
    const newExpiresAt = new Date(
      Date.now() + this.rememberMeTokenTtlSeconds * 1000,
    );

    await this.unitOfWork.execute(() =>
      this.tokenStore.rotate(
        rawToken,
        newRawToken,
        session.user.id,
        newExpiresAt,
      ),
    );

    return new RestoreRememberMeSessionResult(
      session.user.id,
      session.user.username,
      newRawToken,
    );
  }
}

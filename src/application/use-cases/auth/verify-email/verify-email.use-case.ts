import type { UnitOfWork } from '@application/contracts/unit-of-work.interface';
import type { VerifyEmailRepository } from './verify-email.repository.interface';
import { TokenNotFoundException } from './exceptions/token-not-found.exception';
import { TokenExpiredException } from './exceptions/token-expired.exception';

export class VerifyEmailUseCase {
  constructor(
    private readonly tokens: VerifyEmailRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public async execute(token: string): Promise<void> {
    const stored = await this.tokens.findByToken(token);

    if (!stored) {
      throw new TokenNotFoundException();
    }

    if (stored.isExpired()) {
      throw new TokenExpiredException();
    }

    await this.unitOfWork.execute(() =>
      this.tokens.applyVerification(stored.token, stored.userId),
    );
  }
}

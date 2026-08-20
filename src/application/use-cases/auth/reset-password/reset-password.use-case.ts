import type { Hasher } from '@application/contracts/hasher.interface';
import type { UnitOfWork } from '@application/contracts/unit-of-work.interface';
import { Password } from '@domain/value-objects/password.vo';
import { HashedPassword } from '@domain/value-objects/hashed-password.vo';
import { Notification } from '@domain/validation/notification';
import { ValidationException } from '@domain/exceptions/validation.exception';
import { ResetPasswordDto } from './reset-password.dto';
import { ResetPasswordResult } from './reset-password.result';
import type { ResetPasswordRepository } from './reset-password.repository.interface';
import type { PasswordResetToken } from '@application/entities/password-reset-token.entity';
import { TokenNotFoundException } from './exceptions/token-not-found.exception';
import { TokenExpiredException } from './exceptions/token-expired.exception';

export class ResetPasswordUseCase {
  constructor(
    private readonly tokens: ResetPasswordRepository,
    private readonly hasher: Hasher,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public async execute(dto: ResetPasswordDto): Promise<ResetPasswordResult> {
    const token = await this.findTokenOrFail(dto.token);

    this.validatePassword(dto);

    const newHashedPassword = await this.hashNewPassword(dto.password);

    await this.unitOfWork.execute(() =>
      this.tokens.applyReset(token.token, token.userId, newHashedPassword),
    );

    return new ResetPasswordResult();
  }

  private async findTokenOrFail(
    tokenValue: string,
  ): Promise<PasswordResetToken> {
    const token = await this.tokens.findByToken(tokenValue);

    if (!token) {
      throw new TokenNotFoundException();
    }

    if (token.isExpired()) {
      throw new TokenExpiredException();
    }

    return token;
  }

  private validatePassword(dto: ResetPasswordDto): void {
    const notification = new Notification();
    const passwordError = Password.validate(dto.password);

    if (passwordError) {
      notification.addError('password', passwordError);
    }

    if (dto.password !== dto.confirmPassword) {
      notification.addError('confirmPassword', 'Passwords do not match.');
    }

    if (notification.hasErrors) {
      throw new ValidationException(notification);
    }
  }

  private async hashNewPassword(password: string): Promise<HashedPassword> {
    const hash = await this.hasher.hash(password);
    return HashedPassword.fromHash(hash);
  }
}

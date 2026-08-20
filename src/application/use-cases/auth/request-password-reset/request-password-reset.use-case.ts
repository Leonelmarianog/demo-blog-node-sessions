import type { Mailer } from '@application/contracts/mailer.interface';
import type { UrlSigner } from '@application/contracts/url-signer.interface';
import type { TokenGenerator } from '@application/contracts/token-generator.interface';
import type { UnitOfWork } from '@application/contracts/unit-of-work.interface';
import { Email } from '@domain/value-objects/email.vo';
import { AccountStateValue } from '@domain/value-objects/account-state.vo';
import type { User } from '@domain/entities/user.entity';
import { PasswordResetToken } from '@application/entities/password-reset-token.entity';
import { Notification } from '@domain/validation/notification';
import { ValidationException } from '@domain/exceptions/validation.exception';
import { RequestPasswordResetDto } from './request-password-reset.dto';
import { RequestPasswordResetResult } from './request-password-reset.result';
import type { RequestPasswordResetRepository } from './request-password-reset.repository.interface';

export class RequestPasswordResetUseCase {
  constructor(
    private readonly users: RequestPasswordResetRepository,
    private readonly mailer: Mailer,
    private readonly urlSigner: UrlSigner,
    private readonly tokenGenerator: TokenGenerator,
    private readonly unitOfWork: UnitOfWork,
    private readonly tokenTtlSeconds: number,
    private readonly appBaseUrl: string,
  ) {}

  public async execute(
    dto: RequestPasswordResetDto,
  ): Promise<RequestPasswordResetResult> {
    this.validateInput(dto);

    const user = await this.findResettableUser(dto.email);

    if (!user) {
      return new RequestPasswordResetResult(null);
    }

    const link = await this.unitOfWork.execute(() => this.issueReset(user));

    await this.sendResetEmail(user.email, link);

    return new RequestPasswordResetResult(link);
  }

  private validateInput(dto: RequestPasswordResetDto): void {
    const notification = new Notification();
    const emailError = Email.validate(dto.email);

    if (emailError) {
      notification.addError('email', emailError);
    }

    if (notification.hasErrors) {
      throw new ValidationException(notification);
    }
  }

  private async findResettableUser(email: string): Promise<User | null> {
    const user = await this.users.findByEmail(email);

    if (!user) {
      return null;
    }

    const state = user.accountState.value;
    if (
      state !== AccountStateValue.Active &&
      state !== AccountStateValue.SelfDeactivated
    ) {
      return null;
    }

    return user;
  }

  private async issueReset(user: User): Promise<string> {
    await this.users.deleteByUserId(user.id);

    const token = PasswordResetToken.create(
      this.tokenGenerator.generate(),
      user.id,
      this.tokenTtlSeconds,
    );

    await this.users.save(token);

    return this.buildResetLink(token);
  }

  private buildResetLink(token: PasswordResetToken): string {
    const resetUrl = `/reset-password?token=${token.token}`;
    return `${this.appBaseUrl}${this.urlSigner.sign(resetUrl, this.tokenTtlSeconds)}`;
  }

  private async sendResetEmail(email: string, link: string): Promise<void> {
    await this.mailer.send(
      email,
      'Reset your password',
      `Open this link to set a new password: ${link}`,
    );
  }
}

import type { Mailer } from '@application/contracts/mailer.interface';
import type { UrlSigner } from '@application/contracts/url-signer.interface';
import type { TokenGenerator } from '@application/contracts/token-generator.interface';
import type { UnitOfWork } from '@application/contracts/unit-of-work.interface';
import { Email } from '@domain/value-objects/email.vo';
import { AccountStateValue } from '@domain/value-objects/account-state.vo';
import type { User } from '@domain/entities/user.entity';
import { VerificationToken } from '@application/entities/verification-token.entity';
import { Notification } from '@domain/validation/notification';
import { ValidationException } from '@domain/exceptions/validation.exception';
import { ResendVerificationEmailDto } from './resend-verification-email.dto';
import { ResendVerificationEmailResult } from './resend-verification-email.result';
import type { ResendVerificationEmailRepository } from './resend-verification-email.repository.interface';

export class ResendVerificationEmailUseCase {
  constructor(
    private readonly users: ResendVerificationEmailRepository,
    private readonly mailer: Mailer,
    private readonly urlSigner: UrlSigner,
    private readonly tokenGenerator: TokenGenerator,
    private readonly unitOfWork: UnitOfWork,
    private readonly tokenTtlSeconds: number,
    private readonly appBaseUrl: string,
  ) {}

  public async execute(
    dto: ResendVerificationEmailDto,
  ): Promise<ResendVerificationEmailResult> {
    this.validateInput(dto);

    const user = await this.findUnverifiedUser(dto.email);

    if (!user) {
      return new ResendVerificationEmailResult(null);
    }

    const link = await this.unitOfWork.execute(() =>
      this.issueVerification(user),
    );

    await this.sendVerificationEmail(user.email, link);

    return new ResendVerificationEmailResult(link);
  }

  private validateInput(dto: ResendVerificationEmailDto): void {
    const notification = new Notification();
    const emailError = Email.validate(dto.email);

    if (emailError) {
      notification.addError('email', emailError);
    }

    if (notification.hasErrors) {
      throw new ValidationException(notification);
    }
  }

  private async findUnverifiedUser(email: string): Promise<User | null> {
    const user = await this.users.findByEmail(email);

    if (!user) {
      return null;
    }

    if (user.accountState.value !== AccountStateValue.Unverified) {
      return null;
    }

    return user;
  }

  private async issueVerification(user: User): Promise<string> {
    await this.users.deleteByUserId(user.id);

    const token = VerificationToken.create(
      this.tokenGenerator.generate(),
      user.id,
      this.tokenTtlSeconds,
    );

    await this.users.save(token);

    return this.buildVerificationLink(token);
  }

  private buildVerificationLink(token: VerificationToken): string {
    const verifyUrl = `/verify-email?token=${token.token}`;
    return `${this.appBaseUrl}${this.urlSigner.sign(verifyUrl, this.tokenTtlSeconds)}`;
  }

  private async sendVerificationEmail(
    email: string,
    link: string,
  ): Promise<void> {
    await this.mailer.send(
      email,
      'Verify your email',
      `Open this link to verify your account: ${link}`,
    );
  }
}

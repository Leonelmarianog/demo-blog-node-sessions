import type { PasswordHasher } from '@application/contracts/password-hasher.interface';
import type { UnitOfWork } from '@application/contracts/unit-of-work.interface';
import type { Mailer } from '@application/contracts/mailer.interface';
import type { UrlSigner } from '@application/contracts/url-signer.interface';
import type { TokenGenerator } from '@application/contracts/token-generator.interface';
import { Email } from '@domain/value-objects/email.vo';
import { Username } from '@domain/value-objects/username.vo';
import { HashedPassword } from '@domain/value-objects/hashed-password.vo';
import { Password } from '@domain/value-objects/password.vo';
import { User } from '@domain/entities/user.entity';
import { VerificationToken } from '@domain/auth/verification-token';
import { ValidationException } from '@domain/exceptions/validation.exception';
import { RegisterUserDto } from './register-user.dto';
import { RegisterUserResult } from './register-user.result';
import type { RegisterUserRepository } from './register-user.repository.interface';
import { EmailAlreadyExistsException } from './exceptions/email-already-exists.exception';
import { UsernameAlreadyExistsException } from './exceptions/username-already-exists.exception';

export class RegisterUserUseCase {
  constructor(
    private readonly users: RegisterUserRepository,
    private readonly hasher: PasswordHasher,
    private readonly unitOfWork: UnitOfWork,
    private readonly mailer: Mailer,
    private readonly urlSigner: UrlSigner,
    private readonly tokenGenerator: TokenGenerator,
    private readonly tokenTtlSeconds: number,
    private readonly appBaseUrl: string,
  ) {}

  public async execute(dto: RegisterUserDto): Promise<RegisterUserResult> {
    this.validate(dto);

    const link = await this.unitOfWork.execute(() => this.register(dto));

    await this.sendVerificationEmail(dto.email, link);

    return new RegisterUserResult(link);
  }

  private validate(dto: RegisterUserDto): void {
    const notification = User.validate(dto.email, dto.username, dto.password);

    if (dto.password !== dto.confirmPassword) {
      notification.addError('confirmPassword', 'Passwords do not match.');
    }

    if (notification.hasErrors) {
      throw new ValidationException(notification);
    }
  }

  private async register(dto: RegisterUserDto): Promise<string> {
    const email = Email.create(dto.email);
    const username = Username.create(dto.username);
    const password = Password.create(dto.password);

    await this.ensureUnique(email, username);

    const user = await this.createUser(email, username, password);
    const token = this.createVerificationToken(user);
    await this.users.save(user, token);

    return this.buildVerificationLink(token);
  }

  private async ensureUnique(email: Email, username: Username): Promise<void> {
    if (await this.users.existsByEmail(email.value)) {
      throw new EmailAlreadyExistsException();
    }

    if (await this.users.existsByUsername(username.value)) {
      throw new UsernameAlreadyExistsException();
    }
  }

  private async createUser(
    email: Email,
    username: Username,
    password: Password,
  ): Promise<User> {
    const passwordHash = await this.hasher.hash(password.value);
    return User.create(email, username, HashedPassword.fromHash(passwordHash));
  }

  private createVerificationToken(user: User): VerificationToken {
    return VerificationToken.create(
      this.tokenGenerator.generate(),
      user.id,
      this.tokenTtlSeconds,
    );
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

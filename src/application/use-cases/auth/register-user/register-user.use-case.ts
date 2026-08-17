import type { PasswordHasher } from '@application/common/contracts/password-hasher.port';
import type { UnitOfWork } from '@application/common/contracts/unit-of-work.port';
import type { Mailer } from '@application/common/contracts/mailer.port';
import type { SignedUrl } from '@application/common/contracts/signed-url.port';
import type { TokenGenerator } from '@application/common/contracts/token-generator.port';
import { Email } from '@domain/value-objects/email.vo';
import { Username } from '@domain/value-objects/username.vo';
import { HashedPassword } from '@domain/value-objects/hashed-password.vo';
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
    private readonly signedUrl: SignedUrl,
    private readonly tokenGenerator: TokenGenerator,
    private readonly tokenTtlSeconds: number,
    private readonly appBaseUrl: string,
  ) {}

  public async execute(dto: RegisterUserDto): Promise<RegisterUserResult> {
    const notification = User.validate(dto.email, dto.username, dto.password);

    if (dto.password !== dto.confirmPassword) {
      notification.addError('confirmPassword', 'Passwords do not match.');
    }

    if (notification.hasErrors) {
      throw new ValidationException(notification);
    }

    const email = Email.create(dto.email);
    const username = Username.create(dto.username);

    const link = await this.unitOfWork.execute(async (tx) => {
      if (await this.users.existsByEmail(email.value, tx)) {
        throw new EmailAlreadyExistsException();
      }

      if (await this.users.existsByUsername(username.value, tx)) {
        throw new UsernameAlreadyExistsException();
      }

      const passwordHash = await this.hasher.hash(dto.password);
      const user = User.create(
        email,
        username,
        HashedPassword.fromHash(passwordHash),
      );
      const token = VerificationToken.create(
        this.tokenGenerator.generate(),
        user.id,
        this.tokenTtlSeconds,
      );
      await this.users.save(user, token);

      const verifyUrl = `/verify-email?token=${token.token}`;
      return `${this.appBaseUrl}${this.signedUrl.sign(verifyUrl, this.tokenTtlSeconds)}`;
    });

    await this.mailer.send(
      email.value,
      'Verify your email',
      `Open this link to verify your account: ${link}`,
    );
    return new RegisterUserResult(link);
  }
}

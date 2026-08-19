import type { Hasher } from '@application/contracts/hasher.interface';
import type { UnitOfWork } from '@application/contracts/unit-of-work.interface';
import type { LoginUserRepository } from './login.repository.interface';
import { Email } from '@domain/value-objects/email.vo';
import { Password } from '@domain/value-objects/password.vo';
import { AccountStateValue } from '@domain/value-objects/account-state.vo';
import { Notification } from '@domain/validation/notification';
import { ValidationException } from '@domain/exceptions/validation.exception';
import { LoginDto } from './login.dto';
import { LoginResult } from './login.result';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';
import { EmailNotVerifiedException } from './exceptions/email-not-verified.exception';

export class LoginUseCase {
  constructor(
    private readonly users: LoginUserRepository,
    private readonly hasher: Hasher,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public async execute(dto: LoginDto): Promise<LoginResult> {
    this.validate(dto);

    const email = dto.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const matches = await this.hasher.verify(dto.password, user.passwordHash);

    if (!matches) {
      throw new InvalidCredentialsException();
    }

    const state = user.accountState.value;

    if (state === AccountStateValue.Suspended) {
      throw new InvalidCredentialsException();
    }

    if (state === AccountStateValue.Unverified) {
      throw new EmailNotVerifiedException();
    }

    if (state === AccountStateValue.SelfDeactivated) {
      user.reactivate();
      await this.unitOfWork.execute(() => this.users.updateAccountState(user));
    }

    return new LoginResult(user.id, user.username);
  }

  private validate(dto: LoginDto): void {
    const notification = new Notification();

    const emailError = Email.validate(dto.email);

    if (emailError) {
      notification.addError('email', emailError);
    }

    const passwordError = Password.validate(dto.password);

    if (passwordError) {
      notification.addError('password', passwordError);
    }

    if (notification.hasErrors) {
      throw new ValidationException(notification);
    }
  }
}

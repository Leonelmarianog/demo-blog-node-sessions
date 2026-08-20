import type { Hasher } from '@application/contracts/hasher.interface';
import type { UnitOfWork } from '@application/contracts/unit-of-work.interface';
import type { LoginUserRepository } from './login.repository.interface';
import type { User } from '@domain/entities/user.entity';
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
    this.validateInput(dto);

    const user = await this.findUserByCredentialsOrFail(
      dto.email,
      dto.password,
    );
    this.ensureUserCanLogIn(user);
    await this.reactivateUserIfSelfDeactivated(user);

    return new LoginResult(user.id, user.username);
  }

  private validateInput(dto: LoginDto): void {
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

  private async findUserByCredentialsOrFail(
    email: string,
    password: string,
  ): Promise<User> {
    const normalizedEmail = Email.create(email);
    const user = await this.users.findByEmail(normalizedEmail.value);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const matches = await this.hasher.verify(password, user.passwordHash);

    if (!matches) {
      throw new InvalidCredentialsException();
    }

    return user;
  }

  private ensureUserCanLogIn(user: User): void {
    const state = user.accountState.value;

    if (state === AccountStateValue.Suspended) {
      throw new InvalidCredentialsException();
    }

    if (state === AccountStateValue.Unverified) {
      throw new EmailNotVerifiedException();
    }
  }

  private async reactivateUserIfSelfDeactivated(user: User): Promise<void> {
    if (user.accountState.value !== AccountStateValue.SelfDeactivated) {
      return;
    }

    user.reactivate();
    await this.unitOfWork.execute(() => this.users.updateAccountState(user));
  }
}

import { randomUUID } from 'node:crypto';
import { Notification } from '../validation/notification';
import { Email } from '../value-objects/email.vo';
import { Username } from '../value-objects/username.vo';
import { Password } from '../value-objects/password.vo';
import { HashedPassword } from '../value-objects/hashed-password.vo';
import { AccountState } from '../value-objects/account-state.vo';

export class User {
  private constructor(
    private readonly _id: string,
    private _email: Email,
    private _username: Username,
    private _passwordHash: HashedPassword,
    private _accountState: AccountState,
    private _emailVerifiedAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  public get id(): string {
    return this._id;
  }

  public get email(): string {
    return this._email.value;
  }

  public get username(): string {
    return this._username.value;
  }

  public get passwordHash(): string {
    return this._passwordHash.value;
  }

  public get accountState(): AccountState {
    return this._accountState;
  }

  public get isEmailVerified(): boolean {
    return this._emailVerifiedAt !== null;
  }

  public get emailVerifiedAt(): Date | null {
    return this._emailVerifiedAt;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public static validate(
    email: string,
    username: string,
    password: string,
  ): Notification {
    const notification = new Notification();
    const emailError = Email.validate(email);

    if (emailError) {
      notification.addError('email', emailError);
    }

    const usernameError = Username.validate(username);

    if (usernameError) {
      notification.addError('username', usernameError);
    }

    const passwordError = Password.validate(password);

    if (passwordError) {
      notification.addError('password', passwordError);
    }

    return notification;
  }

  public static create(
    email: Email,
    username: Username,
    passwordHash: HashedPassword,
  ): User {
    const now = new Date();
    return new User(
      randomUUID(),
      email,
      username,
      passwordHash,
      AccountState.unverified(),
      null,
      now,
      now,
    );
  }

  public static reconstitute(
    id: string,
    email: string,
    username: string,
    passwordHash: string,
    accountState: string,
    emailVerifiedAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    return new User(
      id,
      Email.from(email),
      Username.from(username),
      HashedPassword.fromHash(passwordHash),
      AccountState.from(accountState),
      emailVerifiedAt,
      createdAt,
      updatedAt,
    );
  }

  public markEmailAsVerified(): void {
    this._emailVerifiedAt = new Date();
    this._accountState.activate();
    this._updatedAt = new Date();
  }
}

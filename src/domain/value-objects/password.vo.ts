import { DomainValidationException } from '../exceptions/domain-validation.exception';

export class Password {
  private constructor(private readonly _value: string) {}

  /** Validates the password and returns an error string, or null if it is valid. */
  public static validate(password: string): string | null {
    const value = password ?? '';

    if (value.length === 0) {
      return 'Password is required.';
    }

    if (value.length < 8 || value.length > 128) {
      return 'Password must be 8 to 128 characters.';
    }

    if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value)) {
      return 'Password must include an uppercase letter, a lowercase letter, and a digit.';
    }

    return null;
  }

  /** Builds a Password from the given value. Throws if the value is invalid. */
  public static create(password: string): Password {
    const error = Password.validate(password);

    if (error) {
      throw new DomainValidationException(error);
    }

    return new Password(password);
  }

  public get value(): string {
    return this._value;
  }
}

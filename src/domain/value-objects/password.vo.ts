import { DomainValidationException } from '../exceptions/domain-validation.exception';

export class Password {
  private constructor(private readonly _value: string) {}

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

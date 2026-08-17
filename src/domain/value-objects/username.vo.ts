import { DomainValidationException } from '../exceptions/domain-validation.exception';

export class Username {
  private constructor(private readonly _value: string) {}

  /** Validates the username and returns an error string, or null if it is valid. */
  public static validate(username: string): string | null {
    const value = (username ?? '').trim();

    if (value.length === 0) {
      return 'Username is required.';
    }

    if (value.length < 3 || value.length > 50) {
      return 'Username must be 3 to 50 characters.';
    }

    if (!/^[a-z0-9-]+$/.test(value)) {
      return 'Username must be lowercase letters, digits, and hyphens only.';
    }

    if (!/^[a-z0-9]/.test(value) || !/[a-z0-9]$/.test(value)) {
      return 'Username must start and end with a letter or digit.';
    }

    if (/--/.test(value)) {
      return 'Username must not contain consecutive hyphens.';
    }

    return null;
  }

  /** Builds a Username from the given value. The value is trimmed. Throws if the value is invalid. */
  public static create(username: string): Username {
    const error = Username.validate(username);

    if (error) {
      throw new DomainValidationException(error);
    }

    return new Username(username.trim());
  }

  /** Rebuilds a Username from stored data, without validation. */
  public static from(username: string): Username {
    return new Username(username);
  }

  public get value(): string {
    return this._value;
  }
}

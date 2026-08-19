import { DomainValidationException } from '../exceptions/domain-validation.exception';

export class Email {
  private constructor(private readonly _value: string) {}

  /** Validates the email format and returns an error string, or null if it is valid. */
  public static validate(email: string): string | null {
    const trimmed = (email ?? '').trim().toLowerCase();

    if (trimmed.length === 0) {
      return 'Email is required.';
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      return 'Email is not a valid address.';
    }

    return null;
  }

  /** Builds an Email from the given value. The value is trimmed and lowercased. Throws if the value is invalid. */
  public static create(email: string): Email {
    const error = Email.validate(email);

    if (error) {
      throw new DomainValidationException(error);
    }

    return new Email(email.trim().toLowerCase());
  }

  /** Rebuilds an Email from stored data, without validation. */
  public static from(email: string): Email {
    return new Email(email);
  }

  public get value(): string {
    return this._value;
  }

  /** Returns whether this email matches the other. */
  public equals(other: Email): boolean {
    return this._value === other.value;
  }
}

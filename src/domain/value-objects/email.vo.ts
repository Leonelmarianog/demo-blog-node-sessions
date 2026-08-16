import { DomainValidationException } from '../exceptions/domain-validation.exception';

export class Email {
  private constructor(private readonly _value: string) {}

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

  public static create(email: string): Email {
    const error = Email.validate(email);

    if (error) {
      throw new DomainValidationException(error);
    }

    return new Email(email.trim().toLowerCase());
  }

  public static from(email: string): Email {
    return new Email(email);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: Email): boolean {
    return this._value === other.value;
  }
}

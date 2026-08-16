import { Password } from './password.vo';
import { DomainValidationException } from '../exceptions/domain-validation.exception';

describe('Password', () => {
  it('validate() returns null for a strong password', () => {
    expect(Password.validate('Password1')).toBeNull();
  });

  it('validate() returns a message when blank', () => {
    expect(Password.validate('')).toBe('Password is required.');
  });

  it('validate() rejects too-short and too-long values', () => {
    expect(Password.validate('Pass1')).toBe(
      'Password must be 8 to 128 characters.',
    );
    expect(Password.validate('a'.repeat(129))).toBe(
      'Password must be 8 to 128 characters.',
    );
  });

  it('validate() rejects a password without all character classes', () => {
    expect(Password.validate('password1')).toBe(
      'Password must include an uppercase letter, a lowercase letter, and a digit.',
    );
    expect(Password.validate('PASSWORD1')).toBe(
      'Password must include an uppercase letter, a lowercase letter, and a digit.',
    );
    expect(Password.validate('Password')).toBe(
      'Password must include an uppercase letter, a lowercase letter, and a digit.',
    );
  });

  it('create() builds the VO', () => {
    expect(Password.create('Password1').value).toBe('Password1');
  });

  it('create() throws on a weak password', () => {
    expect(() => Password.create('weak')).toThrow(DomainValidationException);
  });
});

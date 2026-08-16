import { Username } from './username.vo';
import { DomainValidationException } from '../exceptions/domain-validation.exception';

describe('Username', () => {
  it('validate() returns null for a valid username', () => {
    expect(Username.validate('morgan-rivera')).toBeNull();
  });

  it('validate() returns a message when blank', () => {
    expect(Username.validate('')).toBe('Username is required.');
  });

  it('validate() rejects too-short and too-long values', () => {
    expect(Username.validate('ab')).toBe(
      'Username must be 3 to 50 characters.',
    );
    expect(Username.validate('a'.repeat(51))).toBe(
      'Username must be 3 to 50 characters.',
    );
  });

  it('validate() rejects invalid characters and casing', () => {
    expect(Username.validate('Morgan Rivera')).toBe(
      'Username must be lowercase letters, digits, and hyphens only.',
    );
    expect(Username.validate('morgan_rivera')).toBe(
      'Username must be lowercase letters, digits, and hyphens only.',
    );
  });

  it('validate() rejects a leading or trailing hyphen and consecutive hyphens', () => {
    expect(Username.validate('-morgan')).toBe(
      'Username must start and end with a letter or digit.',
    );
    expect(Username.validate('morgan-')).toBe(
      'Username must start and end with a letter or digit.',
    );
    expect(Username.validate('morgan--rivera')).toBe(
      'Username must not contain consecutive hyphens.',
    );
  });

  it('create() builds the VO', () => {
    expect(Username.create('morgan-rivera').value).toBe('morgan-rivera');
  });

  it('create() throws on an invalid username', () => {
    expect(() => Username.create('AB')).toThrow(DomainValidationException);
  });

  it('from() skips validation', () => {
    expect(Username.from('whatever').value).toBe('whatever');
  });
});

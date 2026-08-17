import { Email } from '../email.vo';
import { DomainValidationException } from '../../exceptions/domain-validation.exception';

describe('Email', () => {
  it('validate() returns null for a valid email', () => {
    expect(Email.validate(' Leon@example.com ')).toBeNull();
  });

  it('validate() returns a message when the email is blank', () => {
    expect(Email.validate('')).toBe('Email is required.');
  });

  it('validate() returns a message for an invalid format', () => {
    expect(Email.validate('not-an-email')).toBe(
      'Email is not a valid address.',
    );
  });

  it('create() builds the VO, trims, and lowercases', () => {
    expect(Email.create(' Leon@Example.com ').value).toBe('leon@example.com');
  });

  it('create() throws on an invalid email', () => {
    expect(() => Email.create('bad')).toThrow(DomainValidationException);
  });

  it('from() skips validation', () => {
    expect(Email.from('WHATEVER@X.com').value).toBe('WHATEVER@X.com');
  });

  it('equals() compares the value', () => {
    expect(Email.create('a@b.com').equals(Email.from('a@b.com'))).toBe(true);
  });
});

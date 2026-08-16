import { User } from './user.entity';
import { Email } from '../value-objects/email.vo';
import { Username } from '../value-objects/username.vo';
import { HashedPassword } from '../value-objects/hashed-password.vo';
import { AccountStateValue } from '../value-objects/account-state.vo';
import { ValidationException } from '../exceptions/validation.exception';

describe('User', () => {
  it('validate() collects one error per bad field', () => {
    const notification = User.validate('', 'AB', 'weak');
    expect(notification.hasErrors).toBe(true);
    expect(notification.includes('email')).toBe(true);
    expect(notification.includes('username')).toBe(true);
    expect(notification.includes('password')).toBe(true);
  });

  it('validate() returns no errors for valid input', () => {
    const notification = User.validate('a@b.com', 'morgan', 'Password1');
    expect(notification.hasErrors).toBe(false);
  });

  it('create() builds an unverified user with generated id and timestamps', () => {
    const user = User.create(
      Email.create('a@b.com'),
      Username.create('morgan'),
      HashedPassword.fromHash('hash'),
    );
    expect(user.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(user.email).toBe('a@b.com');
    expect(user.username).toBe('morgan');
    expect(user.passwordHash).toBe('hash');
    expect(user.accountState.value).toBe(AccountStateValue.Unverified);
    expect(user.isEmailVerified).toBe(false);
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it('reconstitute() rebuilds a user from stored data without validation', () => {
    const user = User.reconstitute(
      'id-1',
      'a@b.com',
      'morgan',
      'hash',
      'active',
      new Date('2026-01-01'),
      new Date('2026-01-01'),
      new Date('2026-01-02'),
    );
    expect(user.id).toBe('id-1');
    expect(user.accountState.value).toBe(AccountStateValue.Active);
    expect(user.isEmailVerified).toBe(true);
    expect(user.updatedAt).toEqual(new Date('2026-01-02'));
  });

  it('markEmailAsVerified() sets the verified time and advances updatedAt', () => {
    const user = User.create(
      Email.create('a@b.com'),
      Username.create('morgan'),
      HashedPassword.fromHash('hash'),
    );
    const before = user.updatedAt;
    user.markEmailAsVerified();
    expect(user.isEmailVerified).toBe(true);
    expect(user.emailVerifiedAt).not.toBeNull();
    expect(user.accountState.value).toBe(AccountStateValue.Active);
    expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('create() does not run validation (the use case validates first)', () => {
    expect(() =>
      User.create(
        Email.from('bad'),
        Username.from('AB'),
        HashedPassword.fromHash('hash'),
      ),
    ).not.toThrow(ValidationException);
  });
});

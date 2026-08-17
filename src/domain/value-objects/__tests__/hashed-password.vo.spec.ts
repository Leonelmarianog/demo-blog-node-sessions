import { HashedPassword } from '../hashed-password.vo';

describe('HashedPassword', () => {
  it('fromHash() stores the hash string', () => {
    expect(HashedPassword.fromHash('$argon2id$hash').value).toBe(
      '$argon2id$hash',
    );
  });
});

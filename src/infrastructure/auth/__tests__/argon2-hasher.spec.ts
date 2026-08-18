import { Argon2Hasher } from '../argon2-hasher';

describe('Argon2Hasher', () => {
  const hasher = new Argon2Hasher();

  it('hashes a password and verifies it', async () => {
    const hash = await hasher.hash('Password1');
    expect(hash).not.toBe('Password1');
    expect(await hasher.verify('Password1', hash)).toBe(true);
  });

  it('rejects the wrong password', async () => {
    const hash = await hasher.hash('Password1');
    expect(await hasher.verify('WrongPassword1', hash)).toBe(false);
  });
});
